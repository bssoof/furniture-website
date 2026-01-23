# 🍕 توثيق مشروع بيتزا الشام المحسّن

## 🎯 المميزات الجديدة

### 1. نظام المستخدمين والحسابات ✅
- تسجيل حساب جديد وتسجيل دخول
- ملف شخصي للمستخدم
- حفظ الطلبات السابقة
- قائمة المفضلة
- **الملفات**: `src/components/Auth.jsx`, `src/services/firebase.js`

### 2. نظام الطلبات والدفع ✅
- إنشاء طلبات جديدة
- تتبع الطلبات في الوقت الفعلي
- تكامل مع WhatsApp والدفع
- **الملفات**: `src/services/firebase.js`, `src/store/index.js`

### 3. لوحة تحكم الإدارة ✅
- عرض الطلبات الجديدة
- إدارة قائمة الطعام
- عرض المستخدمين والإحصائيات
- تحديث حالة الطلبات
- **الملفات**: `src/components/AdminDashboard.jsx`

### 4. نظام التقييمات والتعليقات ✅
- إضافة تقييمات للمنتجات
- عرض متوسط التقييمات
- رسم بياني التقييمات
- **الملفات**: `src/components/Reviews.jsx`, `src/services/firebase.js`

### 5. Dark Mode ودعم لغات ✅
- تبديل بين الوضع الفاتح والداكن
- دعم اللغة العربية والإنجليزية
- حفظ التفضيلات
- **الملفات**: `src/components/Theme.jsx`, `src/store/index.js`

### 6. تحسينات تقنية وSEO ✅
- تحسينات SEO كاملة
- Schema.org structured data
- Sitemap وRobots.txt
- تحسين الأداء
- **الملفات**: `src/utils/seo.js`

---

## 📦 المكتبات المستخدمة

```json
{
  "dependencies": {
    "firebase": "^10+",
    "@stripe/react-stripe-js": "^2+",
    "@stripe/stripe-js": "^2+",
    "react-router-dom": "^6+",
    "zustand": "^4+",
    "framer-motion": "^10+",
    "lucide-react": "^0.263+"
  }
}
```

---

## 🔧 إعدادات Firebase

### الخطوات:

1. **إنشاء مشروع Firebase**:
   - اذهب إلى [Firebase Console](https://console.firebase.google.com)
   - اضغط "Create Project"
   - أدخل اسم المشروع: `pizza-al-sham`

2. **تفعيل Authentication**:
   - في القائمة اليسرى: Build → Authentication
   - اضغط "Get Started"
   - فعّل Email/Password

3. **إنشاء Firestore Database**:
   - في القائمة اليسرى: Build → Firestore Database
   - اضغط "Create Database"
   - ابدأ في وضع الاختبار

4. **إنشاء Collections**:

```
users/ (المستخدمون)
├── {userId}
│   ├── fullName
│   ├── email
│   ├── phone
│   ├── favorites: []
│   └── orderHistory: []

menu/ (قائمة الطعام)
├── {itemId}
│   ├── name
│   ├── price
│   ├── category
│   └── description

orders/ (الطلبات)
├── {orderId}
│   ├── userId
│   ├── items: []
│   ├── total
│   ├── status
│   └── createdAt

reviews/ (التقييمات)
├── {reviewId}
│   ├── userId
│   ├── itemId
│   ├── rating
│   └── comment
```

5. **نسخ بيانات المشروع**:
   - اذهب إلى Project Settings
   - انسخ بيانات الاتصال
   - أنشئ ملف `.env` من `.env.example`
   - الصق البيانات

---

## 🏗️ بنية المشروع

```
src/
├── components/
│   ├── Auth.jsx              # مكون المستخدمين
│   ├── AdminDashboard.jsx    # لوحة التحكم
│   ├── Reviews.jsx           # نظام التقييمات
│   └── Theme.jsx             # Dark Mode واللغات
├── services/
│   └── firebase.js           # خدمات Firebase
├── store/
│   └── index.js              # إدارة الحالة (Zustand)
├── utils/
│   └── seo.js                # تحسينات SEO
├── pages/
│   ├── Home.jsx
│   ├── Menu.jsx
│   ├── Admin.jsx
│   └── UserProfile.jsx
├── App.jsx                   # التطبيق الرئيسي
└── main.jsx                  # نقطة البداية
```

---

## 🚀 الاستخدام

### 1. التثبيت والتشغيل

```bash
# تثبيت المكتبات
npm install

# إنشاء ملف .env
cp .env.example .env

# تشغيل الخادم
npm run dev
```

### 2. استخدام Firebase Services

```javascript
import { authServices, orderServices, userServices } from './services/firebase';

// تسجيل حساب جديد
const result = await authServices.registerUser(email, password, userData);

// الحصول على طلبات المستخدم
const orders = await orderServices.getUserOrders(userId);

// إضافة تقييم
await reviewServices.addReview(userId, itemId, { rating: 5, comment: 'رائع!' });
```

### 3. استخدام Zustand Store

```javascript
import { useAuthStore, useCartStore, useThemeStore } from './store';

// في المكون
const { user, setUser } = useAuthStore();
const { items, addItem, getTotal } = useCartStore();
const { isDarkMode, toggleDarkMode } = useThemeStore();
```

### 4. استخدام الترجمة

```javascript
import { useTranslation } from './components/Theme';

export const MyComponent = () => {
  const { t, language } = useTranslation();
  
  return <h1>{t('home')}</h1>;
};
```

---

## 🔐 نقاط الأمان

### قوانين Firestore Security

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Anyone can read menu
    match /menu/{document=**} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Users can only access their orders
    match /orders/{orderId} {
      allow read: if request.auth.uid == resource.data.userId || isAdmin();
      allow create: if request.auth.uid == request.resource.data.userId;
      allow update: if isAdmin();
    }
    
    function isAdmin() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

---

## 📱 صفحات التطبيق

### الصفحات المتاحة:

1. **الصفحة الرئيسية** `/`
   - Hero Section
   - القائمة
   - المميزات
   - العروض
   - التقييمات
   - التواصل

2. **ملف المستخدم** `/profile`
   - بيانات المستخدم
   - الطلبات السابقة
   - المفضلة

3. **لوحة الإدارة** `/admin`
   - الطلبات
   - إدارة المنتجات
   - الإحصائيات

4. **سلة التسوق** (Sidebar)
   - عرض الطلبات
   - تعديل الكميات
   - إتمام الطلب

---

## 💳 تكامل Stripe (قريباً)

```javascript
import { loadStripe } from '@stripe/stripe-js';
import { CardElement, Elements, CardPaymentElement } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.VITE_STRIPE_PUBLIC_KEY);

export const PaymentForm = () => {
  // implementation
};
```

---

## 📊 الإحصائيات والتقارير

### المقاييس المهمة:

- عدد الطلبات اليومية
- المبيعات الإجمالية
- أفضل المنتجات
- عدد المستخدمين الجدد
- رضا العملاء (متوسط التقييمات)

---

## 🎨 التخصيص

### ألوان العلامة التجارية:

```css
Primary: #F97316 (Orange)
Secondary: #DC2626 (Red)
Background: #111827 (Dark Gray)
Text: #FFFFFF (White)
Accent: #FCD34D (Yellow)
```

### الخطوط:

```css
Font Family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
Font Size: 16px (base)
Line Height: 1.5
```

---

## 🐛 استكشاف الأخطاء

### مشاكل شائعة:

1. **خطأ Firebase: "Config not found"**
   - تحقق من ملف `.env` والبيانات

2. **خطأ CORS**
   - تحقق من إعدادات Firebase Security Rules

3. **مشكلة في التحميل**
   - امسح ذاكرة التخزين المؤقتة
   - أعد تحميل الصفحة

---

## 📞 الدعم والمساعدة

للمساعدة والاستفسارات:
- البريد الإلكتروني: basil1222038@gmail.com
- الهاتف: +972569906492
- WhatsApp: https://wa.me/972569906492

---

## 📄 الترخيص

جميع الحقوق محفوظة © 2024 بيتزا الشام
