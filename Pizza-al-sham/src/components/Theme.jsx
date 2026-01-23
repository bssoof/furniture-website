import React from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Globe } from 'lucide-react';
import { useThemeStore } from '../store';

export const ThemeSwitcher = () => {
  const { isDarkMode, toggleDarkMode, setDarkMode } = useThemeStore();

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleDarkMode}
      className="p-3 bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors"
      title={isDarkMode ? 'الوضع الفاتح' : 'الوضع الداكن'}
    >
      {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
    </motion.button>
  );
};

export const LanguageSwitcher = () => {
  const { language, setLanguage } = useThemeStore();

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
      className="p-3 bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors"
      title={language === 'ar' ? 'English' : 'العربية'}
    >
      <Globe size={20} />
      <span className="text-xs ml-2">{language.toUpperCase()}</span>
    </motion.button>
  );
};

// Translation object
export const translations = {
  ar: {
    // Navigation
    home: 'الرئيسية',
    menu: 'القائمة',
    about: 'من نحن',
    offers: 'العروض',
    contact: 'اتصل بنا',
    login: 'دخول',
    logout: 'تسجيل الخروج',
    
    // Hero
    bestPizza: 'أشهى بيتزا في المدينة',
    bestPizzaDesc: 'نصنع البيتزا بحب وشغف منذ أكثر من 25 عاماً، بأجود المكونات الطازجة',
    orderNow: 'اطلب الآن',
    browseMenu: 'تصفح القائمة',
    freeDelivery: 'توصيل مجاني',
    thirtyMinutes: '30 دقيقة',
    highQuality: 'جودة عالية',
    
    // Menu
    menuTitle: 'قائمة الطعام',
    menuDesc: 'اكتشف تشكيلتنا الواسعة من البيتزا المحضرة بعناية فائقة',
    all: 'الكل',
    classic: 'كلاسيك',
    premium: 'مميزة',
    vegetarian: 'نباتي',
    luxury: 'فاخرة',
    bestSeller: 'الأكثر مبيعاً',
    addToCart: 'إضافة للسلة',
    
    // Features
    whyChooseUs: 'لماذا تختارنا؟',
    professionalChefs: 'طهاة محترفون',
    freshIngredients: 'مكونات طازجة',
    fastDelivery: 'توصيل سريع',
    qualityGuarantee: 'ضمان الجودة',
    
    // Offers
    specialOffers: 'العروض الخاصة',
    familyOffer: 'عرض العائلة',
    friendsOffer: 'عرض الأصدقاء',
    lunchOffer: 'عرض الغداء',
    discount: 'خصم',
    
    // Reviews
    reviews: 'التقييمات والآراء',
    addReview: 'إضافة تقييم',
    rating: 'التقييم',
    comment: 'التعليق',
    submit: 'إرسال',
    cancel: 'إلغاء',
    
    // Contact
    contactUs: 'تواصل معنا',
    address: 'العنوان',
    phone: 'الهاتف',
    email: 'البريد الإلكتروني',
    workingHours: 'ساعات العمل',
    yourMessage: 'رسالتك',
    sendMessage: 'إرسال الرسالة',
    
    // Auth
    loginAuth: 'تسجيل الدخول',
    register: 'إنشاء حساب جديد',
    fullName: 'الاسم الكامل',
    password: 'كلمة المرور',
    confirmPassword: 'تأكيد كلمة المرور',
    
    // Cart
    cart: 'سلة التسوق',
    emptyCart: 'السلة فارغة',
    total: 'المجموع',
    checkout: 'إتمام الطلب',
    
    // Admin
    adminDashboard: 'لوحة التحكم',
    orders: 'الطلبات',
    users: 'المستخدمون',
    analytics: 'الإحصائيات',
  },
  en: {
    // Navigation
    home: 'Home',
    menu: 'Menu',
    about: 'About',
    offers: 'Offers',
    contact: 'Contact',
    login: 'Login',
    logout: 'Logout',
    
    // Hero
    bestPizza: 'Best Pizza in Town',
    bestPizzaDesc: 'We make pizza with love and passion for over 25 years with the finest fresh ingredients',
    orderNow: 'Order Now',
    browseMenu: 'Browse Menu',
    freeDelivery: 'Free Delivery',
    thirtyMinutes: '30 Minutes',
    highQuality: 'High Quality',
    
    // Menu
    menuTitle: 'Menu',
    menuDesc: 'Discover our wide selection of pizza prepared with great care',
    all: 'All',
    classic: 'Classic',
    premium: 'Premium',
    vegetarian: 'Vegetarian',
    luxury: 'Luxury',
    bestSeller: 'Best Seller',
    addToCart: 'Add to Cart',
    
    // Features
    whyChooseUs: 'Why Choose Us?',
    professionalChefs: 'Professional Chefs',
    freshIngredients: 'Fresh Ingredients',
    fastDelivery: 'Fast Delivery',
    qualityGuarantee: 'Quality Guarantee',
    
    // Offers
    specialOffers: 'Special Offers',
    familyOffer: 'Family Offer',
    friendsOffer: 'Friends Offer',
    lunchOffer: 'Lunch Offer',
    discount: 'Discount',
    
    // Reviews
    reviews: 'Reviews',
    addReview: 'Add Review',
    rating: 'Rating',
    comment: 'Comment',
    submit: 'Submit',
    cancel: 'Cancel',
    
    // Contact
    contactUs: 'Contact Us',
    address: 'Address',
    phone: 'Phone',
    email: 'Email',
    workingHours: 'Working Hours',
    yourMessage: 'Your Message',
    sendMessage: 'Send Message',
    
    // Auth
    register: 'Create Account',
    fullName: 'Full Name',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    
    // Cart
    cart: 'Shopping Cart',
    emptyCart: 'Cart is Empty',
    total: 'Total',
    checkout: 'Checkout',
    
    // Admin
    adminDashboard: 'Admin Dashboard',
    orders: 'Orders',
    users: 'Users',
    analytics: 'Analytics',
  }
};

export const useTranslation = () => {
  const { language } = useThemeStore();
  const t = (key) => translations[language]?.[key] || key;
  return { t, language };
};
