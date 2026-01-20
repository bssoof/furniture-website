// متغيرات عامة
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
let cartTotal = 0;

// ========== وظائف السلة ==========

// تحديث عدد عناصر السلة
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').textContent = totalItems;
    updateCartTotal();
}

// إضافة منتج للسلة
function addToCart(productName, price) {
    const existingIndex = cart.findIndex(item => item.name === productName);
    
    if (existingIndex > -1) {
        cart[existingIndex].quantity++;
    } else {
        const product = {
            id: Date.now(),
            name: productName,
            price: price,
            quantity: 1
        };
        cart.push(product);
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    updateCartDisplay();
    showNotification(`تم إضافة ${productName} إلى السلة`, 'success');
}

// عرض السلة
function toggleCart() {
    const cartOverlay = document.getElementById('cartOverlay');
    const cartSidebar = document.querySelector('.cart-sidebar');
    cartOverlay.classList.toggle('active');
    cartSidebar.classList.toggle('active');
    document.body.style.overflow = cartOverlay.classList.contains('active') ? 'hidden' : '';
    updateCartDisplay();
}

// تحديث عرض السلة
function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    
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
                <img src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=100" alt="${item.name}">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${item.price.toLocaleString()} ر.س</div>
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
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    updateCartDisplay();
    showNotification(`تم حذف ${itemName} من السلة`, 'error');
}

// زيادة الكمية
function increaseQty(index) {
    cart[index].quantity++;
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
    updateCartCount();
}

// تقليل الكمية
function decreaseQty(index) {
    if (cart[index].quantity > 1) {
        cart[index].quantity--;
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartDisplay();
        updateCartCount();
    } else {
        removeFromCart(index);
    }
}

// تحديث إجمالي السلة
function updateCartTotal() {
    cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('cartTotal').textContent = cartTotal.toLocaleString() + ' ر.س';
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
    wishlistOverlay.classList.toggle('active');
    wishlistSidebar.classList.toggle('active');
    document.body.style.overflow = wishlistOverlay.classList.contains('active') ? 'hidden' : '';
    updateWishlistDisplay();
}

function addToWishlist(productName, price, button) {
    const existingIndex = wishlist.findIndex(item => item.name === productName);
    
    if (existingIndex > -1) {
        wishlist.splice(existingIndex, 1);
        button.classList.remove('active');
        showNotification(`تم إزالة ${productName} من المفضلة`, 'error');
    } else {
        wishlist.push({ name: productName, price: price });
        button.classList.add('active');
        showNotification(`تم إضافة ${productName} إلى المفضلة`, 'success');
    }
    
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
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
                <img src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=100" alt="${item.name}">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${item.price.toLocaleString()} ر.س</div>
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
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    updateWishlistCount();
    updateWishlistDisplay();
    showNotification(`تم إزالة ${itemName} من المفضلة`, 'error');
}

// ========== وظائف البحث ==========

function toggleSearch() {
    const searchOverlay = document.getElementById('searchOverlay');
    searchOverlay.classList.toggle('active');
    if (searchOverlay.classList.contains('active')) {
        document.getElementById('searchInput').focus();
    }
    document.body.style.overflow = searchOverlay.classList.contains('active') ? 'hidden' : '';
}

function searchProducts(event) {
    if (event.key === 'Enter') {
        performSearch();
    }
}

function performSearch() {
    const query = document.getElementById('searchInput').value.trim();
    const resultsContainer = document.getElementById('searchResults');
    
    if (!query) {
        resultsContainer.innerHTML = '';
        return;
    }
    
    // محاكاة نتائج البحث
    const products = [
        { name: 'كنبة مودرن فاخرة', price: 2799 },
        { name: 'طاولة طعام خشب فاخر', price: 1899 },
        { name: 'كرسي جلد إيطالي', price: 1199 },
        { name: 'سرير فاخر بتصميم عصري', price: 3999 }
    ];
    
    const results = products.filter(p => p.name.includes(query));
    
    if (results.length === 0) {
        resultsContainer.innerHTML = '<p style="color: white; margin-top: 20px;">لا توجد نتائج</p>';
        return;
    }
    
    resultsContainer.innerHTML = results.map(p => `
        <div class="search-result-item" onclick="addToCart('${p.name}', ${p.price}); toggleSearch();">
            <img src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=60" style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover;">
            <div>
                <div style="font-weight: 600;">${p.name}</div>
                <div style="color: #8B4513;">${p.price.toLocaleString()} ر.س</div>
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
}

// عرض تنبيه
function showNotification(message, type = 'success') {
    // إزالة التنبيهات السابقة
    document.querySelectorAll('.notification').forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-times-circle'}"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
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

// العودة للأعلى
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========== تهيئة الصفحة ==========
document.addEventListener('DOMContentLoaded', function() {
    // تحديث عدد السلة والمفضلة
    updateCartCount();
    updateWishlistCount();
    
    // تشغيل العد التنازلي
    startCountdown();
    
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
});
    
    // تحديث عدد السلة عند التحميل
    updateCartCount();
});

// إضافة أنماط للتنبيهات
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
