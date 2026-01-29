// ==================== Global Variables ====================
const FALLBACK_IMG = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600';
const BODY_SCROLL_LOCK_CLASS = 'no-scroll';
const STORAGE_KEYS = {
    cart: 'cart',
    wishlist: 'wishlist',
    theme: 'theme',
    compare: 'compare',
    reviews: 'reviews'
};
const DEBUG_MODE = new URLSearchParams(window.location.search).has('debug');

// ==================== Utility Functions ====================
function debugLog(...args) {
    if (DEBUG_MODE) {
        console.log('[DEBUG]', ...args);
    }
}

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

function persistCompare() {
    localStorage.setItem(STORAGE_KEYS.compare, JSON.stringify(compareList));
}

function persistReviews() {
    localStorage.setItem(STORAGE_KEYS.reviews, JSON.stringify(productReviews));
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

// ==================== Products Data ====================
const products = [
    // غرف المعيشة
    {
        id: 1,
        name: 'كنبة مودرن فاخرة',
        price: 2799,
        oldPrice: 3999,
        category: 'غرف المعيشة',
        badge: '-30%',
        image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500',
        rating: 4.5,
        reviews: 128,
        colors: ['رمادي', 'بيج', 'أزرق'],
        material: 'قماش',
        dimensions: '220x90x85 سم',
        inStock: true,
        tags: ['كنبة', 'مودرن', 'صالون']
    },
    {
        id: 2,
        name: 'كنبة زاوية كلاسيكية',
        price: 3499,
        oldPrice: 4299,
        category: 'غرف المعيشة',
        badge: '-18%',
        image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=500',
        rating: 4.7,
        reviews: 95,
        colors: ['بني', 'كريمي'],
        material: 'جلد طبيعي',
        dimensions: '280x180x90 سم',
        inStock: true,
        tags: ['كنبة', 'زاوية', 'كلاسيك']
    },
    {
        id: 3,
        name: 'طقم كنب 3+2+1',
        price: 4999,
        oldPrice: 6500,
        category: 'غرف المعيشة',
        badge: '-23%',
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500',
        rating: 4.8,
        reviews: 156,
        colors: ['أسود', 'رمادي فاتح'],
        material: 'قماش وجلد',
        dimensions: 'طقم كامل',
        inStock: true,
        tags: ['طقم', 'كنب', 'مودرن']
    },
    {
        id: 4,
        name: 'كرسي استرخاء مع مسند قدم',
        price: 1299,
        oldPrice: 1699,
        category: 'مقاعد',
        badge: 'جديد',
        image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=500',
        rating: 4.6,
        reviews: 73,
        colors: ['رمادي غامق', 'بيج'],
        material: 'قماش',
        dimensions: '85x90x100 سم',
        inStock: true,
        tags: ['كرسي', 'استرخاء', 'مودرن']
    },
    // غرف الطعام
    {
        id: 5,
        name: 'طاولة طعام خشب فاخر',
        price: 1899,
        oldPrice: 2299,
        category: 'غرف الطعام',
        badge: 'جديد',
        image: 'https://images.unsplash.com/photo-1616362348473-c767bf9eb473?w=500',
        rating: 5,
        reviews: 95,
        colors: ['بني غامق', 'عسلي'],
        material: 'خشب بلوط',
        dimensions: '180x90x75 سم',
        inStock: true,
        tags: ['طاولة', 'طعام', 'خشب']
    },
    {
        id: 6,
        name: 'طاولة طعام رخام مع 6 كراسي',
        price: 3299,
        oldPrice: 4199,
        category: 'غرف الطعام',
        badge: '-21%',
        image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=500',
        rating: 4.9,
        reviews: 142,
        colors: ['أبيض', 'أسود'],
        material: 'رخام وخشب',
        dimensions: '200x100x75 سم',
        inStock: true,
        tags: ['طاولة', 'رخام', 'فاخر']
    },
    {
        id: 7,
        name: 'بوفيه طعام عصري',
        price: 2199,
        category: 'غرف الطعام',
        image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=500',
        rating: 4.4,
        reviews: 67,
        colors: ['بني', 'أبيض'],
        material: 'خشب MDF',
        dimensions: '160x45x85 سم',
        inStock: true,
        tags: ['بوفيه', 'تخزين', 'طعام']
    },
    // مقاعد
    {
        id: 8,
        name: 'كرسي جلد إيطالي',
        price: 1199,
        oldPrice: 1499,
        category: 'مقاعد',
        badge: '-20%',
        image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500',
        rating: 4,
        reviews: 64,
        colors: ['أسود', 'بني'],
        material: 'جلد طبيعي',
        dimensions: '65x70x95 سم',
        inStock: true,
        tags: ['كرسي', 'جلد', 'فاخر']
    },
    {
        id: 9,
        name: 'كرسي هزاز خشبي',
        price: 899,
        category: 'مقاعد',
        image: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=500',
        rating: 4.3,
        reviews: 45,
        colors: ['خشبي طبيعي'],
        material: 'خشب زان',
        dimensions: '70x85x105 سم',
        inStock: true,
        tags: ['كرسي', 'هزاز', 'كلاسيك']
    },
    {
        id: 10,
        name: 'كرسي مكتب تنفيذي',
        price: 1599,
        oldPrice: 1999,
        category: 'المكاتب',
        badge: '-20%',
        image: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=500',
        rating: 4.7,
        reviews: 98,
        colors: ['أسود', 'رمادي'],
        material: 'جلد صناعي',
        dimensions: '65x70x120 سم',
        inStock: true,
        tags: ['كرسي', 'مكتب', 'تنفيذي']
    },
    // غرف النوم
    {
        id: 11,
        name: 'سرير فاخر بتصميم عصري',
        price: 3999,
        oldPrice: 4999,
        category: 'غرف النوم',
        image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500',
        rating: 4.5,
        reviews: 156,
        colors: ['رمادي', 'بيج'],
        material: 'خشب وقماش',
        dimensions: '200x180x120 سم',
        inStock: true,
        tags: ['سرير', 'مودرن', 'فاخر']
    },
    {
        id: 12,
        name: 'خزانة ملابس واسعة',
        price: 2599,
        oldPrice: 2999,
        category: 'غرف النوم',
        image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=500',
        rating: 4.7,
        reviews: 82,
        colors: ['أبيض', 'بني'],
        material: 'خشب MDF',
        dimensions: '220x60x200 سم',
        inStock: true,
        tags: ['خزانة', 'ملابس', 'تخزين']
    },
    {
        id: 13,
        name: 'تسريحة مع مرآة',
        price: 1499,
        category: 'غرف النوم',
        badge: 'جديد',
        image: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=500',
        rating: 4.6,
        reviews: 54,
        colors: ['أبيض', 'وردي فاتح'],
        material: 'خشب وزجاج',
        dimensions: '120x50x160 سم',
        inStock: true,
        tags: ['تسريحة', 'مرآة', 'غرفة نوم']
    },
    {
        id: 14,
        name: 'كومودينو عصري',
        price: 599,
        category: 'غرف النوم',
        image: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=500',
        rating: 4.2,
        reviews: 38,
        colors: ['أبيض', 'رمادي', 'خشبي'],
        material: 'خشب',
        dimensions: '45x40x55 سم',
        inStock: true,
        tags: ['كومودينو', 'تخزين', 'جانبي']
    },
    // المكاتب
    {
        id: 15,
        name: 'مكتب عمل خشبي',
        price: 1499,
        category: 'المكاتب',
        image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=500',
        rating: 4.2,
        reviews: 45,
        colors: ['بني', 'أبيض'],
        material: 'خشب',
        dimensions: '140x70x75 سم',
        inStock: true,
        tags: ['مكتب', 'عمل', 'دراسة']
    },
    {
        id: 16,
        name: 'مكتب زاوية مع أرفف',
        price: 1899,
        oldPrice: 2299,
        category: 'المكاتب',
        badge: '-17%',
        image: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=500',
        rating: 4.5,
        reviews: 71,
        colors: ['أبيض', 'أسود'],
        material: 'خشب وحديد',
        dimensions: '150x150x75 سم',
        inStock: true,
        tags: ['مكتب', 'زاوية', 'أرفف']
    },
    {
        id: 17,
        name: 'مكتبة كتب خشبية',
        price: 1299,
        category: 'المكاتب',
        image: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=500',
        rating: 4.4,
        reviews: 52,
        colors: ['بني غامق', 'خشبي فاتح'],
        material: 'خشب صلب',
        dimensions: '180x40x200 سم',
        inStock: true,
        tags: ['مكتبة', 'أرفف', 'كتب']
    },
    // إكسسوارات
    {
        id: 18,
        name: 'مرآة حائط ديكور',
        price: 499,
        category: 'إكسسوارات',
        badge: 'جديد',
        image: 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=500',
        rating: 4.3,
        reviews: 67,
        colors: ['ذهبي', 'فضي', 'أسود'],
        material: 'زجاج وإطار معدني',
        dimensions: '80x80 سم',
        inStock: true,
        tags: ['مرآة', 'ديكور', 'حائط']
    },
    {
        id: 19,
        name: 'طقم طاولات قهوة 3 قطع',
        price: 899,
        oldPrice: 1199,
        category: 'غرف المعيشة',
        badge: '-25%',
        image: 'https://images.unsplash.com/photo-1565191999001-551c187427bb?w=500',
        rating: 4.6,
        reviews: 89,
        colors: ['خشبي', 'أسود'],
        material: 'خشب وحديد',
        dimensions: 'متدرج الأحجام',
        inStock: true,
        tags: ['طاولة', 'قهوة', 'صالون']
    },
    {
        id: 20,
        name: 'رف حائط عائم',
        price: 299,
        category: 'إكسسوارات',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500',
        rating: 4.1,
        reviews: 43,
        colors: ['أبيض', 'أسود', 'خشبي'],
        material: 'خشب MDF',
        dimensions: '80x25x4 سم',
        inStock: true,
        tags: ['رف', 'حائط', 'عائم']
    }
];

// ==================== State Variables ====================
let cart = safeParse(STORAGE_KEYS.cart);
let wishlist = safeParse(STORAGE_KEYS.wishlist);
let compareList = safeParse(STORAGE_KEYS.compare);
let productReviews = safeParse(STORAGE_KEYS.reviews);
let cartTotal = 0;
let currentQuickViewProduct = null;
let appliedCoupon = null;
let activeFilters = {
    category: 'all',
    priceRange: [0, 10000],
    rating: 0,
    colors: [],
    inStock: false,
    sortBy: 'default'
};

// ==================== Toast Notifications ====================
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

// ==================== Accessibility ====================
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

// ==================== Dark Mode ====================
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

// ==================== Coupon System ====================
const COUPONS = {
    'WELCOME20': { type: 'percent', discount: 20, minAmount: 500 },
    'SAVE100': { type: 'fixed', discount: 100, minAmount: 1000 },
    'VIP30': { type: 'percent', discount: 30, minAmount: 2000 }
};

function applyCoupon() {
    const input = document.getElementById('couponInput');
    if (!input) return;
    
    const code = input.value.trim().toUpperCase();
    
    if (!code) {
        showNotification('الرجاء إدخال كود الخصم', 'warning');
        return;
    }
    
    const coupon = COUPONS[code];
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    if (!coupon) {
        showNotification('كود الخصم غير صحيح', 'error');
        return;
    }
    
    if (subtotal < coupon.minAmount) {
        showNotification(`الحد الأدنى للطلب ${formatPrice(coupon.minAmount)}`, 'warning');
        return;
    }
    
    appliedCoupon = coupon;
    updateCartTotal();
    showNotification('تم تطبيق كود الخصم بنجاح!', 'success');
    input.value = '';
}

// ==================== Advanced Filters ====================
function applyFilters() {
    let filtered = [...products];
    
    // Category filter
    if (activeFilters.category !== 'all') {
        filtered = filtered.filter(p => p.category === activeFilters.category);
    }
    
    // Price range filter
    filtered = filtered.filter(p => 
        p.price >= activeFilters.priceRange[0] && 
        p.price <= activeFilters.priceRange[1]
    );
    
    // Rating filter
    if (activeFilters.rating > 0) {
        filtered = filtered.filter(p => p.rating >= activeFilters.rating);
    }
    
    // Color filter
    if (activeFilters.colors.length > 0) {
        filtered = filtered.filter(p => 
            p.colors && p.colors.some(c => activeFilters.colors.includes(c))
        );
    }
    
    // Stock filter
    if (activeFilters.inStock) {
        filtered = filtered.filter(p => p.inStock);
    }
    
    // Sort
    switch(activeFilters.sortBy) {
        case 'price-low':
            filtered.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filtered.sort((a, b) => b.price - a.price);
            break;
        case 'rating':
            filtered.sort((a, b) => b.rating - a.rating);
            break;
        case 'name':
            filtered.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
            break;
        case 'newest':
            filtered.sort((a, b) => b.id - a.id);
            break;
    }
    
    renderProducts(filtered);
    updateFilterBadges();
}

function updateFilterBadges() {
    const activeCount = 
        (activeFilters.category !== 'all' ? 1 : 0) +
        (activeFilters.rating > 0 ? 1 : 0) +
        activeFilters.colors.length +
        (activeFilters.inStock ? 1 : 0);
    
    const badge = document.getElementById('filterBadge');
    if (badge) {
        badge.textContent = activeCount;
        badge.style.display = activeCount > 0 ? 'flex' : 'none';
    }
}

function resetFilters() {
    activeFilters = {
        category: 'all',
        priceRange: [0, 10000],
        rating: 0,
        colors: [],
        inStock: false,
        sortBy: 'default'
    };
    
    // Reset UI
    const priceSlider = document.getElementById('priceSlider');
    if (priceSlider) priceSlider.value = 10000;
    
    const ratingBtns = document.querySelectorAll('.rating-filter-btn');
    ratingBtns.forEach(btn => btn.classList.remove('active'));
    
    const colorBtns = document.querySelectorAll('.color-filter-btn');
    colorBtns.forEach(btn => btn.classList.remove('active'));
    
    const stockCheck = document.getElementById('inStockOnly');
    if (stockCheck) stockCheck.checked = false;
    
    applyFilters();
    showNotification('تم إعادة تعيين الفلاتر', 'info');
}

// ==================== Similar Products ====================
function getSimilarProducts(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return [];
    
    // Find products in same category
    let similar = products.filter(p => 
        p.id !== productId && 
        p.category === product.category
    );
    
    // If not enough, add products with similar tags
    if (similar.length < 4 && product.tags) {
        const byTags = products.filter(p => 
            p.id !== productId && 
            p.id !== similar.find(s => s.id === p.id)?.id &&
            p.tags && 
            p.tags.some(t => product.tags.includes(t))
        );
        similar = [...similar, ...byTags];
    }
    
    // Limit to 4 products
    return similar.slice(0, 4);
}

function renderSimilarProducts(productId) {
    const container = document.getElementById('similarProducts');
    if (!container) return;
    
    const similar = getSimilarProducts(productId);
    
    if (similar.length === 0) {
        container.style.display = 'none';
        return;
    }
    
    container.style.display = 'block';
    const grid = container.querySelector('.similar-products-grid');
    
    grid.innerHTML = similar.map(product => `
        <div class="similar-product-card" onclick="openProductDetails(${product.id})">
            <img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.name)}" loading="lazy">
            <div class="similar-product-info">
                <div class="similar-product-name">${escapeHTML(product.name)}</div>
                <div class="similar-product-price">${formatPrice(product.price)}</div>
                <div class="similar-product-rating">
                    ${'<i class="fas fa-star"></i>'.repeat(Math.floor(product.rating))}
                    <span>${product.rating}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// ==================== Product Details Modal ====================
function openProductDetails(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const modal = document.getElementById('productDetailsModal');
    const overlay = document.getElementById('productDetailsOverlay');
    
    if (!modal || !overlay) return;
    
    // Fill modal content
    document.getElementById('detailsProductImage').src = product.image;
    document.getElementById('detailsProductName').textContent = product.name;
    document.getElementById('detailsProductCategory').textContent = product.category;
    document.getElementById('detailsProductPrice').textContent = formatPrice(product.price);
    
    if (product.oldPrice) {
        document.getElementById('detailsProductOldPrice').textContent = formatPrice(product.oldPrice);
        document.getElementById('detailsProductOldPrice').style.display = 'inline';
    } else {
        document.getElementById('detailsProductOldPrice').style.display = 'none';
    }
    
    // Rating
    const rating = product.rating;
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    let starsHtml = '';
    for (let i = 0; i < fullStars; i++) starsHtml += '<i class="fas fa-star"></i>';
    if (hasHalf) starsHtml += '<i class="fas fa-star-half-alt"></i>';
    for (let i = fullStars + (hasHalf ? 1 : 0); i < 5; i++) starsHtml += '<i class="far fa-star"></i>';
    starsHtml += ` <span>(${product.reviews} تقييم)</span>`;
    
    document.getElementById('detailsProductRating').innerHTML = starsHtml;
    
    // Specs
    const specs = document.getElementById('detailsProductSpecs');
    specs.innerHTML = `
        <div class="spec-item"><strong>المادة:</strong> ${product.material}</div>
        <div class="spec-item"><strong>الأبعاد:</strong> ${product.dimensions}</div>
        <div class="spec-item"><strong>الألوان المتاحة:</strong> ${product.colors.join('، ')}</div>
        <div class="spec-item"><strong>الحالة:</strong> ${product.inStock ? '<span style="color: #10B981;">متوفر</span>' : '<span style="color: #EF4444;">غير متوفر</span>'}</div>
    `;
    
    // Reviews
    renderProductReviews(productId);
    
    // Similar products
    renderSimilarProducts(productId);
    
    // Store current product
    currentQuickViewProduct = product;
    
    // Open modal
    openDialog(modal, overlay);
}

function closeProductDetails() {
    const modal = document.getElementById('productDetailsModal');
    const overlay = document.getElementById('productDetailsOverlay');
    closeDialog(modal, overlay);
}

// ==================== Reviews System ====================
function renderProductReviews(productId) {
    const container = document.getElementById('productReviewsList');
    if (!container) return;
    
    const reviews = productReviews.filter(r => r.productId === productId);
    
    if (reviews.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">لا توجد تقييمات بعد. كن أول من يقيّم!</p>';
        return;
    }
    
    container.innerHTML = reviews.map(review => `
        <div class="review-item">
            <div class="review-header">
                <div class="review-author">
                    <i class="fas fa-user-circle"></i>
                    <span>${escapeHTML(review.name)}</span>
                </div>
                <div class="review-rating">
                    ${'<i class="fas fa-star"></i>'.repeat(review.rating)}
                    ${'<i class="far fa-star"></i>'.repeat(5 - review.rating)}
                </div>
            </div>
            <div class="review-date">${new Date(review.date).toLocaleDateString('ar-SA')}</div>
            <div class="review-text">${escapeHTML(review.text)}</div>
        </div>
    `).join('');
}

function submitReview(e) {
    e.preventDefault();
    
    if (!currentQuickViewProduct) return;
    
    const form = e.target;
    const name = form.querySelector('#reviewName').value.trim();
    const rating = parseInt(form.querySelector('input[name="rating"]:checked')?.value || 0);
    const text = form.querySelector('#reviewText').value.trim();
    
    if (!name || !rating || !text) {
        showNotification('الرجاء تعبئة جميع الحقول', 'error');
        return;
    }
    
    const review = {
        id: Date.now(),
        productId: currentQuickViewProduct.id,
        name,
        rating,
        text,
        date: new Date().toISOString()
    };
    
    productReviews.push(review);
    persistReviews();
    
    // Update product rating
    const productIndex = products.findIndex(p => p.id === currentQuickViewProduct.id);
    if (productIndex > -1) {
        const allReviews = productReviews.filter(r => r.productId === currentQuickViewProduct.id);
        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
        products[productIndex].rating = Math.round(avgRating * 10) / 10;
        products[productIndex].reviews = allReviews.length;
    }
    
    renderProductReviews(currentQuickViewProduct.id);
    form.reset();
    showNotification('تم إضافة تقييمك بنجاح!', 'success');
}

// ==================== Compare System ====================
function addToCompare(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    if (compareList.length >= 4) {
        showNotification('يمكنك مقارنة 4 منتجات كحد أقصى', 'warning');
        return;
    }
    
    if (compareList.find(p => p.id === productId)) {
        showNotification('المنتج موجود في المقارنة بالفعل', 'warning');
        return;
    }
    
    compareList.push(product);
    persistCompare();
    updateCompareCount();
    showNotification('تم إضافة المنتج للمقارنة', 'success');
}

function removeFromCompare(productId) {
    compareList = compareList.filter(p => p.id !== productId);
    persistCompare();
    updateCompareCount();
    renderCompareModal();
}

function updateCompareCount() {
    const badge = document.getElementById('compareBadge');
    if (badge) {
        badge.textContent = compareList.length;
        badge.style.display = compareList.length > 0 ? 'flex' : 'none';
    }
}

function openCompareModal() {
    if (compareList.length === 0) {
        showNotification('لا توجد منتجات للمقارنة', 'warning');
        return;
    }
    
    const modal = document.getElementById('compareModal');
    const overlay = document.getElementById('compareOverlay');
    
    if (!modal || !overlay) return;
    
    renderCompareModal();
    openDialog(modal, overlay);
}

function renderCompareModal() {
    const container = document.getElementById('compareContent');
    if (!container) return;
    
    if (compareList.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 40px; color: #999;">لا توجد منتجات للمقارنة</p>';
        return;
    }
    
    container.innerHTML = `
        <table class="compare-table">
            <thead>
                <tr>
                    <th>المنتج</th>
                    ${compareList.map(p => `
                        <th>
                            <img src="${escapeHTML(p.image)}" alt="${escapeHTML(p.name)}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px;">
                            <div style="margin-top: 10px; font-weight: 600;">${escapeHTML(p.name)}</div>
                            <button onclick="removeFromCompare(${p.id})" style="margin-top: 10px; padding: 5px 15px; background: #EF4444; color: white; border: none; border-radius: 5px; cursor: pointer;">
                                <i class="fas fa-times"></i> إزالة
                            </button>
                        </th>
                    `).join('')}
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>السعر</strong></td>
                    ${compareList.map(p => `<td>${formatPrice(p.price)}</td>`).join('')}
                </tr>
                <tr>
                    <td><strong>التقييم</strong></td>
                    ${compareList.map(p => `<td>${'⭐'.repeat(Math.floor(p.rating))} ${p.rating}</td>`).join('')}
                </tr>
                <tr>
                    <td><strong>الفئة</strong></td>
                    ${compareList.map(p => `<td>${escapeHTML(p.category)}</td>`).join('')}
                </tr>
                <tr>
                    <td><strong>المادة</strong></td>
                    ${compareList.map(p => `<td>${escapeHTML(p.material)}</td>`).join('')}
                </tr>
                <tr>
                    <td><strong>الأبعاد</strong></td>
                    ${compareList.map(p => `<td>${escapeHTML(p.dimensions)}</td>`).join('')}
                </tr>
                <tr>
                    <td><strong>الألوان</strong></td>
                    ${compareList.map(p => `<td>${p.colors.join('، ')}</td>`).join('')}
                </tr>
                <tr>
                    <td><strong>التوفر</strong></td>
                    ${compareList.map(p => `<td>${p.inStock ? '<span style="color: #10B981;">✓ متوفر</span>' : '<span style="color: #EF4444;">✗ غير متوفر</span>'}</td>`).join('')}
                </tr>
                <tr>
                    <td><strong>الإجراء</strong></td>
                    ${compareList.map(p => `
                        <td>
                            <button onclick="addToCart('${escapeHTML(p.name)}', ${p.price}, '${escapeHTML(p.image)}')" style="width: 100%; padding: 10px; background: #8B4513; color: white; border: none; border-radius: 5px; cursor: pointer; margin-bottom: 5px;">
                                <i class="fas fa-cart-plus"></i> أضف للسلة
                            </button>
                        </td>
                    `).join('')}
                </tr>
            </tbody>
        </table>
    `;
}

function closeCompareModal() {
    const modal = document.getElementById('compareModal');
    const overlay = document.getElementById('compareOverlay');
    closeDialog(modal, overlay);
}

// ==================== Shipping Calculator ====================
const SHIPPING_ZONES = {
    'الرياض': { price: 0, days: '1-2' },
    'جدة': { price: 30, days: '2-3' },
    'الدمام': { price: 40, days: '2-3' },
    'مكة': { price: 25, days: '2-3' },
    'المدينة': { price: 35, days: '3-4' },
    'أخرى': { price: 50, days: '3-5' }
};

function calculateShipping() {
    const city = document.getElementById('shippingCity')?.value;
    if (!city) return { price: 0, days: '1-2' };
    
    return SHIPPING_ZONES[city] || SHIPPING_ZONES['أخرى'];
}

function updateShippingCost() {
    const shipping = calculateShipping();
    const shippingCostEl = document.getElementById('shippingCost');
    const deliveryTimeEl = document.getElementById('deliveryTime');
    
    if (shippingCostEl) {
        shippingCostEl.textContent = shipping.price === 0 ? 'مجاني' : formatPrice(shipping.price);
    }
    
    if (deliveryTimeEl) {
        deliveryTimeEl.textContent = `${shipping.days} أيام`;
    }
    
    updateCartTotal();
}

// ==================== Cart Functions ====================
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
    
    // Calculate shipping
    const shipping = calculateShipping();
    const shippingCostEl = document.getElementById('cartShippingCost');
    if (shippingCostEl) {
        shippingCostEl.textContent = shipping.price === 0 ? 'مجاني' : formatPrice(shipping.price);
    }
    
    cartTotal = subtotal - discount + shipping.price;
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
        openDialog(modal, overlay);
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
    const shippingEl = document.getElementById('checkoutShipping');
    const totalEl = document.getElementById('checkoutTotal');
    
    if (!itemsContainer) return;
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let discount = 0;
    
    if (appliedCoupon) {
        discount = appliedCoupon.type === 'percent' 
            ? subtotal * (appliedCoupon.discount / 100) 
            : appliedCoupon.discount;
    }
    
    const shipping = calculateShipping();
    const total = subtotal - discount + shipping.price;
    
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
    if (shippingEl) {
        shippingEl.textContent = shipping.price === 0 ? 'مجاني' : formatPrice(shipping.price);
    }
    if (totalEl) totalEl.textContent = formatPrice(total);
}

function closeCheckout() {
    const modal = document.getElementById('checkoutModal');
    const overlay = document.getElementById('checkoutOverlay');
    closeDialog(modal, overlay);
}

function submitOrder(e) {
    e.preventDefault();
    
    const form = e.target;
    const name = form.querySelector('#checkoutName').value.trim();
    const phone = form.querySelector('#checkoutPhone').value.trim();
    const address = form.querySelector('#checkoutAddress').value.trim();
    const city = form.querySelector('#shippingCity')?.value;
    
    if (!name || !phone || !address || !city) {
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
        const shipping = calculateShipping();
        showNotification(`🎉 تم استلام طلبك بنجاح! سيتم التوصيل خلال ${shipping.days} أيام.`, 'success');
        
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

// ==================== Wishlist Functions ====================
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
    hydrateHeartsFromWishlist();
}

// ==================== Search Functions ====================
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
    const results = products.filter(p => 
        normalizeSearchText(p.name).includes(normalizedQuery) ||
        normalizeSearchText(p.category).includes(normalizedQuery) ||
        (p.tags && p.tags.some(t => normalizeSearchText(t).includes(normalizedQuery)))
    );
    
    if (results.length === 0) {
        resultsContainer.innerHTML = '<p style="color: white; margin-top: 20px;">لا توجد نتائج</p>';
        return;
    }
    
    resultsContainer.innerHTML = results.map(p => `
        <div class="search-result-item" onclick="openProductDetails(${p.id}); toggleSearch();">
            <img src="${escapeHTML(p.image)}" style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover;">
            <div>
                <div style="font-weight: 600;">${escapeHTML(p.name)}</div>
                <div style="color: #D4A574;">${formatPrice(p.price)}</div>
                <div style="font-size: 12px; color: #999;">${escapeHTML(p.category)}</div>
            </div>
        </div>
    `).join('');
}

// ==================== Other Functions ====================
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
                <div class="product-image" onclick="openProductDetails(${product.id})">
                    <img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.name)}" loading="lazy">
                    ${badgeHtml}
                    <div class="product-actions">
                        <button class="action-btn wishlist-btn" aria-label="أضف للمفضلة" onclick="event.stopPropagation()"><i class="fas fa-heart"></i></button>
                        <button class="action-btn compare-btn" aria-label="مقارنة" onclick="event.stopPropagation(); addToCompare(${product.id})"><i class="fas fa-balance-scale"></i></button>
                        <button class="action-btn share-btn" aria-label="مشاركة" onclick="event.stopPropagation()"><i class="fas fa-share-alt"></i></button>
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
        const wishlistBtn = event.target.closest('.wishlist-btn');
        const shareBtn = event.target.closest('.share-btn');

        const card = event.target.closest('.product-card');
        if (!card) return;

        if (addBtn) {
            event.stopPropagation();
            const name = card.querySelector('.product-name')?.textContent || 'منتج';
            const priceText = card.querySelector('.current-price')?.textContent || '';
            const price = parsePriceText(priceText);
            const img = card.querySelector('img')?.src || FALLBACK_IMG;
            addToCart(name, price, img);
            return;
        }

        if (wishlistBtn) {
            event.preventDefault();
            event.stopPropagation();
            const name = card.dataset.name || card.querySelector('.product-name')?.textContent || 'منتج';
            const price = parseInt(card.dataset.price) || parsePriceText(card.querySelector('.current-price')?.textContent);
            const image = card.dataset.image || card.querySelector('img')?.src || FALLBACK_IMG;

            addToWishlist(name, price, wishlistBtn, image);
            return;
        }

        if (shareBtn) {
            event.preventDefault();
            event.stopPropagation();
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

// ==================== Global Actions System ====================
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
            case 'open-compare': openCompareModal(); break;
            case 'open-filters': toggleFiltersModal(); break;
            
            case 'close-search': toggleSearch(); break;
            case 'close-checkout': closeCheckout(); break;
            case 'close-product-details': closeProductDetails(); break;
            case 'close-compare': closeCompareModal(); break;
            case 'close-filters': toggleFiltersModal(); break;
            case 'toast-close': e.target.closest('.toast')?.remove(); break;
            
            case 'cart-increase': increaseQty(parseInt(btn.dataset.index)); break;
            case 'cart-decrease': decreaseQty(parseInt(btn.dataset.index)); break;
            case 'cart-remove': removeFromCart(parseInt(btn.dataset.index)); break;
            case 'checkout': checkout(); break;
            case 'apply-coupon': applyCoupon(); break;
            
            case 'wishlist-remove': removeFromWishlist(parseInt(btn.dataset.index)); break;
            
            case 'apply-filters': applyFilters(); break;
            case 'reset-filters': resetFilters(); break;
            
            case 'scroll-top': scrollToTop(); break;
        }
    });

    document.addEventListener('submit', (e) => {
        if (e.target.dataset.action === 'submit-order') submitOrder(e);
        if (e.target.dataset.action === 'subscribe-newsletter') subscribeNewsletter(e);
        if (e.target.dataset.action === 'submit-review') submitReview(e);
    });
    
    // Shipping city change
    document.addEventListener('change', (e) => {
        if (e.target.id === 'shippingCity') {
            updateShippingCost();
        }
    });
}

// ==================== Filters Modal ====================
function toggleFiltersModal() {
    const modal = document.getElementById('filtersModal');
    const overlay = document.getElementById('filtersOverlay');
    
    if (!modal || !overlay) return;
    
    if (modal.classList.contains('active')) {
        closeDialog(modal, overlay);
    } else {
        openDialog(modal, overlay);
    }
}

// ==================== Initialization ====================
function initApp() {
    debugLog('DOMContentLoaded');
    
    applyTheme(getPreferredTheme());
    initGlobalActions();

    updateCartCount();
    updateWishlistCount();
    updateCompareCount();
    updateCartDisplay();
    updateWishlistDisplay();
    hydrateHeartsFromWishlist();
    updateFilterBadges();
    
    initFloatingCartButton();
    renderProducts(products);
    startCountdown();
    initProductEventDelegation();
    
    // Filter tabs
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            activeFilters.category = this.dataset.filter;
            applyFilters();
        });
    });
    
    // Search
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
    
    // Sort dropdown
    const sortDropdown = document.getElementById('sortProducts');
    if (sortDropdown) {
        sortDropdown.addEventListener('change', (e) => {
            activeFilters.sortBy = e.target.value;
            applyFilters();
        });
    }
    
    // Price slider
    const priceSlider = document.getElementById('priceSlider');
    const priceValue = document.getElementById('priceValue');
    if (priceSlider && priceValue) {
        priceSlider.addEventListener('input', (e) => {
            const value = e.target.value;
            priceValue.textContent = formatPrice(value);
            activeFilters.priceRange = [0, parseInt(value)];
        });
    }
    
    // Rating filters
    document.querySelectorAll('.rating-filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.rating-filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            activeFilters.rating = parseFloat(this.dataset.rating);
        });
    });
    
    // Color filters
    document.querySelectorAll('.color-filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            this.classList.toggle('active');
            const color = this.dataset.color;
            if (this.classList.contains('active')) {
                activeFilters.colors.push(color);
            } else {
                activeFilters.colors = activeFilters.colors.filter(c => c !== color);
            }
        });
    });
    
    // Stock filter
    const stockCheck = document.getElementById('inStockOnly');
    if (stockCheck) {
        stockCheck.addEventListener('change', (e) => {
            activeFilters.inStock = e.target.checked;
        });
    }
    
    // Smooth scroll
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
    
    // Back to top
    const backToTop = document.getElementById('backToTop');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 500) {
            backToTop?.classList.add('visible');
        } else {
            backToTop?.classList.remove('visible');
        }
    }, { passive: true });

    // Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (document.getElementById('cartOverlay')?.classList.contains('active')) toggleCart();
            if (document.getElementById('wishlistOverlay')?.classList.contains('active')) toggleWishlist();
            if (document.getElementById('searchOverlay')?.classList.contains('active')) toggleSearch();
            if (document.getElementById('productDetailsOverlay')?.classList.contains('active')) closeProductDetails();
            if (document.getElementById('compareOverlay')?.classList.contains('active')) closeCompareModal();
            if (document.getElementById('filtersOverlay')?.classList.contains('active')) toggleFiltersModal();
            const navLinks = document.querySelector('.nav-links');
            if (navLinks?.classList.contains('active')) toggleMobileMenu();
        }
    });
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// Storage sync
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
    if (e.key === STORAGE_KEYS.compare) {
        compareList = safeParse(STORAGE_KEYS.compare);
        updateCompareCount();
    }
    if (e.key === STORAGE_KEYS.theme) {
        applyTheme(getPreferredTheme());
    }
});

// Apply theme on load
(function initTheme() {
    applyTheme(getPreferredTheme());
})();

// System theme preference
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem(STORAGE_KEYS.theme)) {
        applyTheme(e.matches ? 'dark' : 'light');
    }
});