# 📚 أفضل الممارسات والإرشادات

## 🎯 معايير الكود

### 1. هيكل المشروع
```
src/
├── components/      # مكونات React
├── pages/          # صفحات التطبيق
├── services/       # الخدمات والـ API
├── store/          # إدارة الحالة
├── utils/          # دوال مساعدة
├── hooks/          # React Hooks مخصصة
└── types/          # TypeScript Types (إذا استخدمت TypeScript)
```

### 2. تسمية الملفات
- **Components**: PascalCase - `UserProfile.jsx`
- **Utilities**: camelCase - `seoHelper.js`
- **Constants**: UPPER_SNAKE_CASE - `API_URLS.js`

### 3. تسمية المتغيرات والدوال
```javascript
// ✅ جيد
const getUserData = () => {}
const isUserLoggedIn = true
const MAX_RETRIES = 3

// ❌ سيء
const get_user_data = () => {}
const user_logged_in = true
const maxRetries = 3
```

---

## 🔐 أمان البيانات

### 1. حماية المعلومات الحساسة
```javascript
// ❌ لا تضع المفاتيح في الكود مباشرة
const API_KEY = "sk_live_123456789";

// ✅ استخدم متغيرات البيئة
const API_KEY = import.meta.env.VITE_API_KEY;
```

### 2. التحقق من المدخلات
```javascript
// ✅ تحقق من صحة البيانات دائماً
const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

if (!validateEmail(userEmail)) {
  throw new Error('البريد الإلكتروني غير صحيح');
}
```

### 3. المصادقة والتفويض
```javascript
// ✅ تحقق من صلاحيات المستخدم
const isAdmin = user?.role === 'admin';
if (!isAdmin) {
  throw new Error('لا تملك صلاحيات كافية');
}
```

---

## 🎨 معايير الكود

### 1. استخدام القالب
```javascript
// ❌ سيء - التكرار
<div className="bg-gray-800 p-6 rounded-2xl">
  <h2 className="text-2xl font-bold text-white">العنوان 1</h2>
</div>
<div className="bg-gray-800 p-6 rounded-2xl">
  <h2 className="text-2xl font-bold text-white">العنوان 2</h2>
</div>

// ✅ جيد - استخدام المكونات
const Card = ({ title, children }) => (
  <div className="bg-gray-800 p-6 rounded-2xl">
    <h2 className="text-2xl font-bold text-white">{title}</h2>
    {children}
  </div>
);
```

### 2. معالجة الأخطاء
```javascript
// ✅ تعامل مع الأخطاء بشكل صحيح
try {
  const data = await fetchUserData();
} catch (error) {
  console.error('Error:', error);
  showErrorNotification('فشل تحميل البيانات');
}
```

### 3. استخدام Constants
```javascript
// ✅ استخدم ثوابت بدلاً من السحر أرقام
const STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

// ❌ تجنب
if (order.status === 'pending') { }
```

---

## 🚀 الأداء

### 1. Code Splitting
```javascript
// ✅ تحميل المكونات عند الحاجة
const AdminDashboard = lazy(() => import('./AdminDashboard'));

<Suspense fallback={<Loading />}>
  <AdminDashboard />
</Suspense>
```

### 2. Memoization
```javascript
// ✅ تجنب التصيير غير الضروري
const MemoizedComponent = memo(MyComponent);

// ✅ استخدم useCallback للدوال
const handleClick = useCallback(() => {
  doSomething();
}, [dependency]);
```

### 3. Lazy Loading للصور
```javascript
// ✅ تحميل الصور بطريقة ذكية
<img 
  src={imageUrl} 
  loading="lazy"
  alt="description"
/>
```

---

## 📱 التصميم المتجاوب

### 1. استخدم Tailwind Breakpoints
```javascript
// ✅ تصميم متجاوب
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* محتوى */}
</div>
```

### 2. الاختبار على أجهزة مختلفة
```
- Desktop (1920x1080)
- Tablet (768x1024)
- Mobile (375x667)
```

---

## 🔍 تحسينات SEO

### 1. Meta Tags
```javascript
// ✅ استخدم useSEO Hook
useSEO(
  'عنوان الصفحة',
  'وصف الصفحة',
  'كلمات مفتاحية',
  'رابط الصورة'
);
```

### 2. Structured Data
```javascript
// ✅ أضف Schema.org
<script type="application/ld+json">
  {JSON.stringify(restaurantSchema)}
</script>
```

---

## 🧪 الاختبار

### 1. Unit Tests
```javascript
// ✅ اختبر الدوال والمنطق
describe('calculateTotal', () => {
  it('should calculate total correctly', () => {
    expect(calculateTotal([35, 45])).toBe(80);
  });
});
```

### 2. Integration Tests
```javascript
// ✅ اختبر التفاعل بين المكونات
it('should add item to cart', async () => {
  // ...
});
```

---

## 💾 قاعدة البيانات

### 1. قوانين Firestore
```javascript
// ✅ قوانين أمان صارمة
match /users/{userId} {
  allow read, write: if request.auth.uid == userId;
}
```

### 2. Queries المحسّنة
```javascript
// ✅ استخدم الفهارس
const q = query(
  collection(db, 'orders'),
  where('userId', '==', userId),
  orderBy('createdAt', 'desc'),
  limit(10)
);
```

---

## 📝 التوثيق

### 1. التعليقات
```javascript
// ✅ تعليقات مفيدة
// حساب السعر النهائي مع الضرائب والتوصيل
const calculateFinalPrice = () => {
  // ...
};

// ❌ تعليقات واضحة بالفعل
const x = a + b; // إضافة a و b
```

### 2. JSDoc
```javascript
/**
 * حساب السعر النهائي للطلب
 * @param {Array} items - قائمة المنتجات
 * @param {Number} shippingCost - تكلفة التوصيل
 * @returns {Number} السعر النهائي
 */
const calculateTotal = (items, shippingCost) => {
  // ...
};
```

---

## ✅ قائمة التحقق قبل الكود

- [ ] الكود يعمل محلياً
- [ ] لا توجد أخطاء في Console
- [ ] تم الاختبار على أجهزة مختلفة
- [ ] التعليقات واضحة ومفيدة
- [ ] لا توجد معلومات حساسة مكشوفة
- [ ] الأداء مقبول
- [ ] معالجة الأخطاء صحيحة

---

## 🔄 سير العمل

1. **التطوير**: اعمل على فرع منفصل
2. **الاختبار**: اختبر المميزة بالكامل
3. **المراجعة**: طلب مراجعة من الفريق
4. **الدمج**: دمج في main بعد الموافقة

---

## 📞 الدعم

للمساعدة أو الأسئلة:
- 📧 basil1222038@gmail.com
- 📱 +972569906492
- 💬 https://wa.me/972569906492

---

**شكراً لمتابعة هذه الممارسات! 🙏**
