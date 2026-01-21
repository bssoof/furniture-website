// متغيرات عامة
const FALLBACK_IMG = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600';
const BODY_SCROLL_LOCK_CLASS = 'no-scroll';
const STORAGE_KEYS = {
    cart: 'cart',
    wishlist: 'wishlist',
    theme: 'theme'
};

function safeParse(key) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        console.warn(`Storage parse failed for ${key}`, e);
        return [];
    }
}

let cart = safeParse(STORAGE_KEYS.cart);
let wishlist = safeParse(STORAGE_KEYS.wishlist);
let cartTotal = 0;

// ========== Scroll Progress Bar ==========
function initScrollProgress() {
    const progressBar = document.getElementById('scrollProgress');
    if (!progressBar) return;
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        progressBar.style.width = scrollPercent + '%';
    }, { passive: true });
}

// ========== Enhanced Toast Notifications ==========
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
    toast.innerHTML = `
        <div class="toast-icon"><i class="fas ${icons[type]}" aria-hidden="true"></i></div>
        <div class="toast-content">
            <div class="toast-title">${title || titles[type]}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()" aria-label="إغلاق">
            <i class="fas fa-times" aria-hidden="true"></i>
        </button>
        <div class="toast-progress" style="color: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : type === 'warning' ? '#F59E0B' : '#3B82F6'}"></div>
    `;
    
    container.appendChild(toast);
    
    // Announce to screen readers
    announceToScreenReader(message);
    
    setTimeout(() => toast.classList.add('show'), 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// ========== Animated Counters ==========
function animateCounter(element) {
    const target = parseInt(element.dataset.count);
    const duration = 2000;
    const start = 0;
    const startTime = performance.now();
    
    element.classList.add('counting');
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(start + (target - start) * easeOut);
        
        // Format large numbers
        if (current >= 1000) {
            element.textContent = (current / 1000).toFixed(current >= 10000 ? 0 : 1) + 'K';
        } else {
            element.textContent = current;
        }
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.classList.remove('counting');
        }
    }
    
    requestAnimationFrame(update);
}

function initAnimatedCounters() {
    const counters = document.querySelectorAll('.stat-number[data-count]');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.dataset.animated) {
                entry.target.dataset.animated = 'true';
                animateCounter(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => observer.observe(counter));
}

// ========== Recently Viewed ==========
const RECENTLY_VIEWED_KEY = 'recentlyViewed';
const MAX_RECENTLY_VIEWED = 8;

function getRecentlyViewed() {
    try {
        return JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY)) || [];
    } catch {
        return [];
    }
}

function addToRecentlyViewed(product) {
    let items = getRecentlyViewed();
    
    // Remove if already exists
    items = items.filter(item => item.name !== product.name);
    
    // Add to beginning
    items.unshift(product);
    
    // Keep only max items
    items = items.slice(0, MAX_RECENTLY_VIEWED);
    
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(items));
    renderRecentlyViewed();
}

function renderRecentlyViewed() {
    const section = document.getElementById('recentlyViewed');
    const grid = document.getElementById('recentlyViewedGrid');
    const items = getRecentlyViewed();
    
    if (!section || !grid) return;
    
    if (items.length === 0) {
        section.style.display = 'none';
        return;
    }
    
    section.style.display = 'block';
    grid.innerHTML = items.map(item => `
        <div class="recently-viewed-item" onclick="openQuickView('${item.name}', ${item.price}, '${item.image}', '${item.category}', ${item.oldPrice || 'null'}, null)">
            <img src="${item.image}" alt="${item.name}" loading="lazy">
            <div class="item-info">
                <div class="item-name">${item.name}</div>
                <div class="item-price">${formatPrice(item.price)}</div>
            </div>
        </div>
    `).join('');
}

// ========== Image Lightbox ==========
let lightboxImages = [];
let lightboxCurrentIndex = 0;

function openLightbox(imageSrc, caption = '', images = null, currentIndex = 0) {
    const overlay = document.getElementById('lightboxOverlay');
    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightboxImage');
    const captionEl = document.getElementById('lightboxCaption');
    const counter = document.getElementById('lightboxCounter');
    
    if (!overlay || !lightbox) return;
    
    if (images && images.length > 0) {
        lightboxImages = images;
        lightboxCurrentIndex = currentIndex;
    } else {
        lightboxImages = [{ src: imageSrc, caption: caption }];
        lightboxCurrentIndex = 0;
    }
    
    updateLightboxImage();
    
    overlay.classList.add('active');
    lightbox.classList.add('active');
    setBodyScrollLocked(true);
    
    // Keyboard navigation
    document.addEventListener('keydown', lightboxKeyHandler);
}

function updateLightboxImage() {
    const img = document.getElementById('lightboxImage');
    const captionEl = document.getElementById('lightboxCaption');
    const counter = document.getElementById('lightboxCounter');
    
    const current = lightboxImages[lightboxCurrentIndex];
    img.src = current.src;
    captionEl.textContent = current.caption || '';
    
    if (lightboxImages.length > 1) {
        counter.textContent = `${lightboxCurrentIndex + 1} / ${lightboxImages.length}`;
        counter.style.display = 'block';
    } else {
        counter.style.display = 'none';
    }
}

function closeLightbox() {
    const overlay = document.getElementById('lightboxOverlay');
    const lightbox = document.getElementById('lightbox');
    
    overlay?.classList.remove('active');
    lightbox?.classList.remove('active');
    setBodyScrollLocked(false);
    
    document.removeEventListener('keydown', lightboxKeyHandler);
}

function lightboxNext() {
    if (lightboxImages.length <= 1) return;
    lightboxCurrentIndex = (lightboxCurrentIndex + 1) % lightboxImages.length;
    updateLightboxImage();
}

function lightboxPrev() {
    if (lightboxImages.length <= 1) return;
    lightboxCurrentIndex = (lightboxCurrentIndex - 1 + lightboxImages.length) % lightboxImages.length;
    updateLightboxImage();
}

function lightboxKeyHandler(e) {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') lightboxNext();
    if (e.key === 'ArrowRight') lightboxPrev();
}

function initImageLightbox() {
    // Make product images clickable to open lightbox
    document.querySelectorAll('.product-card .product-image img').forEach((img, index) => {
        img.style.cursor = 'zoom-in';
        img.addEventListener('click', () => {
            const allImages = Array.from(document.querySelectorAll('.product-card .product-image img')).map(i => ({
                src: i.src.replace('w=500', 'w=1200'),
                caption: i.alt
            }));
            openLightbox(img.src.replace('w=500', 'w=1200'), img.alt, allImages, index);
        });
    });
}

// ========== Button Loading States ==========
function setButtonLoading(button, loading = true) {
    if (loading) {
        button.classList.add('btn-loading');
        button.disabled = true;
    } else {
        button.classList.remove('btn-loading');
        button.disabled = false;
    }
}

// ========== Form Validation ==========
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
    return /^[\d\s\-+()]{9,}$/.test(phone);
}

function showFieldError(input, message) {
    clearFieldError(input);
    input.classList.add('error');
    input.classList.remove('success');
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'form-error';
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    input.parentNode.appendChild(errorDiv);
}

function clearFieldError(input) {
    input.classList.remove('error');
    const error = input.parentNode.querySelector('.form-error');
    if (error) error.remove();
}

function showFieldSuccess(input) {
    clearFieldError(input);
    input.classList.add('success');
}

function validateField(input) {
    const value = input.value.trim();
    const type = input.type;
    const required = input.required;
    
    if (required && !value) {
        showFieldError(input, 'هذا الحقل مطلوب');
        return false;
    }
    
    if (type === 'email' && value && !validateEmail(value)) {
        showFieldError(input, 'البريد الإلكتروني غير صالح');
        return false;
    }
    
    if (type === 'tel' && value && !validatePhone(value)) {
        showFieldError(input, 'رقم الهاتف غير صالح');
        return false;
    }
    
    if (value) {
        showFieldSuccess(input);
    } else {
        clearFieldError(input);
    }
    return true;
}

// ========== Floating Cart Button ==========
function initFloatingCartButton() {
    // Create FAB container
    let fabContainer = document.querySelector('.fab-container');
    if (!fabContainer) {
        fabContainer = document.createElement('div');
        fabContainer.className = 'fab-container';
        fabContainer.innerHTML = `
            <button class="fab fab-cart" onclick="toggleCart()" aria-label="سلة التسوق">
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

function updateFabCartBadge() {
    const badge = document.getElementById('fabCartBadge');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (badge) {
        badge.textContent = totalItems;
        badge.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

// ========== Quick View ==========
let currentQuickViewProduct = null;

function openQuickView(name, price, image, category = 'أثاث', oldPrice = null, badge = null, rating = 4.5) {
    const overlay = document.getElementById('quickViewOverlay');
    const modal = document.getElementById('quickViewModal');
    
    // Set product data
    document.getElementById('quickViewImage').src = image;
    document.getElementById('quickViewImage').alt = name;
    document.getElementById('quickViewName').textContent = name;
    document.getElementById('quickViewPrice').textContent = formatPrice(price);
    document.getElementById('quickViewCategory').textContent = category;
    document.getElementById('quickViewQty').value = 1;
    
    // Old price
    const oldPriceEl = document.getElementById('quickViewOldPrice');
    if (oldPrice) {
        oldPriceEl.textContent = formatPrice(oldPrice);
        oldPriceEl.style.display = 'inline';
    } else {
        oldPriceEl.style.display = 'none';
    }
    
    // Badge
    const badgeEl = document.getElementById('quickViewBadge');
    if (badge) {
        badgeEl.textContent = badge;
        badgeEl.className = 'quick-view-badge ' + (badge.includes('%') ? 'sale' : 'new');
        badgeEl.style.display = 'block';
    } else {
        badgeEl.style.display = 'none';
    }
    
    // Rating
    const ratingEl = document.getElementById('quickViewRating');
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    let starsHtml = '';
    for (let i = 0; i < fullStars; i++) starsHtml += '<i class="fas fa-star"></i>';
    if (hasHalf) starsHtml += '<i class="fas fa-star-half-alt"></i>';
    for (let i = fullStars + (hasHalf ? 1 : 0); i < 5; i++) starsHtml += '<i class="far fa-star"></i>';
    starsHtml += `<span>(${Math.floor(Math.random() * 200 + 50)} تقييم)</span>`;
    ratingEl.innerHTML = starsHtml;
    
    currentQuickViewProduct = { name, price, image, category, oldPrice };
    
    // Add to recently viewed
    addToRecentlyViewed(currentQuickViewProduct);
    
    // Show modal
    overlay.classList.add('active');
    modal.classList.add('active');
    setBodyScrollLocked(true);
    
    announceToScreenReader('تم فتح معاينة المنتج: ' + name);
}

function closeQuickView() {
    document.getElementById('quickViewOverlay').classList.remove('active');
    document.getElementById('quickViewModal').classList.remove('active');
    setBodyScrollLocked(false);
    currentQuickViewProduct = null;
}

function changeQuickViewQty(delta) {
    const input = document.getElementById('quickViewQty');
    let val = parseInt(input.value) + delta;
    if (val < 1) val = 1;
    if (val > 10) val = 10;
    input.value = val;
}

function addFromQuickView() {
    if (!currentQuickViewProduct) return;
    const qty = parseInt(document.getElementById('quickViewQty').value);
    
    for (let i = 0; i < qty; i++) {
        addToCart(currentQuickViewProduct.name, currentQuickViewProduct.price, currentQuickViewProduct.image);
    }
    
    closeQuickView();
}

function addToWishlistFromQuickView() {
    if (!currentQuickViewProduct) return;
    
    const existingIndex = wishlist.findIndex(item => item.name === currentQuickViewProduct.name);
    if (existingIndex > -1) {
        showToast('المنتج موجود بالفعل في المفضلة', 'warning');
    } else {
        wishlist.push({
            name: currentQuickViewProduct.name,
            price: currentQuickViewProduct.price,
            image: currentQuickViewProduct.image
        });
        persistWishlist();
        updateWishlistCount();
        showToast('تم إضافة المنتج للمفضلة', 'success');
    }
}

function shareProduct() {
    if (!currentQuickViewProduct) return;
    
    const shareData = {
        title: currentQuickViewProduct.name,
        text: `شاهد هذا المنتج: ${currentQuickViewProduct.name} - ${formatPrice(currentQuickViewProduct.price)}`,
        url: window.location.href
    };
    
    if (navigator.share) {
        navigator.share(shareData).catch(() => {});
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(shareData.url).then(() => {
            showToast('تم نسخ الرابط!', 'success');
        });
    }
}

// ========== Coupon System ==========
const COUPONS = {
    'WELCOME10': { discount: 10, type: 'percent', minOrder: 0 },
    'SAVE20': { discount: 20, type: 'percent', minOrder: 500 },
    'FLAT50': { discount: 50, type: 'fixed', minOrder: 200 },
    'VIP25': { discount: 25, type: 'percent', minOrder: 1000 }
};

let appliedCoupon = null;

function applyCoupon() {
    const input = document.getElementById('couponInput');
    const code = input.value.trim().toUpperCase();
    
    if (!code) {
        showToast('الرجاء إدخال كود الخصم', 'warning');
        return;
    }
    
    if (appliedCoupon) {
        showToast('يوجد كوبون مطبق بالفعل', 'warning');
        return;
    }
    
    const coupon = COUPONS[code];
    
    if (!coupon) {
        showToast('كود الخصم غير صالح', 'error');
        input.value = '';
        return;
    }
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    if (subtotal < coupon.minOrder) {
        showToast(`الحد الأدنى للطلب ${formatPrice(coupon.minOrder)}`, 'warning');
        return;
    }
    
    appliedCoupon = { code, ...coupon };
    input.value = code;
    input.disabled = true;
    
    updateCartTotal();
    showToast(`تم تطبيق كود الخصم: ${coupon.type === 'percent' ? coupon.discount + '%' : formatPrice(coupon.discount)}`, 'success', '🎉 مبروك!');
}

function removeCoupon() {
    appliedCoupon = null;
    const input = document.getElementById('couponInput');
    if (input) {
        input.value = '';
        input.disabled = false;
    }
    updateCartTotal();
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
}

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

// ========== Accessibility - Focus Trap ==========
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
    
    // Trap focus
    dialogEl._cleanupFocusTrap = trapFocus(dialogEl);
    
    // Close on Escape
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
    
    // Cleanup
    if (dialogEl._cleanupFocusTrap) dialogEl._cleanupFocusTrap();
    if (dialogEl._handleEscape) document.removeEventListener('keydown', dialogEl._handleEscape);
    
    // Return focus
    if (lastFocusedElement) lastFocusedElement.focus();
}

// Announce dynamic content for screen readers
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

function formatPrice(num) {
    return Number(num || 0).toLocaleString() + ' ر.س';
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

// ========== Image Loading ==========
function initImageLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    images.forEach(img => {
        if (img.complete) {
            img.classList.add('loaded');
        } else {
            img.classList.add('loading');
            img.addEventListener('load', () => {
                img.classList.remove('loading');
                img.classList.add('loaded');
            });
            img.addEventListener('error', () => {
                img.src = FALLBACK_IMG;
                img.classList.remove('loading');
                img.classList.add('loaded');
            });
        }
    });
}

// ========== Skeleton Loading ==========
function createSkeletonCard() {
    return `
        <div class="skeleton-card">
            <div class="skeleton-image skeleton"></div>
            <div class="skeleton-content">
                <div class="skeleton-text short skeleton"></div>
                <div class="skeleton-text medium skeleton"></div>
                <div class="skeleton-text long skeleton"></div>
                <div class="skeleton-price skeleton"></div>
                <div class="skeleton-button skeleton"></div>
            </div>
        </div>
    `;
}

function showProductsSkeleton(count = 4) {
    const grid = document.querySelector('.products-grid');
    if (!grid) return;
    grid.innerHTML = Array(count).fill(createSkeletonCard()).join('');
}

function hideSkeleton() {
    document.querySelectorAll('.skeleton-card').forEach(el => el.remove());
}

// ========== وظائف السلة ==========

// تحديث عدد عناصر السلة
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').textContent = totalItems;
    updateFabCartBadge();
    updateCartTotal();
}

// إضافة منتج للسلة
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
}

// عرض السلة
function toggleCart() {
    const cartOverlay = document.getElementById('cartOverlay');
    const cartSidebar = document.querySelector('.cart-sidebar');
    const isActive = cartSidebar.classList.contains('active');
    
    if (isActive) {
        closeDialog(cartSidebar, cartOverlay);
    } else {
        openDialog(cartSidebar, cartOverlay);
        updateCartDisplay();
        announceToScreenReader('تم فتح سلة التسوق');
    }
}

// تحديث عرض السلة
function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    if (!cartItems) return;
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: #999;">
                <i class="fas fa-shopping-cart" style="font-size: 60px; margin-bottom: 20px; opacity: 0.3;"></i>
                <p>السلة فارغة حالياً</p>
                <button onclick="toggleCart()" style="margin-top: 20px; padding: 12px 30px; background: #D4A574; color: white; border: none; border-radius: 25px; cursor: pointer;">تابع التسوق</button>
            </div>
        `;
        return;
    }
    
    let html = '';
    cart.forEach((item, index) => {
        html += `
            <div class="cart-item">
                <img src="${item.image || FALLBACK_IMG}" alt="${item.name}">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${formatPrice(item.price)}</div>
                    <div class="cart-item-qty">
                        <button class="qty-btn" onclick="decreaseQty(${index})">-</button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn" onclick="increaseQty(${index})">+</button>
                        <button class="qty-btn" style="background: #EF4444; color: white;" onclick="removeFromCart(${index})"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            </div>
        `;
    });
    
    cartItems.innerHTML = html;
}

// حذف منتج من السلة
function removeFromCart(index) {
    const itemName = cart[index].name;
    cart.splice(index, 1);
    persistCart();
    updateCartCount();
    updateCartDisplay();
    showNotification(`تم حذف ${itemName} من السلة`, 'error');
}

// زيادة الكمية
function increaseQty(index) {
    cart[index].quantity++;
    persistCart();
    updateCartDisplay();
    updateCartCount();
}

// تقليل الكمية
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

// تحديث إجمالي السلة
function updateCartTotal() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Update subtotal
    const subtotalEl = document.getElementById('cartSubtotal');
    if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
    
    // Calculate discount
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
    
    // Final total
    cartTotal = subtotal - discount;
    const totalEl = document.getElementById('cartTotal');
    if (totalEl) totalEl.textContent = formatPrice(cartTotal);
}

// الدفع
function checkout() {
    if (cart.length === 0) {
        showNotification('السلة فارغة!', 'error');
        return;
    }
    showNotification('جاري تحويلك لصفحة الدفع...', 'success');
}

// ========== وظائف المفضلة ==========

function toggleWishlist() {
    const wishlistOverlay = document.getElementById('wishlistOverlay');
    const wishlistSidebar = document.getElementById('wishlistSidebar');
    const isActive = wishlistSidebar.classList.contains('active');
    
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
                <img src="${item.image || FALLBACK_IMG}" alt="${item.name}">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${formatPrice(item.price)}</div>
                    <div style="display: flex; gap: 10px; margin-top: 10px;">
                        <button onclick="addToCart('${item.name}', ${item.price})" style="flex: 1; padding: 8px; background: #8B4513; color: white; border: none; border-radius: 5px; cursor: pointer;">
                            <i class="fas fa-cart-plus"></i> أضف للسلة
                        </button>
                        <button onclick="removeFromWishlist(${index})" style="padding: 8px 12px; background: #EF4444; color: white; border: none; border-radius: 5px; cursor: pointer;">
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
}

// ========== وظائف البحث ==========

function toggleSearch() {
    const searchOverlay = document.getElementById('searchOverlay');
    const searchContainer = searchOverlay.querySelector('.search-container');
    const isActive = searchOverlay.classList.contains('active');
    
    if (isActive) {
        closeDialog(searchOverlay, null);
    } else {
        openDialog(searchOverlay, null);
        document.getElementById('searchInput').focus();
        announceToScreenReader('تم فتح نافذة البحث');
    }
}

function searchProducts(event) {
    if (event.key === 'Enter') {
        performSearch(true);
    } else {
        performSearchDebounced();
    }
}

const performSearchDebounced = debounce(() => performSearch(false), 200);

function performSearch(isSubmit = false) {
    const query = document.getElementById('searchInput').value.trim();
    const resultsContainer = document.getElementById('searchResults');
    if (!resultsContainer) return;
    
    if (!query) {
        resultsContainer.innerHTML = '';
        return;
    }
    
    // محاكاة نتائج البحث
    const products = [
        { name: 'كنبة مودرن فاخرة', price: 2799 },
        { name: 'طاولة طعام خشب فاخر', price: 1899 },
        { name: 'كرسي جلد إيطالي', price: 1199 },
        { name: 'سرير فاخر بتصميم عصري', price: 3999 },
        { name: 'مكتب عمل خشبي', price: 1499 },
        { name: 'خزانة ملابس واسعة', price: 2599 }
    ];
    
    const results = products.filter(p => p.name.includes(query));
    
    if (results.length === 0) {
        resultsContainer.innerHTML = '<p style="color: white; margin-top: 20px;">لا توجد نتائج</p>';
        return;
    }
    
    resultsContainer.innerHTML = results.map(p => `
        <div class="search-result-item" onclick="addToCart('${p.name}', ${p.price}); toggleSearch();">
            <img src="${FALLBACK_IMG}&w=120" style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover;">
            <div>
                <div style="font-weight: 600;">${p.name}</div>
                <div style="color: #8B4513;">${formatPrice(p.price)}</div>
            </div>
        </div>
    `).join('');
}

// ========== وظائف أخرى ==========

// القائمة المتنقلة للجوال
function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    const menuBtn = document.querySelector('.mobile-menu-btn');
    navLinks.classList.toggle('active');
    menuBtn.classList.toggle('active');
    setBodyScrollLocked(navLinks.classList.contains('active'));
}

// عرض تنبيه (استخدام Toast الجديد)
function showNotification(message, type = 'success') {
    showToast(message, type);
}

// الاشتراك في النشرة البريدية
function subscribeNewsletter(e) {
    e.preventDefault();
    const form = e.target;
    const email = form.querySelector('input[type="email"]').value;
    
    if (email) {
        showNotification('شكراً للاشتراك! سنرسل لك أحدث العروض قريباً.', 'success');
        form.reset();
    }
}

// العد التنازلي للعرض
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
        
        document.getElementById('days').textContent = days.toString().padStart(2, '0');
        document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
        document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
        document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
    }
    
    update();
    setInterval(update, 1000);
}

function attachProductButtons() {
    // أزرار الإضافة للسلة
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', () => {
            const card = btn.closest('.product-card');
            if (!card) return;
            const name = card.querySelector('.product-name')?.textContent || 'منتج';
            const priceText = card.querySelector('.current-price')?.textContent || '';
            const price = parsePriceText(priceText);
            const img = card.querySelector('img')?.src || FALLBACK_IMG;
            addToCart(name, price, img);
        });
    });
    
    // أزرار Quick View
    document.querySelectorAll('.quick-view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const card = btn.closest('.product-card');
            if (!card) return;
            
            const name = card.dataset.name || card.querySelector('.product-name')?.textContent || 'منتج';
            const price = parseInt(card.dataset.price) || parsePriceText(card.querySelector('.current-price')?.textContent);
            const oldPrice = card.dataset.oldPrice ? parseInt(card.dataset.oldPrice) : null;
            const image = card.dataset.image || card.querySelector('img')?.src || FALLBACK_IMG;
            const category = card.dataset.category || card.querySelector('.product-category')?.textContent || 'أثاث';
            const badge = card.dataset.badge || null;
            
            openQuickView(name, price, image, category, oldPrice, badge);
        });
    });
    
    // أزرار المفضلة
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const card = btn.closest('.product-card');
            if (!card) return;
            
            const name = card.dataset.name || card.querySelector('.product-name')?.textContent || 'منتج';
            const price = parseInt(card.dataset.price) || parsePriceText(card.querySelector('.current-price')?.textContent);
            const image = card.dataset.image || card.querySelector('img')?.src || FALLBACK_IMG;
            
            addToWishlist(name, price, btn, image);
        });
    });
    
    // أزرار المشاركة
    document.querySelectorAll('.share-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const card = btn.closest('.product-card');
            if (!card) return;
            
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
        });
    });
}

function hydrateHeartsFromWishlist() {
    document.querySelectorAll('.product-card').forEach(card => {
        const name = card.querySelector('.product-name')?.textContent;
        const heartBtn = card.querySelector('.action-btn:first-child');
        if (name && wishlist.find(item => item.name === name) && heartBtn) {
            heartBtn.classList.add('active');
        }
    });
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
});

// العودة للأعلى
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========== تهيئة الصفحة ==========
document.addEventListener('DOMContentLoaded', function() {
    // تحديث عدد السلة والمفضلة
    updateCartCount();
    updateWishlistCount();
    updateCartDisplay();
    updateWishlistDisplay();
    hydrateHeartsFromWishlist();
    
    // تهيئة تحميل الصور
    initImageLoading();
    
    // تهيئة شريط التقدم
    initScrollProgress();
    
    // تهيئة العدادات المتحركة
    initAnimatedCounters();
    
    // تهيئة زر السلة العائم
    initFloatingCartButton();
    
    // عرض المنتجات المشاهدة مؤخراً
    renderRecentlyViewed();
    
    // تهيئة Lightbox للصور
    initImageLightbox();
    
    // تشغيل العد التنازلي
    startCountdown();

    // ربط الأزرار الديناميكي
    attachProductButtons();
    
    // تصفية المنتجات
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            filterTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            showNotification(`تم التصفية: ${this.textContent}`, 'success');
        });
    });
    
    // إغلاق السلة والمفضلة عند الضغط على الـ overlay
    document.getElementById('cartOverlay')?.addEventListener('click', function(e) {
        if (e.target === this) toggleCart();
    });
    
    document.getElementById('wishlistOverlay')?.addEventListener('click', function(e) {
        if (e.target === this) toggleWishlist();
    });

    // إغلاق البحث عند الضغط على الخلفية
    document.getElementById('searchOverlay')?.addEventListener('click', function(e) {
        if (e.target === this) toggleSearch();
    });
    
    // Smooth scroll للروابط
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                document.querySelector('.nav-links')?.classList.remove('active');
                document.querySelector('.mobile-menu-btn')?.classList.remove('active');
            }
        });
    });
    
    // تأثير الـ navbar والزر العودة للأعلى عند التمرير
    const backToTop = document.getElementById('backToTop');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 500) {
            backToTop?.classList.add('visible');
        } else {
            backToTop?.classList.remove('visible');
        }
    });
    
    // تفعيل أزرار المفضلة في المنتجات
    document.querySelectorAll('.product-card .action-btn:first-child').forEach(btn => {
        btn.addEventListener('click', function() {
            const card = this.closest('.product-card');
            const name = card.querySelector('.product-name').textContent;
            const priceText = card.querySelector('.current-price').textContent;
            const price = parseInt(priceText.replace(/[^0-9]/g, ''));
            addToWishlist(name, price, this);
        });
    });
    
    // التحقق من المفضلة المحفوظة
    document.querySelectorAll('.product-card').forEach(card => {
        const name = card.querySelector('.product-name').textContent;
        const heartBtn = card.querySelector('.action-btn:first-child');
        if (wishlist.find(item => item.name === name) && heartBtn) {
            heartBtn.classList.add('active');
        }
    });

    // إغلاق النوافذ عند الضغط على زر Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (document.getElementById('cartOverlay')?.classList.contains('active')) toggleCart();
            if (document.getElementById('wishlistOverlay')?.classList.contains('active')) toggleWishlist();
            if (document.getElementById('searchOverlay')?.classList.contains('active')) toggleSearch();
            const navLinks = document.querySelector('.nav-links');
            if (navLinks?.classList.contains('active')) toggleMobileMenu();
        }
    });
});
