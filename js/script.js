// متغيرات عامة
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let cartTotal = 0;

// تحديث عدد عناصر السلة
function updateCartCount() {
    document.getElementById('cartCount').textContent = cart.length;
    updateCartTotal();
}

// إضافة منتج للسلة
function addToCart(productName, price) {
    const product = {
        id: Date.now(),
        name: productName,
        price: price,
        quantity: 1
    };
    
    cart.push(product);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    updateCartDisplay();
    
    // إظهار تنبيه
    showCartNotification(`تم إضافة ${productName} إلى السلة`);
}

// عرض السلة
function toggleCart() {
    const cartOverlay = document.getElementById('cartOverlay');
    cartOverlay.classList.toggle('active');
    updateCartDisplay();
}

// تحديث عرض السلة
function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; color: #999; padding: 40px 20px;">السلة فارغة حالياً</p>';
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
                        <button class="qty-btn" style="background: #ff6b6b; color: white;" onclick="removeFromCart(${index})"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            </div>
        `;
    });
    
    cartItems.innerHTML = html;
}

// حذف منتج من السلة
function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    updateCartDisplay();
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
    } else {
        removeFromCart(index);
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
    updateCartCount();
}

// تحديث إجمالي السلة
function updateCartTotal() {
    cartTotal = 0;
    cart.forEach(item => {
        cartTotal += item.price * item.quantity;
    });
    document.getElementById('cartTotal').textContent = cartTotal.toLocaleString() + ' ر.س';
}

// عرض تنبيه السلة
function showCartNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 120px;
        right: 20px;
        background: #10B981;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        z-index: 3000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// الاشتراك في النشرة البريدية
function subscribeNewsletter(e) {
    e.preventDefault();
    const form = e.target;
    const email = form.querySelector('input[type="email"]').value;
    
    console.log('البريد المشترك:', email);
    alert('شكراً للاشتراك! سنرسل لك أحدث العروض قريباً.');
    form.reset();
}

// تصفية المنتجات
document.addEventListener('DOMContentLoaded', function() {
    const filterTabs = document.querySelectorAll('.filter-tab');
    
    filterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            filterTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // يمكن إضافة منطق التصفية هنا
            console.log('الفلتر المختار:', this.textContent);
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
