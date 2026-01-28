// متغيرات عامة
const FALLBACK_IMG = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600';
const BODY_SCROLL_LOCK_CLASS = 'no-scroll';
const STORAGE_KEYS = {
    cart: 'cart',
    wishlist: 'wishlist',
    theme: 'theme'
};
const DEBUG_MODE = new URLSearchParams(window.location.search).has('debug');

function debugLog(...args) {
    if (DEBUG_MODE) {
        console.log('[DEBUG]', ...args);
    }
}

// دوال مساعدة
function normalizeSearchText(text) {
    return String(text || '')
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[أإآ]/g, 'ا')
        .replace(/ة/g, 'ه')
        .replace(/ى/g, 'ي');
}

function decodeData(data) {
    try {
        return decodeURIComponent(data);
    } catch {
        return data;
    }
}

function formatPrice(num) {
    return Number(num || 0).toLocaleString() + ' ر.س';
}

function escapeHTML(text) {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function safeParse(key) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        console.warn(`Storage parse failed for ${key}`, e);
        return [];
    }
}

function persistCart() {
    localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cart));
}

function persistWishlist() {
    localStorage.setItem(STORAGE_KEYS.wishlist, JSON.stringify(wishlist));
}

function parsePriceText(text) {
    return parseInt(String(text || '').replace(/[^0-9]/g, ''), 10) || 0;
}

function setBodyScrollLocked(locked) {
    document.body.classList.toggle(BODY_SCROLL_LOCK_CLASS, locked);
}

function debounce(fn, delay = 220) {
    let t;
    return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn.apply(null, args), delay);
    };
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
    return /^[\d\s\-+()]{9,}$/.test(phone);
}

// قائمة المنتجات
const products = [
    {
        id: 1,
        name: 'كنبة مودرن فاخرة',
        price: 2799,
        oldPrice: 3999,
        category: 'غرف المعيشة',
        badge: '-30%',
        image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500',
        rating: 4.5,
        reviews: 128
    },
    {
        id: 2,
        name: 'طاولة طعام خشب فاخر',
        price: 1899,
        oldPrice: 2299,
        category: 'غرف الطعام',
        badge: 'جديد',
        image: 'https://images.unsplash.com/photo-1616362348473-c767bf9eb473?w=500',
        rating: 5,
        reviews: 95
    },
    {
        id: 3,
        name: 'كرسي جلد إيطالي',
        price: 1199,
        oldPrice: 1499,
        category: 'مقاعد',
        badge: '-20%',
        image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500',
        rating: 4,
        reviews: 64
    },
    {
        id: 4,
        name: 'سرير فاخر بتصميم عصري',
        price: 3999,
        oldPrice: 4999,
        category: 'غرف النوم',
        image: 'https://images.unsplash.com/photo-1746549844299-2867f09c9a37?w=500',
        rating: 4.5,
        reviews: 156
    },
    {
        id: 5,
        name: 'مكتب عمل خشبي',
        price: 1499,
        category: 'المكاتب',
        image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=500',
        rating: 4.2,
        reviews: 45
    },
    {
        id: 6,
        name: 'خزانة ملابس واسعة',
        price: 2599,
        oldPrice: 2999,
        category: 'غرف النوم',
        image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=500',
        rating: 4.7,
        reviews: 82
    }
];

let cart = safeParse(STORAGE_KEYS.cart);
let wishlist = safeParse(STORAGE_KEYS.wishlist);
let cartTotal = 0;
let currentQuickViewProduct = null;
let appliedCoupon = null;

// ========== Toast Notifications ==========
function createToastContainer() {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        container.setAttribute('role', 'alert');
        container.setAttribute('aria-live', 'polite');
        document.body.appendChild(container);
    }
    return container;
}

function showToast(message, type = 'success', title = null) {
    const container = createToastContainer();
    
    const icons = {
        success: 'fa-check',
        error: 'fa-times',
        warning: 'fa-exclamation',
        info: 'fa-info'
    };
    
    const titles = {
        success: 'تم بنجاح',
        error: 'خطأ',
        warning: 'تنبيه',
        info: 'معلومة'
    };
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const safeTitle = escapeHTML(title || titles[type]);
    const safeMessage = escapeHTML(message);

    toast.innerHTML = `
        <div class="toast-icon"><i class="fas ${icons[type]}" aria-hidden="true"></i></div>
        <div class="toast-content">
            <div class="toast-title">${safeTitle}</div>
            <div class="toast-message">${safeMessage}</div>
        </div>
        <button class="toast-close" data-action="toast-close" aria-label="إغلاق">
            <i class="fas fa-times" aria-hidden="true"></i>
        </button>
        <div class="toast-progress"></div>
    `;
    
    container.appendChild(toast);
    announceToScreenReader(message);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

function showNotification(message, type = 'success') {
    showToast(message, type);
}

// ========== Accessibility ==========
function announceToScreenReader(message) {
    let announcer = document.getElementById('sr-announcer');
    if (!announcer) {
        announcer = document.createElement('div');
        announcer.id = 'sr-announcer';
        announcer.setAttribute('role', 'status');
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.style.cssText = 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);border:0;';
        document.body.appendChild(announcer);
    }
    announcer.textContent = '';
    setTimeout(() => { announcer.textContent = message; }, 100);
}

const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
let lastFocusedElement = null;

function trapFocus(container) {
    const focusableElements = container.querySelectorAll(focusableSelectors);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (!firstElement) return;
    
    const handleTab = (e) => {
        if (e.key !== 'Tab') return;
        
        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    };
    
    container.addEventListener('keydown', handleTab);
    firstElement.focus();
    
    return () => container.removeEventListener('keydown', handleTab);
}

function openDialog(dialogEl, overlayEl) {
    lastFocusedElement = document.activeElement;
    dialogEl.classList.add('active');
    if (overlayEl) {
        overlayEl.classList.add('active');
        overlayEl.setAttribute('aria-hidden', 'false');
    }
    dialogEl.setAttribute('aria-hidden', 'false');
    setBodyScrollLocked(true);
    
    dialogEl._cleanupFocusTrap = trapFocus(dialogEl);
    
    dialogEl._handleEscape = (e) => {
        if (e.key === 'Escape') closeDialog(dialogEl, overlayEl);
    };
    document.addEventListener('keydown', dialogEl._handleEscape);
}

function closeDialog(dialogEl, overlayEl) {
    dialogEl.classList.remove('active');
    if (overlayEl) {
        overlayEl.classList.remove('active');
        overlayEl.setAttribute('aria-hidden', 'true');
    }
    dialogEl.setAttribute('aria-hidden', 'true');
    setBodyScrollLocked(false);
    
    if (dialogEl._cleanupFocusTrap) dialogEl._cleanupFocusTrap();
    if (dialogEl._handleEscape) document.removeEventListener('keydown', dialogEl._handleEscape);
    
    if (lastFocusedElement) lastFocusedElement.focus();
}

// ========== Dark Mode ==========
function getPreferredTheme() {
    const saved = localStorage.getItem(STORAGE_KEYS.theme);
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEYS.theme, theme);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    showNotification(next === 'dark' ? '🌙 تم تفعيل الوضع الليلي' : '☀️ تم تفعيل الوضع النهاري', 'success');
    debugLog('toggleTheme', next);
}

// ========== Cart Functions ==========
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountEl = document.getElementById('cartCount');
    if (cartCountEl) {
        cartCountEl.textContent = totalItems;
    }
    updateFabCartBadge();
    updateCartTotal();
}

function addToCart(productName, price, image = FALLBACK_IMG) {
    const existingIndex = cart.findIndex(item => item.name === productName);
    
    if (existingIndex > -1) {
        cart[existingIndex].quantity++;
    } else {
        const product = {
            id: Date.now(),
            name: productName,
            price: price,
            quantity: 1,
            image: image
        };
        cart.push(product);
    }
    
    persistCart();
    updateCartCount();
    updateCartDisplay();
    showNotification(`تم إضافة ${productName} إلى السلة`, 'success');
    debugLog('addToCart', productName, price);
}

function toggleCart() {
    const cartOverlay = document.getElementById('cartOverlay');
    const cartSidebar = document.querySelector('.cart-sidebar');
    if (!cartSidebar) return;
    
    const isActive = cartSidebar.classList.contains('active');
    debugLog('toggleCart', isActive ? 'close' : 'open');
    
    if (isActive) {
        closeDialog(cartSidebar, cartOverlay);
    } else {
        openDialog(cartSidebar, cartOverlay);
        updateCartDisplay();
        announceToScreenReader('تم فتح سلة التسوق');
    }
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    if (!cartItems) return;
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: #999;">
                <i class="fas fa-shopping-cart" style="font-size: 60px; margin-bottom: 20px; opacity: 0.3;"></i>
                <p>السلة فارغة حالياً</p>
                <button data-action="toggle-cart" style="margin-top: 20px; padding: 12px 30px; background: #D4A574; color: white; border: none; border-radius: 25px; cursor: pointer;">تابع التسوق</button>
            </div>
        `;
        return;
    }
    
    let html = '';
    cart.forEach((item, index) => {
        html += `
            <div class="cart-item">
                <img src="${escapeHTML(item.image || FALLBACK_IMG)}" alt="${escapeHTML(item.name)}">
                <div class="cart-item-info">
                    <div class="cart-item-name">${escapeHTML(item.name)}</div>
                    <div class="cart-item-price">${formatPrice(item.price)}</div>
                    <div class="cart-item-qty">
                        <button class="qty-btn" data-action="cart-decrease" data-index="${index}">-</button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn" data-action="cart-increase" data-index="${index}">+</button>
                        <button class="qty-btn" style="background: #EF4444; color: white;" data-action="cart-remove" data-index="${index}"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            </div>
        `;
    });
    
    cartItems.innerHTML = html;
}

function removeFromCart(index) {
    const itemName = cart[index].name;
    cart.splice(index, 1);
    persistCart();
    updateCartCount();
    updateCartDisplay();
    showNotification(`تم حذف ${itemName} من السلة`, 'error');
}

function increaseQty(index) {
    cart[index].quantity++;
    persistCart();
    updateCartDisplay();
    updateCartCount();
}

function decreaseQty(index) {
    if (cart[index].quantity > 1) {
        cart[index].quantity--;
        persistCart();
        updateCartDisplay();
        updateCartCount();
    } else {
        removeFromCart(index);
    }
}

function updateCartTotal() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const subtotalEl = document.getElementById('cartSubtotal');
    if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
    
    let discount = 0;
    const discountRow = document.getElementById('discountRow');
    const discountAmountEl = document.getElementById('discountAmount');
    
    if (appliedCoupon && subtotal > 0) {
        if (appliedCoupon.type === 'percent') {
            discount = subtotal * (appliedCoupon.discount / 100);
        } else {
            discount = appliedCoupon.discount;
        }
        
        if (discountRow) discountRow.style.display = 'flex';
        if (discountAmountEl) discountAmountEl.textContent = '-' + formatPrice(discount);
    } else {
        if (discountRow) discountRow.style.display = 'none';
    }
    
    cartTotal = subtotal - discount;
    const totalEl = document.getElementById('cartTotal');
    if (totalEl) totalEl.textContent = formatPrice(cartTotal);
}

function checkout() {
    if (cart.length === 0) {
        showNotification('السلة فارغة!', 'error');
        return;
    }
    
    const modal = document.getElementById('checkoutModal');
    const overlay = document.getElementById('checkoutOverlay');
    
    if (modal && overlay) {
        updateCheckoutSummary();
        overlay.classList.add('active');
        modal.classList.add('active');
        setBodyScrollLocked(true);
    } else {
        showNotification('🎉 شكراً لك! سيتم التواصل معك قريباً لتأكيد الطلب.', 'success');
        cart = [];
        appliedCoupon = null;
        persistCart();
        updateCartCount();
        updateCartDisplay();
        toggleCart();
    }
}

function updateCheckoutSummary() {
    const itemsContainer = document.getElementById('checkoutItems');
    const subtotalEl = document.getElementById('checkoutSubtotal');
    const discountEl = document.getElementById('checkoutDiscount');
    const totalEl = document.getElementById('checkoutTotal');
    
    if (!itemsContainer) return;
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let discount = 0;
    
    if (appliedCoupon) {
        discount = appliedCoupon.type === 'percent' 
            ? subtotal * (appliedCoupon.discount / 100) 
            : appliedCoupon.discount;
    }
    
    const total = subtotal - discount;
    
    itemsContainer.innerHTML = cart.map(item => `
        <div class="checkout-item">
            <img src="${escapeHTML(item.image || FALLBACK_IMG)}" alt="${escapeHTML(item.name)}">
            <div class="checkout-item-info">
                <div class="checkout-item-name">${escapeHTML(item.name)}</div>
                <div class="checkout-item-qty">الكمية: ${item.quantity}</div>
            </div>
            <div class="checkout-item-price">${formatPrice(item.price * item.quantity)}</div>
        </div>
    `).join('');
    
    if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
    if (discountEl) {
        discountEl.textContent = discount > 0 ? '-' + formatPrice(discount) : formatPrice(0);
    }
    if (totalEl) totalEl.textContent = formatPrice(total);
}

function closeCheckout() {
    const modal = document.getElementById('checkoutModal');
    const overlay = document.getElementById('checkoutOverlay');
    if (modal) modal.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    setBodyScrollLocked(false);
}

function submitOrder(e) {
    e.preventDefault();
    
    const form = e.target;
    const name = form.querySelector('#checkoutName').value.trim();
    const phone = form.querySelector('#checkoutPhone').value.trim();
    const address = form.querySelector('#checkoutAddress').value.trim();
    
    if (!name || !phone || !address) {
        showNotification('الرجاء تعبئة جميع الحقول', 'error');
        return;
    }
    
    if (!validatePhone(phone)) {
        showNotification('رقم الهاتف غير صالح', 'error');
        return;
    }
    
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري إرسال الطلب...';
    
    setTimeout(() => {
        showNotification('🎉 تم استلام طلبك بنجاح! سنتواصل معك قريباً.', 'success');
        
        cart = [];
        appliedCoupon = null;
        persistCart();
        updateCartCount();
        updateCartDisplay();
        
        closeCheckout();
        toggleCart();
        
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-check"></i> تأكيد الطلب';
        
        form.reset();
    }, 1500);
}

// ========== Wishlist Functions ==========
function toggleWishlist() {
    const wishlistOverlay = document.getElementById('wishlistOverlay');
    const wishlistSidebar = document.getElementById('wishlistSidebar');
    if (!wishlistSidebar) return;
    
    const isActive = wishlistSidebar.classList.contains('active');
    debugLog('toggleWishlist', isActive ? 'close' : 'open');
    
    if (isActive) {
        closeDialog(wishlistSidebar, wishlistOverlay);
    } else {
        openDialog(wishlistSidebar, wishlistOverlay);
        updateWishlistDisplay();
        announceToScreenReader('تم فتح قائمة المفضلة');
    }
}

function addToWishlist(productName, price, button, image = FALLBACK_IMG) {
    const existingIndex = wishlist.findIndex(item => item.name === productName);
    
    if (existingIndex > -1) {
        wishlist.splice(existingIndex, 1);
        button.classList.remove('active');
        showNotification(`تم إزالة ${productName} من المفضلة`, 'error');
    } else {
        wishlist.push({ name: productName, price: price, image: image });
        button.classList.add('active');
        showNotification(`تم إضافة ${productName} إلى المفضلة`, 'success');
    }
    
    persistWishlist();
    updateWishlistCount();
    debugLog('toggleWishlistItem', productName);
}

function updateWishlistCount() {
    const wishlistCountEl = document.getElementById('wishlistCount');
    if (wishlistCountEl) {
        wishlistCountEl.textContent = wishlist.length;
        wishlistCountEl.style.display = wishlist.length > 0 ? 'flex' : 'none';
    }
}

function updateWishlistDisplay() {
    const wishlistItems = document.getElementById('wishlistItems');
    if (!wishlistItems) return;
    
    if (wishlist.length === 0) {
        wishlistItems.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: #999;">
                <i class="fas fa-heart" style="font-size: 60px; margin-bottom: 20px; opacity: 0.3;"></i>
                <p>المفضلة فارغة</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    wishlist.forEach((item, index) => {
        html += `
            <div class="cart-item">
                <img src="${escapeHTML(item.image || FALLBACK_IMG)}" alt="${escapeHTML(item.name)}">
                <div class="cart-item-info">
                    <div class="cart-item-name">${escapeHTML(item.name)}</div>
                    <div class="cart-item-price">${formatPrice(item.price)}</div>
                    <div style="display: flex; gap: 10px; margin-top: 10px;">
                        <button onclick="addToCart(decodeURIComponent('${encodeURIComponent(item.name)}'), ${item.price}, '${escapeHTML(item.image)}')" style="flex: 1; padding: 8px; background: #8B4513; color: white; border: none; border-radius: 5px; cursor: pointer;">
                            <i class="fas fa-cart-plus"></i> أضف للسلة
                        </button>
                        <button data-action="wishlist-remove" data-index="${index}" style="padding: 8px 12px; background: #EF4444; color: white; border: none; border-radius: 5px; cursor: pointer;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    wishlistItems.innerHTML = html;
}

function removeFromWishlist(index) {
    const itemName = wishlist[index].name;
    wishlist.splice(index, 1);
    persistWishlist();
    updateWishlistCount();
    updateWishlistDisplay();
    showNotification(`تم إزالة ${itemName} من المفضلة`, 'error');
    
    // Update heart icons
    hydrateHeartsFromWishlist();
}

// ========== Search Functions ==========
function toggleSearch() {
    const searchOverlay = document.getElementById('searchOverlay');
    if (!searchOverlay) return;
    
    const isActive = searchOverlay.classList.contains('active');
    
    if (isActive) {
        closeDialog(searchOverlay, null);
    } else {
        openDialog(searchOverlay, null);
        const searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.focus();
        announceToScreenReader('تم فتح نافذة البحث');
    }
}

const performSearchDebounced = debounce(() => performSearch(false), 200);

function performSearch(isSubmit = false) {
    const searchInput = document.getElementById('searchInput');
    const resultsContainer = document.getElementById('searchResults');
    
    if (!searchInput || !resultsContainer) return;
    
    const query = searchInput.value.trim();
    
    if (!query) {
        resultsContainer.innerHTML = '';
        return;
    }
    
    const normalizedQuery = normalizeSearchText(query);
    const results = products.filter(p => normalizeSearchText(p.name).includes(normalizedQuery));
    
    if (results.length === 0) {
        resultsContainer.innerHTML = '<p style="color: white; margin-top: 20px;">لا توجد نتائج</p>';
        return;
    }
    
    resultsContainer.innerHTML = results.map(p => `
        <div class="search-result-item" onclick="addToCart(decodeURIComponent('${encodeURIComponent(p.name)}'), ${p.price}, '${escapeHTML(p.image)}'); toggleSearch();">
            <img src="${escapeHTML(p.image)}" style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover;">
            <div>
                <div style="font-weight: 600;">${escapeHTML(p.name)}</div>
                <div style="color: #8B4513;">${formatPrice(p.price)}</div>
            </div>
        </div>
    `).join('');
}

// ========== Other Functions ==========
function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    const menuBtn = document.querySelector('.mobile-menu-btn');
    if (navLinks) navLinks.classList.toggle('active');
    if (menuBtn) menuBtn.classList.toggle('active');
    setBodyScrollLocked(navLinks?.classList.contains('active'));
}

function subscribeNewsletter(e) {
    e.preventDefault();
    const form = e.target;
    const email = form.querySelector('input[type="email"]').value;
    
    if (email) {
        showNotification('شكراً للاشتراك! سنرسل لك أحدث العروض قريباً.', 'success');
        form.reset();
    }
}

function startCountdown() {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 5);
    
    function update() {
        const now = new Date();
        const diff = endDate - now;
        
        if (diff <= 0) return;
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        const daysEl = document.getElementById('days');
        const hoursEl = document.getElementById('hours');
        const minutesEl = document.getElementById('minutes');
        const secondsEl = document.getElementById('seconds');
        
        if (daysEl) daysEl.textContent = days.toString().padStart(2, '0');
        if (hoursEl) hoursEl.textContent = hours.toString().padStart(2, '0');
        if (minutesEl) minutesEl.textContent = minutes.toString().padStart(2, '0');
        if (secondsEl) secondsEl.textContent = seconds.toString().padStart(2, '0');
    }
    
    update();
    setInterval(update, 1000);
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateFabCartBadge() {
    const badge = document.getElementById('fabCartBadge');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (badge) {
        badge.textContent = totalItems;
        badge.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

function initFloatingCartButton() {
    let fabContainer = document.querySelector('.fab-container');
    if (!fabContainer) {
        fabContainer = document.createElement('div');
        fabContainer.className = 'fab-container';
        fabContainer.innerHTML = `
            <button class="fab fab-cart" data-action="toggle-cart" aria-label="سلة التسوق">
                <i class="fas fa-shopping-cart"></i>
                <span class="fab-badge" id="fabCartBadge">0</span>
            </button>
        `;
        document.body.appendChild(fabContainer);
    }
    
    const fabCart = document.querySelector('.fab-cart');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 600) {
            fabCart?.classList.add('visible');
        } else {
            fabCart?.classList.remove('visible');
        }
    }, { passive: true });
}

function hydrateHeartsFromWishlist() {
    document.querySelectorAll('.product-card').forEach(card => {
        const name = card.querySelector('.product-name')?.textContent;
        const heartBtn = card.querySelector('.wishlist-btn');
        if (name && wishlist.find(item => item.name === name) && heartBtn) {
            heartBtn.classList.add('active');
        } else if (heartBtn) {
            heartBtn.classList.remove('active');
        }
    });
}

function renderProducts(productsToRender) {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    debugLog('renderProducts', productsToRender.length);

    if (productsToRender.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-secondary);">لا توجد منتجات مطابقة</p>';
        return;
    }

    grid.innerHTML = productsToRender.map(product => {
        const fullStars = Math.floor(product.rating);
        const hasHalf = product.rating % 1 >= 0.5;
        let starsHtml = '';
        for (let i = 0; i < fullStars; i++) starsHtml += '<i class="fas fa-star"></i>';
        if (hasHalf) starsHtml += '<i class="fas fa-star-half-alt"></i>';
        for (let i = fullStars + (hasHalf ? 1 : 0); i < 5; i++) starsHtml += '<i class="far fa-star"></i>';

        let badgeHtml = '';
        if (product.badge) {
            const badgeClass = product.badge.includes('%') ? 'badge-sale' : 'badge-new';
            badgeHtml = `<span class="product-badge ${badgeClass}">${escapeHTML(product.badge)}</span>`;
        }

        let oldPriceHtml = '';
        if (product.oldPrice) {
            oldPriceHtml = `<span class="old-price">${formatPrice(product.oldPrice)}</span>`;
        }

        return `
            <div class="product-card" data-id="${product.id}" data-name="${escapeHTML(product.name)}" data-price="${product.price}" data-category="${escapeHTML(product.category)}" data-image="${escapeHTML(product.image)}" ${product.oldPrice ? `data-old-price="${product.oldPrice}"` : ''} ${product.badge ? `data-badge="${escapeHTML(product.badge)}"` : ''}>
                <div class="product-image">
                    <img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.name)}" loading="lazy">
                    ${badgeHtml}
                    <div class="product-actions">
                        <button class="action-btn wishlist-btn" aria-label="أضف للمفضلة"><i class="fas fa-heart"></i></button>
                        <button class="action-btn quick-view-btn" aria-label="معاينة سريعة"><i class="fas fa-eye"></i></button>
                        <button class="action-btn share-btn" aria-label="مشاركة"><i class="fas fa-share-alt"></i></button>
                    </div>
                </div>
                <div class="product-info">
                    <div class="product-category">${escapeHTML(product.category)}</div>
                    <h3 class="product-name">${escapeHTML(product.name)}</h3>
                    <div class="product-rating">
                        ${starsHtml}
                        <span>(${product.reviews} تقييم)</span>
                    </div>
                    <div class="product-price">
                        <span class="current-price">${formatPrice(product.price)}</span>
                        ${oldPriceHtml}
                    </div>
                    <button class="add-to-cart">
                        <i class="fas fa-cart-plus"></i>
                        أضف للسلة
                    </button>
                </div>
            </div>
        `;
    }).join('');

    hydrateHeartsFromWishlist();

    const cards = grid.querySelectorAll('.product-card');
    cards.forEach((card, index) => {
        card.style.animation = `fadeInUp 0.4s ease ${index * 0.1}s both`;
    });
}

function initProductEventDelegation() {
    const grid = document.getElementById('productsGrid');
    if (!grid || grid.dataset.actionsBound) return;
    grid.dataset.actionsBound = 'true';

    grid.addEventListener('click', (event) => {
        const addBtn = event.target.closest('.add-to-cart');
        const quickViewBtn = event.target.closest('.quick-view-btn');
        const wishlistBtn = event.target.closest('.wishlist-btn');
        const shareBtn = event.target.closest('.share-btn');

        const card = event.target.closest('.product-card');
        if (!card) return;

        if (addBtn) {
            const name = card.querySelector('.product-name')?.textContent || 'منتج';
            const priceText = card.querySelector('.current-price')?.textContent || '';
            const price = parsePriceText(priceText);
            const img = card.querySelector('img')?.src || FALLBACK_IMG;
            addToCart(name, price, img);
            return;
        }

        if (quickViewBtn) {
            event.preventDefault();
            // Quick view functionality can be added here
            return;
        }

        if (wishlistBtn) {
            event.preventDefault();
            const name = card.dataset.name || card.querySelector('.product-name')?.textContent || 'منتج';
            const price = parseInt(card.dataset.price) || parsePriceText(card.querySelector('.current-price')?.textContent);
            const image = card.dataset.image || card.querySelector('img')?.src || FALLBACK_IMG;

            addToWishlist(name, price, wishlistBtn, image);
            return;
        }

        if (shareBtn) {
            event.preventDefault();
            const name = card.dataset.name || card.querySelector('.product-name')?.textContent || 'منتج';
            const price = parseInt(card.dataset.price) || parsePriceText(card.querySelector('.current-price')?.textContent);

            const shareData = {
                title: name,
                text: `شاهد هذا المنتج: ${name} - ${formatPrice(price)}`,
                url: window.location.href
            };

            if (navigator.share) {
                navigator.share(shareData).catch(() => {});
            } else {
                navigator.clipboard.writeText(shareData.url).then(() => {
                    showToast('تم نسخ الرابط!', 'success');
                });
            }
        }
    });
}

// ========== Global Actions System ==========
function initGlobalActions() {
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        
        const action = btn.dataset.action;
        
        if (btn.tagName === 'A' && btn.getAttribute('href') === '#') e.preventDefault();
        
        switch(action) {
            case 'toggle-theme': toggleTheme(); break;
            case 'toggle-cart': toggleCart(); break;
            case 'toggle-wishlist': toggleWishlist(); break;
            case 'toggle-search': toggleSearch(); break;
            case 'toggle-mobile-menu': toggleMobileMenu(); break;
            
            case 'close-search': toggleSearch(); break;
            case 'close-checkout': closeCheckout(); break;
            case 'toast-close': e.target.closest('.toast')?.remove(); break;
            
            case 'cart-increase': increaseQty(parseInt(btn.dataset.index)); break;
            case 'cart-decrease': decreaseQty(parseInt(btn.dataset.index)); break;
            case 'cart-remove': removeFromCart(parseInt(btn.dataset.index)); break;
            case 'checkout': checkout(); break;
            
            case 'wishlist-remove': removeFromWishlist(parseInt(btn.dataset.index)); break;
            
            case 'scroll-top': scrollToTop(); break;
        }
    });

    document.addEventListener('submit', (e) => {
        if (e.target.dataset.action === 'submit-order') submitOrder(e);
        if (e.target.dataset.action === 'subscribe-newsletter') subscribeNewsletter(e);
    });
}

// ========== Initialization ==========
function initApp() {
    debugLog('DOMContentLoaded');
    
    // تطبيق الثيم
    applyTheme(getPreferredTheme());
    
    // تفعيل الأزرار (هذا هو الأهم!)
    initGlobalActions();

    // تحديث البيانات
    updateCartCount();
    updateWishlistCount();
    updateCartDisplay();
    updateWishlistDisplay();
    hydrateHeartsFromWishlist();
    
    initFloatingCartButton();
    renderProducts(products);
    startCountdown();
    initProductEventDelegation();
    
    // تفعيل التبويبات
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            const category = this.dataset.filter;
            if (category === 'all') {
                renderProducts(products);
            } else {
                const filtered = products.filter(p => p.category === category);
                renderProducts(filtered);
            }
        });
    });
    
    // تفعيل البحث
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', () => performSearchDebounced());
        searchInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                performSearch(true);
            }
        });
    }
    
    // Smooth Scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                document.querySelector('.nav-links')?.classList.remove('active');
                document.querySelector('.mobile-menu-btn')?.classList.remove('active');
            }
        });
    });
    
    // Back to Top visibility
    const backToTop = document.getElementById('backToTop');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 500) {
            backToTop?.classList.add('visible');
        } else {
            backToTop?.classList.remove('visible');
        }
    }, { passive: true });

    // Escape key handler
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (document.getElementById('cartOverlay')?.classList.contains('active')) toggleCart();
            if (document.getElementById('wishlistOverlay')?.classList.contains('active')) toggleWishlist();
            if (document.getElementById('searchOverlay')?.classList.contains('active')) toggleSearch();
            const navLinks = document.querySelector('.nav-links');
            if (navLinks?.classList.contains('active')) toggleMobileMenu();
        }
    });
}

// تهيئة عند تحميل الصفحة
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// مزامنة عبر التبويبات
window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEYS.cart) {
        cart = safeParse(STORAGE_KEYS.cart);
        updateCartCount();
        updateCartDisplay();
    }
    if (e.key === STORAGE_KEYS.wishlist) {
        wishlist = safeParse(STORAGE_KEYS.wishlist);
        updateWishlistCount();
        updateWishlistDisplay();
        hydrateHeartsFromWishlist();
    }
    if (e.key === STORAGE_KEYS.theme) {
        applyTheme(getPreferredTheme());
    }
});

// تطبيق الثيم عند التحميل
(function initTheme() {
    applyTheme(getPreferredTheme());
})();

// الاستماع لتغيير تفضيل النظام
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem(STORAGE_KEYS.theme)) {
        applyTheme(e.matches ? 'dark' : 'light');
    }
});
