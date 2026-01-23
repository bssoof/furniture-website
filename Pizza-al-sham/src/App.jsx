import React, { useState, useEffect, createContext, useContext, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Phone, MapPin, Clock, Star, ShoppingCart, Menu, X, 
  ChefHat, Flame, Heart, Award, Users, Truck, 
  Facebook, Instagram, Twitter, Mail, ArrowUp,
  Plus, Minus, Check, Pizza, Leaf, Beef, LogOut, User as UserIcon,
  Sun, Moon, Globe, Search, Bell, Package, Gift, Share2, Play, Image,
  CheckCircle, Loader, XCircle, Copy
} from 'lucide-react';

// ============ CONTEXT للغة والثيم ============
const AppContext = createContext();

const useApp = () => useContext(AppContext);

// الترجمات
const translations = {
  ar: {
    home: 'الرئيسية',
    menu: 'القائمة',
    about: 'من نحن',
    offers: 'العروض',
    contact: 'اتصل بنا',
    login: 'تسجيل الدخول',
    logout: 'تسجيل الخروج',
    cart: 'سلة التسوق',
    emptyCart: 'السلة فارغة',
    total: 'المجموع',
    checkout: 'إتمام الطلب',
    bestPizza: 'أشهى بيتزا في المدينة',
    orderNow: 'اطلب الآن',
    browseMenu: 'تصفح القائمة',
    menuTitle: 'قائمة الطعام',
    menuDesc: 'اكتشف تشكيلتنا الواسعة من البيتزا المحضرة بعناية فائقة',
    whyUs: 'لماذا تختارنا؟',
    specialOffers: 'العروض الخاصة',
    offersDesc: 'استمتع بأفضل العروض والخصومات',
    contactUs: 'تواصل معنا',
    offerEnds: 'ينتهي العرض خلال',
    days: 'يوم',
    hours: 'ساعة',
    minutes: 'دقيقة',
    seconds: 'ثانية',
    findUs: 'موقعنا',
    couponHint: 'جرب: PIZZA10, PIZZA20, WELCOME',
    applyCoupon: 'تطبيق',
    small: 'صغيرة',
    medium: 'وسط',
    large: 'كبيرة',
    bestSeller: 'الأكثر مبيعاً',
    shekel: 'شيكل',
  },
  en: {
    home: 'Home',
    menu: 'Menu',
    about: 'About',
    offers: 'Offers',
    contact: 'Contact',
    login: 'Login',
    logout: 'Logout',
    cart: 'Shopping Cart',
    emptyCart: 'Cart is empty',
    total: 'Total',
    checkout: 'Checkout',
    bestPizza: 'Best Pizza in Town',
    orderNow: 'Order Now',
    browseMenu: 'Browse Menu',
    menuTitle: 'Our Menu',
    menuDesc: 'Discover our wide selection of carefully prepared pizzas',
    whyUs: 'Why Choose Us?',
    specialOffers: 'Special Offers',
    offersDesc: 'Enjoy the best deals and discounts',
    contactUs: 'Contact Us',
    offerEnds: 'Offer ends in',
    days: 'Days',
    hours: 'Hours',
    minutes: 'Min',
    seconds: 'Sec',
    findUs: 'Find Us',
    couponHint: 'Try: PIZZA10, PIZZA20, WELCOME',
    applyCoupon: 'Apply',
    small: 'Small',
    medium: 'Medium',
    large: 'Large',
    bestSeller: 'Best Seller',
    shekel: 'ILS',
  }
};

// معلومات التواصل
const CONTACT_INFO = {
  phone: '+972569906492',
  instagram: 'https://www.instagram.com/basilkhateeb4?igsh=a3Y2cW01amJqdmZo',
  facebook: 'https://www.facebook.com/share/1DTpmbZ9D8/',
  whatsapp: 'https://wa.me/972569906492',
  email: 'basil1222038@gmail.com',
  // إحداثيات الموقع (يمكن تغييرها)
  lat: 31.9522,
  lng: 35.2332,
  address: 'شارع الملك فهد، رام الله، فلسطين'
};

// أحجام البيتزا
const PIZZA_SIZES = [
  { id: 'small', name: 'صغيرة', nameEn: 'Small', multiplier: 0.8, icon: 'S' },
  { id: 'medium', name: 'وسط', nameEn: 'Medium', multiplier: 1, icon: 'M' },
  { id: 'large', name: 'كبيرة', nameEn: 'Large', multiplier: 1.4, icon: 'L' },
];

// كوبونات الخصم
const COUPONS = {
  'PIZZA10': { discount: 10, type: 'percent', name: 'خصم 10%' },
  'PIZZA20': { discount: 20, type: 'percent', name: 'خصم 20%' },
  'FREE5': { discount: 5, type: 'fixed', name: 'خصم 5 شيكل' },
  'WELCOME': { discount: 15, type: 'percent', name: 'خصم الترحيب 15%' },
};

// ============ نظام النقاط ============
const POINTS_PER_SHEKEL = 1; // نقطة لكل شيكل
const POINTS_TO_SHEKEL = 100; // 100 نقطة = 1 شيكل خصم

// ============ SKELETON LOADING ============
const SkeletonCard = () => (
  <div className="bg-gray-800 rounded-2xl overflow-hidden animate-pulse">
    <div className="h-48 bg-gray-700" />
    <div className="p-5 space-y-3">
      <div className="h-4 bg-gray-700 rounded w-3/4" />
      <div className="h-3 bg-gray-700 rounded w-full" />
      <div className="h-3 bg-gray-700 rounded w-1/2" />
      <div className="flex gap-2">
        <div className="h-10 bg-gray-700 rounded flex-1" />
        <div className="h-10 bg-gray-700 rounded flex-1" />
        <div className="h-10 bg-gray-700 rounded flex-1" />
      </div>
    </div>
  </div>
);

// ============ PUSH NOTIFICATIONS ============
const NotificationBell = () => {
  const [notifications, setNotifications] = useState([
    { id: 1, text: '🎉 عرض جديد! خصم 30% على بيتزا العائلة', time: 'منذ 5 دقائق', read: false },
    { id: 2, text: '🍕 طلبك جاهز للتوصيل!', time: 'منذ 15 دقيقة', read: false },
    { id: 3, text: '⭐ اربح نقاط مضاعفة اليوم!', time: 'منذ ساعة', read: true },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? {...n, read: true} : n));
  };

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({...n, read: true})));
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowNotifications(!showNotifications)}
        className="p-2 bg-gray-800 rounded-full text-gray-400 hover:text-white relative"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white">
            {unreadCount}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-12 left-0 sm:right-0 w-72 sm:w-80 bg-gray-800 rounded-xl shadow-2xl border border-gray-700 overflow-hidden z-50"
          >
            <div className="p-3 border-b border-gray-700 flex justify-between items-center">
              <span className="font-bold text-white">الإشعارات</span>
              <button onClick={markAllRead} className="text-xs text-orange-500 hover:underline">
                قراءة الكل
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {notifications.map(n => (
                <div 
                  key={n.id} 
                  onClick={() => markAsRead(n.id)}
                  className={`p-3 border-b border-gray-700 cursor-pointer hover:bg-gray-700 transition-colors ${!n.read ? 'bg-gray-700/50' : ''}`}
                >
                  <p className="text-sm text-white">{n.text}</p>
                  <span className="text-xs text-gray-500">{n.time}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============ ORDER TRACKING ============
const OrderTracker = ({ isOpen, onClose, orderId }) => {
  const [currentStep, setCurrentStep] = useState(1);
  
  const steps = [
    { id: 1, name: 'تم استلام الطلب', icon: <Check />, time: '12:30' },
    { id: 2, name: 'قيد التحضير', icon: <ChefHat />, time: '12:35' },
    { id: 3, name: 'في الفرن', icon: <Flame />, time: '12:45' },
    { id: 4, name: 'جاهز للتوصيل', icon: <Package />, time: '12:55' },
    { id: 5, name: 'في الطريق إليك', icon: <Truck />, time: '13:00' },
    { id: 6, name: 'تم التوصيل', icon: <CheckCircle />, time: '' },
  ];

  // محاكاة تحديث الحالة
  useEffect(() => {
    if (isOpen && currentStep < 5) {
      const timer = setTimeout(() => setCurrentStep(s => s + 1), 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, currentStep]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="bg-gray-800 rounded-2xl p-6 w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">تتبع طلبك</h2>
            <p className="text-gray-400 text-sm">رقم الطلب: #{orderId || '12345'}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep >= step.id 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-700 text-gray-500'
              }`}>
                {currentStep > step.id ? <Check size={20} /> : step.icon}
              </div>
              <div className="flex-1">
                <p className={`font-medium ${currentStep >= step.id ? 'text-white' : 'text-gray-500'}`}>
                  {step.name}
                </p>
                {step.time && currentStep >= step.id && (
                  <p className="text-xs text-gray-400">{step.time}</p>
                )}
              </div>
              {currentStep === step.id && step.id < 6 && (
                <Loader className="animate-spin text-orange-500" size={20} />
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-gray-700 rounded-xl">
          <p className="text-sm text-gray-300">
            ⏱️ الوقت المتوقع للتوصيل: <span className="text-orange-500 font-bold">25-30 دقيقة</span>
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ============ RATING SYSTEM ============
const RatingStars = ({ rating, onRate, size = 20, readonly = false }) => {
  const [hoverRating, setHoverRating] = useState(0);
  
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          disabled={readonly}
          onMouseEnter={() => !readonly && setHoverRating(star)}
          onMouseLeave={() => !readonly && setHoverRating(0)}
          onClick={() => !readonly && onRate && onRate(star)}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer'} transition-colors`}
        >
          <Star
            size={size}
            fill={(hoverRating || rating) >= star ? '#f97316' : 'transparent'}
            className={(hoverRating || rating) >= star ? 'text-orange-500' : 'text-gray-600'}
          />
        </button>
      ))}
    </div>
  );
};

// ============ REFERRAL PROGRAM ============
const ReferralModal = ({ isOpen, onClose }) => {
  const referralCode = 'PIZZA' + Math.random().toString(36).substring(2, 8).toUpperCase();
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLink = `https://pizza-alsham.com/ref/${referralCode}`;

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="bg-gray-800 rounded-2xl p-6 w-full max-w-md text-center"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Gift size={40} className="text-white" />
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2">ادعُ أصدقاءك!</h2>
        <p className="text-gray-400 mb-6">
          احصل على <span className="text-orange-500 font-bold">20 شيكل</span> لكل صديق يسجل ويطلب!
        </p>

        <div className="bg-gray-700 rounded-xl p-4 mb-4">
          <p className="text-sm text-gray-400 mb-2">كود الدعوة الخاص بك</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl font-bold text-orange-500 tracking-wider">{referralCode}</span>
            <button onClick={copyCode} className="p-2 hover:bg-gray-600 rounded-lg transition-colors">
              {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} className="text-gray-400" />}
            </button>
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="p-3 bg-green-600 rounded-full text-white"
            onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`اطلب من بيتزا الشام واستخدم كودي للحصول على خصم: ${referralCode}\n${shareLink}`)}`)}
          >
            <Phone size={20} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="p-3 bg-blue-600 rounded-full text-white"
            onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`)}
          >
            <Facebook size={20} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="p-3 bg-pink-600 rounded-full text-white"
            onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`جرب بيتزا الشام! استخدم كودي: ${referralCode}`)}&url=${encodeURIComponent(shareLink)}`)}
          >
            <Share2 size={20} />
          </motion.button>
        </div>

        <button onClick={onClose} className="mt-6 text-gray-400 hover:text-white">
          إغلاق
        </button>
      </motion.div>
    </motion.div>
  );
};

// ============ GALLERY SECTION ============
const GallerySection = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  
  const galleryImages = [
    { url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop', title: 'المطعم من الداخل' },
    { url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop', title: 'أجواء مميزة' },
    { url: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=600&h=400&fit=crop', title: 'المطبخ' },
    { url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop', title: 'بيتزا طازجة' },
    { url: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=600&h=400&fit=crop', title: 'فريق العمل' },
    { url: 'https://images.unsplash.com/photo-1593504049359-74330189a345?w=600&h=400&fit=crop', title: 'التحضير' },
  ];

  return (
    <section className="py-20 bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            معرض <span className="text-orange-500">الصور</span>
          </h2>
          <p className="text-gray-400 text-lg">شاهد أجواء مطعمنا ومطبخنا</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {galleryImages.map((img, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => setSelectedImage(img)}
              className="relative aspect-video rounded-xl overflow-hidden cursor-pointer group"
            >
              <img src={img.url} alt={img.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <p className="text-white font-bold">{img.title}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Video Promo */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 relative aspect-video max-w-3xl mx-auto rounded-2xl overflow-hidden"
        >
          <img 
            src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&h=600&fit=crop" 
            alt="Video thumbnail" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center"
              onClick={() => window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank')}
            >
              <Play size={40} className="text-white ml-1" />
            </motion.button>
          </div>
          <div className="absolute bottom-4 left-4 right-4 text-center">
            <p className="text-white text-xl font-bold">🎬 شاهد قصتنا</p>
          </div>
        </motion.div>

        {/* Lightbox */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedImage(null)}
            >
              <motion.img
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                src={selectedImage.url}
                alt={selectedImage.title}
                className="max-w-full max-h-[80vh] rounded-xl"
              />
              <button className="absolute top-4 right-4 text-white">
                <X size={32} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

// ============ POINTS DISPLAY ============
const PointsDisplay = ({ points }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="flex items-center gap-2 bg-gradient-to-r from-yellow-600 to-orange-600 px-3 py-1.5 rounded-full"
  >
    <Gift size={16} className="text-yellow-200" />
    <span className="text-white font-bold text-sm">{points} نقطة</span>
  </motion.div>
);

// ============ FAVORITES ============
const useFavorites = () => {
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (itemId) => {
    setFavorites(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const isFavorite = (itemId) => favorites.includes(itemId);

  return { favorites, toggleFavorite, isFavorite };
};

// ============ COUNTDOWN TIMER ============
const CountdownTimer = ({ targetDate }) => {
  const { lang } = useApp();
  const t = translations[lang];
  
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = new Date(targetDate) - new Date();
    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex gap-2 sm:gap-4 justify-center">
      {[
        { value: timeLeft.days, label: t.days },
        { value: timeLeft.hours, label: t.hours },
        { value: timeLeft.minutes, label: t.minutes },
        { value: timeLeft.seconds, label: t.seconds },
      ].map((item, index) => (
        <div key={index} className="bg-gray-800 rounded-lg p-2 sm:p-3 min-w-[50px] sm:min-w-[70px] text-center">
          <div className="text-xl sm:text-3xl font-bold text-orange-500">{String(item.value).padStart(2, '0')}</div>
          <div className="text-[10px] sm:text-xs text-gray-400">{item.label}</div>
        </div>
      ))}
    </div>
  );
};

// ============ GOOGLE MAP ============
const GoogleMap = () => {
  const { lang } = useApp();
  const t = translations[lang];
  
  return (
    <div className="mt-8 rounded-2xl overflow-hidden border-2 border-gray-700">
      <div className="bg-gray-800 p-4 flex items-center gap-2">
        <MapPin className="text-orange-500" size={20} />
        <span className="text-white font-medium">{t.findUs}</span>
      </div>
      <iframe
        src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3389.5!2d${CONTACT_INFO.lng}!3d${CONTACT_INFO.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzHCsDU3JzA4LjAiTiAzNcKwMTMnNTkuNSJF!5e0!3m2!1sen!2s!4v1234567890`}
        width="100%"
        height="300"
        style={{ border: 0 }}
        allowFullScreen=""
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="grayscale hover:grayscale-0 transition-all duration-500"
      />
    </div>
  );
};

// ============ AUTH MODAL ============
const LoginModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useApp();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // محاكاة تسجيل الدخول (يمكن ربطها بـ Firebase لاحقاً)
    setTimeout(() => {
      if (email && password) {
        const userData = {
          email,
          name: isLogin ? email.split('@')[0] : name,
          id: Date.now()
        };
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        onClose();
      } else {
        setError('الرجاء إدخال البريد وكلمة المرور');
      }
      setLoading(false);
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-800 rounded-2xl p-6 w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">
              {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-white mb-2">الاسم</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:border-orange-500 focus:outline-none"
                  placeholder="أدخل اسمك"
                />
              </div>
            )}
            <div>
              <label className="block text-white mb-2">البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:border-orange-500 focus:outline-none"
                placeholder="example@email.com"
              />
            </div>
            <div>
              <label className="block text-white mb-2">كلمة المرور</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:border-orange-500 focus:outline-none"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-bold disabled:opacity-50"
            >
              {loading ? 'جاري التحميل...' : (isLogin ? 'دخول' : 'إنشاء حساب')}
            </button>
          </form>

          <p className="text-center text-gray-400 mt-4">
            {isLogin ? 'ليس لديك حساب؟' : 'لديك حساب؟'}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-orange-500 hover:underline mr-2"
            >
              {isLogin ? 'إنشاء حساب' : 'تسجيل الدخول'}
            </button>
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Navigation Component
const Navbar = ({ cartCount, setShowCart, setCurrentPage, currentPage, setShowLogin, userPoints, setShowReferral }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { lang, setLang, darkMode, setDarkMode, user, setUser } = useApp();
  const t = translations[lang];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: t.home, id: 'hero' },
    { name: t.menu, id: 'menu' },
    { name: t.about, id: 'features' },
    { name: t.offers, id: 'offers' },
    { name: t.contact, id: 'contact' }
  ];

  const scrollToSection = (sectionId) => {
    if (sectionId === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-gray-900/95 backdrop-blur-md shadow-xl' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
              <span className="text-xl sm:text-2xl">🍕</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl sm:text-2xl font-bold text-white">بيتزا الشام</h1>
              <p className="text-orange-400 text-xs">منذ 1995</p>
            </div>
          </motion.div>

          <div className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => (
              <motion.button
                key={item.name}
                whileHover={{ scale: 1.1 }}
                onClick={() => {
                  setCurrentPage(item.name);
                  scrollToSection(item.id);
                }}
                className={`text-white hover:text-orange-400 transition-colors font-medium ${
                  currentPage === item.name ? 'text-orange-400' : ''
                }`}
              >
                {item.name}
              </motion.button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* 🎁 نقاط المستخدم */}
            {user && userPoints > 0 && (
              <div className="hidden sm:block">
                <PointsDisplay points={userPoints} />
              </div>
            )}

            {/* 👥 زر برنامج الإحالة */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowReferral(true)}
              className="p-2 bg-gray-800 rounded-full text-gray-400 hover:text-green-400 hidden sm:flex"
              title="ادعُ صديق"
            >
              <Share2 size={18} />
            </motion.button>

            {/* 🔔 الإشعارات */}
            <NotificationBell />

            {/* Language Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="p-2 bg-gray-800 rounded-full text-gray-400 hover:text-white"
              title={lang === 'ar' ? 'English' : 'العربية'}
            >
              <Globe size={18} />
            </motion.button>

            {/* Dark Mode Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 bg-gray-800 rounded-full text-gray-400 hover:text-white"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </motion.button>

            {/* User/Login */}
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-white text-sm hidden sm:block">{user.name}</span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={handleLogout}
                  className="p-2 bg-gray-800 rounded-full text-gray-400 hover:text-red-400"
                  title={t.logout}
                >
                  <LogOut size={18} />
                </motion.button>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={() => setShowLogin(true)}
                className="p-2 bg-gray-800 rounded-full text-gray-400 hover:text-white"
                title={t.login}
              >
                <UserIcon size={18} />
              </motion.button>
            )}

            {/* Cart */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCart(true)}
              className="relative p-2 sm:p-3 bg-orange-500 rounded-full text-white"
            >
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full text-xs flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </motion.button>
            
            <button 
              className="lg:hidden text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-gray-900/95 backdrop-blur-md"
          >
            <div className="px-4 py-4 space-y-3">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    setCurrentPage(item.name);
                    scrollToSection(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-right text-white hover:text-orange-400 py-2"
                >
                  {item.name}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

// Hero Section
const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="absolute inset-0 opacity-20">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-6xl"
              initial={{ 
                x: Math.random() * 100 + '%', 
                y: Math.random() * 100 + '%',
                opacity: 0.1 
              }}
              animate={{ 
                y: [null, '-20%'],
                rotate: [0, 360]
              }}
              transition={{ 
                duration: Math.random() * 20 + 10, 
                repeat: Infinity,
                repeatType: 'reverse'
              }}
            >
              🍕
            </motion.div>
          ))}
        </div>
      </div>

      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="mb-6 mx-auto w-40 h-40 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-orange-500 shadow-2xl shadow-orange-500/30"
          >
            <img 
              src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop" 
              alt="بيتزا شهية"
              className="w-full h-full object-cover"
            />
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            أشهى <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">بيتزا</span> في المدينة
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
            نصنع البيتزا بحب وشغف منذ أكثر من 25 عاماً، بأجود المكونات الطازجة
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.a
              href={CONTACT_INFO.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full font-bold text-lg shadow-xl shadow-orange-500/30 text-center"
            >
              اطلب الآن
            </motion.a>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => document.getElementById('menu').scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 border-2 border-white text-white rounded-full font-bold text-lg hover:bg-white hover:text-gray-900 transition-colors"
            >
              تصفح القائمة
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto"
        >
          {[
            { icon: <Truck />, label: 'توصيل مجاني' },
            { icon: <Clock />, label: '30 دقيقة' },
            { icon: <Award />, label: 'جودة عالية' }
          ].map((item, index) => (
            <div key={index} className="text-center">
              <div className="w-14 h-14 mx-auto mb-2 bg-orange-500/20 rounded-full flex items-center justify-center text-orange-400">
                {item.icon}
              </div>
              <p className="text-gray-300 text-sm">{item.label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 bg-white rounded-full"
          />
        </div>
      </motion.div>
    </section>
  );
};

// Menu Data
const menuItems = [
  {
    id: 1,
    name: 'بيتزا مارغريتا',
    description: 'صلصة الطماطم، جبنة موزاريلا، ريحان طازج',
    price: 35,
    category: 'كلاسيك',
    rating: 4.9,
    isVegetarian: true,
    isSpicy: false,
    isBestseller: true,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop'
  },
  {
    id: 2,
    name: 'بيتزا بيبروني',
    description: 'بيبروني حار، جبنة موزاريلا، صلصة خاصة',
    price: 45,
    category: 'كلاسيك',
    rating: 4.8,
    isVegetarian: false,
    isSpicy: true,
    isBestseller: true,
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop'
  },
  {
    id: 3,
    name: 'بيتزا الدجاج المشوي',
    description: 'دجاج مشوي، فلفل ملون، بصل، جبنة',
    price: 50,
    category: 'مميزة',
    rating: 4.7,
    isVegetarian: false,
    isSpicy: false,
    isBestseller: false,
    image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=400&h=300&fit=crop'
  },
  {
    id: 4,
    name: 'بيتزا خضار',
    description: 'فطر، زيتون، فلفل، طماطم، بصل',
    price: 40,
    category: 'نباتي',
    rating: 4.6,
    isVegetarian: true,
    isSpicy: false,
    isBestseller: false,
    image: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=400&h=300&fit=crop'
  },
  {
    id: 5,
    name: 'بيتزا اللحم المفروم',
    description: 'لحم مفروم متبل، بصل، فلفل حار',
    price: 55,
    category: 'مميزة',
    rating: 4.9,
    isVegetarian: false,
    isSpicy: true,
    isBestseller: true,
    image: 'https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?w=400&h=300&fit=crop'
  },
  {
    id: 6,
    name: 'بيتزا أربع أجبان',
    description: 'موزاريلا، شيدر، بارميزان، جبنة زرقاء',
    price: 48,
    category: 'مميزة',
    rating: 4.8,
    isVegetarian: true,
    isSpicy: false,
    isBestseller: false,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop'
  },
  {
    id: 7,
    name: 'بيتزا سي فود',
    description: 'جمبري، كاليماري، سلمون مدخن',
    price: 65,
    category: 'فاخرة',
    rating: 4.9,
    isVegetarian: false,
    isSpicy: false,
    isBestseller: true,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop'
  },
  {
    id: 8,
    name: 'بيتزا باربيكيو',
    description: 'دجاج، صوص باربيكيو، بصل مكرمل',
    price: 52,
    category: 'مميزة',
    rating: 4.7,
    isVegetarian: false,
    isSpicy: false,
    isBestseller: false,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop'
  }
];

// Menu Section
const MenuSection = ({ addToCart, favorites, toggleFavorite, isFavorite }) => {
  const [activeCategory, setActiveCategory] = useState('الكل');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [ratings, setRatings] = useState(() => {
    const saved = localStorage.getItem('pizzaRatings');
    return saved ? JSON.parse(saved) : {};
  });
  
  const categories = ['الكل', 'كلاسيك', 'مميزة', 'نباتي', 'فاخرة'];

  // محاكاة التحميل
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // حفظ التقييمات
  useEffect(() => {
    localStorage.setItem('pizzaRatings', JSON.stringify(ratings));
  }, [ratings]);

  const handleRate = (itemId, rating) => {
    setRatings(prev => ({ ...prev, [itemId]: rating }));
    // إظهار شكر
    const toast = document.createElement('div');
    toast.className = 'fixed top-24 right-4 bg-yellow-500 text-black px-4 py-2 rounded-lg shadow-lg z-50';
    toast.textContent = `⭐ شكراً لتقييمك!`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  };

  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesCategory = activeCategory === 'الكل' || item.category === activeCategory;
      const matchesSearch = searchQuery === '' || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <section className="py-12 sm:py-20 bg-gray-900" id="menu">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            قائمة <span className="text-orange-500">الطعام</span>
          </h2>
          <p className="text-gray-400 text-sm sm:text-lg max-w-2xl mx-auto">
            اكتشف تشكيلتنا الواسعة من البيتزا المحضرة بعناية فائقة
          </p>
        </motion.div>

        {/* 🔍 شريط البحث */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl mx-auto mb-8"
        >
          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن البيتزا المفضلة..."
              className="w-full pr-12 pl-4 py-3 bg-gray-800 border border-gray-700 rounded-full text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8 sm:mb-12">
          {categories.map((category) => (
            <motion.button
              key={category}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(category)}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full font-medium text-sm sm:text-base transition-all ${
                activeCategory === category
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {category}
            </motion.button>
          ))}
        </div>

        {/* عرض نتائج البحث */}
        {searchQuery && (
          <p className="text-center text-gray-400 mb-4">
            نتائج البحث عن "{searchQuery}": {filteredItems.length} عنصر
          </p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {isLoading ? (
            // Skeleton Loading
            [...Array(8)].map((_, i) => <SkeletonCard key={i} />)
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ y: -5 }}
                  className="bg-gray-800 rounded-xl sm:rounded-2xl overflow-hidden group"
                >
                  <div className="relative h-32 sm:h-48 overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {item.isBestseller && (
                      <span className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-yellow-500 text-black text-[10px] sm:text-xs px-2 sm:px-3 py-1 rounded-full font-bold">
                        الأكثر مبيعاً
                      </span>
                    )}
                    
                    {/* ❤️ زر المفضلة */}
                    <motion.button
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleFavorite(item.id)}
                      className="absolute top-2 left-2 sm:top-4 sm:left-4 w-8 h-8 sm:w-10 sm:h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center"
                    >
                      <Heart 
                        size={16} 
                        fill={isFavorite(item.id) ? '#ef4444' : 'transparent'}
                        className={isFavorite(item.id) ? 'text-red-500' : 'text-white'}
                      />
                    </motion.button>
                    
                    <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 flex gap-1 sm:gap-2">
                      {item.isVegetarian && (
                        <span className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <Leaf size={12} className="text-white sm:w-4 sm:h-4" />
                        </span>
                      )}
                      {item.isSpicy && (
                        <span className="w-6 h-6 sm:w-8 sm:h-8 bg-red-500 rounded-full flex items-center justify-center">
                          <Flame size={12} className="text-white sm:w-4 sm:h-4" />
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-3 sm:p-5">
                    <div className="flex items-center justify-between mb-1 sm:mb-2">
                      <h3 className="text-sm sm:text-xl font-bold text-white truncate">{item.name}</h3>
                    </div>
                    
                    {/* ⭐ نظام التقييم */}
                    <div className="flex items-center gap-2 mb-2">
                      <RatingStars 
                        rating={ratings[item.id] || item.rating} 
                        onRate={(r) => handleRate(item.id, r)}
                        size={14}
                      />
                      <span className="text-xs text-gray-400">({ratings[item.id] || item.rating})</span>
                    </div>
                    
                    <p className="text-gray-400 text-xs sm:text-sm mb-3 line-clamp-2">{item.description}</p>
                    
                    {/* اختيار الحجم */}
                    <div className="flex gap-2 mb-3">
                      {PIZZA_SIZES.map((size) => (
                        <button
                          key={size.id}
                          onClick={() => addToCart(item, size)}
                          className="flex-1 py-2 px-2 sm:px-3 bg-gray-700 hover:bg-orange-500 rounded-lg text-white text-xs sm:text-sm font-medium transition-colors flex flex-col items-center"
                        >
                          <span className="font-bold">{size.icon}</span>
                          <span className="text-[10px] sm:text-xs text-gray-300">{Math.round(item.price * size.multiplier)}₪</span>
                        </button>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-lg sm:text-xl font-bold text-orange-500">{item.price} شيكل</span>
                      <span className="text-xs text-gray-500">سعر الوسط</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* لا توجد نتائج */}
        {!isLoading && filteredItems.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-gray-400 text-lg">😔 لم نجد نتائج لبحثك</p>
            <button 
              onClick={() => { setSearchQuery(''); setActiveCategory('الكل'); }}
              className="mt-4 text-orange-500 hover:underline"
            >
              عرض كل القائمة
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
};

// Features Section
const FeaturesSection = () => {
  const features = [
    {
      icon: <ChefHat size={40} />,
      title: 'طهاة محترفون',
      description: 'فريق من أمهر الطهاة المتخصصين في صناعة البيتزا الإيطالية الأصلية'
    },
    {
      icon: <Leaf size={40} />,
      title: 'مكونات طازجة',
      description: 'نستخدم أجود المكونات الطازجة يومياً لضمان أفضل مذاق'
    },
    {
      icon: <Truck size={40} />,
      title: 'توصيل سريع',
      description: 'نوصل طلبك ساخناً خلال 30 دقيقة أو أقل'
    },
    {
      icon: <Award size={40} />,
      title: 'ضمان الجودة',
      description: 'إذا لم تكن راضياً، نعيد لك أموالك بالكامل'
    }
  ];

  return (
    <section id="features" className="py-20 bg-gradient-to-b from-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            لماذا <span className="text-orange-500">تختارنا؟</span>
          </h2>
          <p className="text-gray-400 text-lg">نقدم لك تجربة طعام استثنائية</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700 text-center group"
            >
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Offers Section
const OffersSection = () => {
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [orderData, setOrderData] = useState({ name: '', phone: '', address: '' });

  const offers = [
    {
      title: 'عرض العائلة',
      description: 'بيتزا كبيرة + بيتزا وسط + مشروبات',
      discount: '25%',
      originalPrice: 120,
      newPrice: 90,
      color: 'from-orange-500 to-red-600'
    },
    {
      title: 'عرض الأصدقاء',
      description: '3 بيتزا وسط + أجنحة دجاج',
      discount: '30%',
      originalPrice: 150,
      newPrice: 105,
      color: 'from-purple-500 to-pink-600'
    },
    {
      title: 'عرض الغداء',
      description: 'بيتزا شخصية + مشروب + حلى',
      discount: '20%',
      originalPrice: 50,
      newPrice: 40,
      color: 'from-green-500 to-teal-600'
    }
  ];

  const handleOrderClick = (offer) => {
    setSelectedOffer(offer);
    setShowOrderForm(true);
  };

  const handleSubmitOrder = (e) => {
    e.preventDefault();
    if (!orderData.name.trim() || !orderData.phone.trim() || !orderData.address.trim()) {
      alert('الرجاء ملء جميع الحقول');
      return;
    }

    const message = `
*طلب عرض خاص*

👤 الاسم: ${orderData.name}
📞 الهاتف: ${orderData.phone}
📍 العنوان: ${orderData.address}

🎉 العرض: ${selectedOffer.title}
📝 الوصف: ${selectedOffer.description}
💰 السعر: ${selectedOffer.newPrice} شيكل (بدلاً من ${selectedOffer.originalPrice} شيكل)
🏷️ خصم: ${selectedOffer.discount}

شكراً لطلبك!`;

    const whatsappUrl = `https://wa.me/972569906492?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    setShowOrderForm(false);
    setOrderData({ name: '', phone: '', address: '' });
  };

  return (
    <section id="offers" className="py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            العروض <span className="text-orange-500">الخاصة</span>
          </h2>
          <p className="text-gray-400 text-lg mb-6">استمتع بأفضل العروض والخصومات</p>
          
          {/* Countdown Timer */}
          <div className="bg-gray-800 rounded-2xl p-4 sm:p-6 max-w-lg mx-auto mb-8">
            <p className="text-orange-400 font-bold mb-4 text-sm sm:text-base">⏰ ينتهي العرض خلال</p>
            <CountdownTimer targetDate={new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()} />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {offers.map((offer, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${offer.color} p-8 text-white`}
            >
              <div className="absolute top-4 left-4 bg-white text-gray-900 px-4 py-2 rounded-full font-bold">
                خصم {offer.discount}
              </div>
              
              <div className="mt-8">
                <h3 className="text-2xl font-bold mb-2">{offer.title}</h3>
                <p className="text-white/80 mb-6">{offer.description}</p>
                
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-3xl font-bold">{offer.newPrice} شيكل</span>
                  <span className="text-xl line-through text-white/50">{offer.originalPrice} شيكل</span>
                </div>

                <motion.button
                  onClick={() => handleOrderClick(offer)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full py-3 bg-white text-gray-900 rounded-full font-bold text-center block hover:bg-gray-100 transition-colors"
                >
                  اطلب الآن
                </motion.button>
              </div>

              <div className="absolute -bottom-10 -right-10 text-9xl opacity-20">🍕</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Order Form Modal */}
      <AnimatePresence>
        {showOrderForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowOrderForm(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="w-full max-w-md bg-gray-800 rounded-2xl p-6"
              >
                <h3 className="text-2xl font-bold text-white mb-6">معلومات الطلب</h3>
                <form onSubmit={handleSubmitOrder} className="space-y-4">
                  <div>
                    <label className="block text-white mb-2 font-medium">الاسم *</label>
                    <input
                      type="text"
                      value={orderData.name}
                      onChange={(e) => setOrderData({...orderData, name: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:border-orange-500 focus:outline-none transition-colors"
                      placeholder="أدخل اسمك"
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-2 font-medium">رقم الهاتف *</label>
                    <input
                      type="tel"
                      value={orderData.phone}
                      onChange={(e) => setOrderData({...orderData, phone: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:border-orange-500 focus:outline-none transition-colors"
                      placeholder="أدخل رقم هاتفك"
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-2 font-medium">العنوان *</label>
                    <input
                      type="text"
                      value={orderData.address}
                      onChange={(e) => setOrderData({...orderData, address: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:border-orange-500 focus:outline-none transition-colors"
                      placeholder="أدخل عنوان التوصيل"
                    />
                  </div>
                  
                  <div className="bg-gray-700 p-4 rounded-lg mt-4">
                    <p className="text-gray-300 text-sm mb-2">📦 الطلب:</p>
                    <p className="text-white font-bold">{selectedOffer?.title}</p>
                    <p className="text-orange-400 text-lg font-bold mt-2">{selectedOffer?.newPrice} شيكل</p>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-bold"
                    >
                      إرسال على WhatsApp
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={() => setShowOrderForm(false)}
                      whileHover={{ scale: 1.02 }}
                      className="flex-1 py-3 bg-gray-700 text-white rounded-xl font-bold"
                    >
                      إلغاء
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
};

// Testimonials Section
const TestimonialsSection = () => {
  const testimonials = [
    { name: 'أحمد محمد', text: 'أفضل بيتزا جربتها في حياتي! المذاق رائع والتوصيل سريع جداً.', rating: 5 },
    { name: 'سارة علي', text: 'خدمة ممتازة وأسعار معقولة. أنصح الجميع بتجربة بيتزا البيبروني.', rating: 5 },
    { name: 'خالد العمري', text: 'نطلب منهم كل أسبوع تقريباً. جودة ثابتة وممتازة دائماً.', rating: 5 }
  ];

  return (
    <section className="py-20 bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            آراء <span className="text-orange-500">عملائنا</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-900 p-8 rounded-2xl"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={20} className="text-yellow-400" fill="currentColor" />
                ))}
              </div>
              <p className="text-gray-300 mb-6 text-lg">"{testimonial.text}"</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {testimonial.name.charAt(0)}
                </div>
                <span className="text-white font-medium">{testimonial.name}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Contact Section
const ContactSection = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // إرسال إلى WhatsApp
    const message = `
*رسالة من نموذج الاتصال*

👤 الاسم: ${formData.name}
📧 البريد: ${formData.email}
📞 الهاتف: ${formData.phone}

💬 الرسالة:
${formData.message}`;
    const whatsappUrl = `https://wa.me/972569906492?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <section id="contact" className="py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              تواصل <span className="text-orange-500">معنا</span>
            </h2>
            <p className="text-gray-400 mb-8 text-lg">
              نحن هنا لخدمتك! تواصل معنا لأي استفسار أو اقتراح
            </p>

            <div className="space-y-6">
              {[
                { icon: <MapPin />, title: 'العنوان', text: 'شارع الملك فهد، الرياض' },
                { icon: <Phone />, title: 'الهاتف', text: CONTACT_INFO.phone },
                { icon: <Mail />, title: 'البريد الإلكتروني', text: CONTACT_INFO.email },
                { icon: <Clock />, title: 'ساعات العمل', text: 'يومياً من 11 صباحاً - 12 منتصف الليل' }
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-orange-500/20 rounded-xl flex items-center justify-center text-orange-500">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{item.title}</h4>
                    <p className="text-gray-400">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4 mt-8">
              <motion.a
                href={CONTACT_INFO.facebook}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, y: -5 }}
                className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:bg-orange-500 hover:text-white transition-colors"
              >
                <Facebook size={20} />
              </motion.a>
              <motion.a
                href={CONTACT_INFO.instagram}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, y: -5 }}
                className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:bg-orange-500 hover:text-white transition-colors"
              >
                <Instagram size={20} />
              </motion.a>
              <motion.a
                href={CONTACT_INFO.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, y: -5 }}
                className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:bg-orange-500 hover:text-white transition-colors"
              >
                <Phone size={20} />
              </motion.a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-2xl">
              <div className="space-y-6">
                <div>
                  <label className="block text-white mb-2">الاسم</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:border-orange-500 focus:outline-none transition-colors"
                    placeholder="أدخل اسمك"
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:border-orange-500 focus:outline-none transition-colors"
                    placeholder="أدخل بريدك الإلكتروني"
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">رقم الهاتف</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:border-orange-500 focus:outline-none transition-colors"
                    placeholder="أدخل رقم هاتفك"
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">الرسالة</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:border-orange-500 focus:outline-none transition-colors resize-none"
                    placeholder="اكتب رسالتك هنا"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-bold text-lg"
                >
                  {submitted ? (
                    <span className="flex items-center justify-center gap-2">
                      <Check size={20} /> تم الإرسال بنجاح!
                    </span>
                  ) : (
                    'إرسال الرسالة'
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
        
        {/* Google Map */}
        <GoogleMap />
      </div>
    </section>
  );
};

// Cart Sidebar
const CartSidebar = ({ cart, setCart, showCart, setShowCart, onOrderComplete, userPoints, setUserPoints }) => {
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutData, setCheckoutData] = useState({ name: '', phone: '', address: '' });
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [usePoints, setUsePoints] = useState(false);

  const updateQuantity = (id, sizeId, delta) => {
    setCart(cart.map(item => 
      (item.id === id && item.sizeId === sizeId)
        ? { ...item, quantity: Math.max(0, item.quantity + delta) }
        : item
    ).filter(item => item.quantity > 0));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  // حساب الخصم من الكوبون
  let couponDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percent') {
      couponDiscount = Math.round(subtotal * (appliedCoupon.discount / 100));
    } else {
      couponDiscount = appliedCoupon.discount;
    }
  }

  // حساب خصم النقاط
  const pointsDiscount = usePoints ? Math.min(Math.floor(userPoints / POINTS_TO_SHEKEL), subtotal - couponDiscount) : 0;
  const pointsUsed = pointsDiscount * POINTS_TO_SHEKEL;
  
  const discount = couponDiscount + pointsDiscount;
  const total = Math.max(0, subtotal - discount);
  
  // النقاط التي سيكسبها
  const earnedPoints = Math.floor(total * POINTS_PER_SHEKEL);

  // تطبيق الكوبون
  const applyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (COUPONS[code]) {
      setAppliedCoupon({ ...COUPONS[code], code });
      setCouponError('');
      setCouponCode('');
    } else {
      setCouponError('كود الخصم غير صالح');
      setAppliedCoupon(null);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  const handleCheckout = (e) => {
    e.preventDefault();
    if (!checkoutData.name.trim()) {
      alert('الرجاء إدخال الاسم');
      return;
    }
    if (!checkoutData.phone.trim()) {
      alert('الرجاء إدخال رقم الهاتف');
      return;
    }
    if (!checkoutData.address.trim()) {
      alert('الرجاء إدخال العنوان');
      return;
    }

    // خصم النقاط المستخدمة
    if (usePoints && pointsUsed > 0) {
      setUserPoints(prev => prev - pointsUsed);
    }

    // إنشاء رسالة الطلب
    const orderMessage = `
*طلب جديد من بيتزا الشام*

👤 *الاسم:* ${checkoutData.name}
📞 *الهاتف:* ${checkoutData.phone}
📍 *العنوان:* ${checkoutData.address}

📋 *الطلب:*
${cart.map(item => `• ${item.name} (${item.sizeName}) x${item.quantity} = ${item.price * item.quantity} شيكل`).join('\n')}

💵 *المجموع الفرعي:* ${subtotal} شيكل
${appliedCoupon ? `🎟️ *كوبون (${appliedCoupon.code}):* -${discount} شيكل` : ''}
💰 *المجموع النهائي:* ${total} شيكل

شكراً لطلبك!`;

    const whatsappUrl = `https://wa.me/972569906492?text=${encodeURIComponent(orderMessage)}`;
    window.open(whatsappUrl, '_blank');

    // إعادة تعيين
    setCart([]);
    setShowCheckout(false);
    setShowCart(false);
    setCheckoutData({ name: '', phone: '', address: '' });
    setAppliedCoupon(null);
  };

  return (
    <AnimatePresence>
      {showCart && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCart(false)}
            className="fixed inset-0 bg-black/50 z-50"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-gray-900 z-50 p-6 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white">سلة التسوق</h2>
              <button onClick={() => setShowCart(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart size={64} className="mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400">السلة فارغة</p>
              </div>
            ) : (
              <>
                <div className="space-y-4 max-h-[40vh] overflow-y-auto">
                  {cart.map((item, index) => (
                    <div key={`${item.id}-${item.sizeId}-${index}`} className="flex gap-3 bg-gray-800 p-3 rounded-xl">
                      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium text-sm truncate">{item.name}</h3>
                        <p className="text-gray-400 text-xs">الحجم: {item.sizeName}</p>
                        <p className="text-orange-500 font-bold text-sm">{item.price} شيكل</p>
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            onClick={() => updateQuantity(item.id, item.sizeId, -1)}
                            className="w-7 h-7 bg-gray-700 rounded-full flex items-center justify-center text-white"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-white font-medium text-sm">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.sizeId, 1)}
                            className="w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center text-white"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* قسم الكوبون */}
                <div className="mt-6 p-4 bg-gray-800 rounded-xl">
                  <p className="text-white font-medium mb-3 text-sm">🎟️ هل لديك كود خصم؟</p>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-green-900/50 border border-green-500 rounded-lg p-3">
                      <div>
                        <p className="text-green-400 font-bold text-sm">{appliedCoupon.name}</p>
                        <p className="text-green-300 text-xs">كود: {appliedCoupon.code}</p>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        إزالة
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="أدخل كود الخصم"
                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:border-orange-500 focus:outline-none"
                      />
                      <button
                        onClick={applyCoupon}
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg font-medium text-sm hover:bg-orange-600 transition-colors"
                      >
                        تطبيق
                      </button>
                    </div>
                  )}
                  {couponError && <p className="text-red-400 text-xs mt-2">{couponError}</p>}
                  <p className="text-gray-500 text-xs mt-2">جرب: PIZZA10, PIZZA20, WELCOME</p>
                </div>

                {/* 🎁 قسم استخدام النقاط */}
                {userPoints > 0 && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-600/50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Gift size={18} className="text-yellow-400" />
                        <span className="text-yellow-400 font-medium text-sm">نقاطك: {userPoints}</span>
                      </div>
                      <span className="text-xs text-gray-400">= {Math.floor(userPoints / POINTS_TO_SHEKEL)} شيكل</span>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={usePoints}
                        onChange={(e) => setUsePoints(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-orange-500 focus:ring-orange-500"
                      />
                      <span className="text-white text-sm">استخدام النقاط ({pointsDiscount} شيكل خصم)</span>
                    </label>
                  </div>
                )}

                <div className="mt-6 pt-4 border-t border-gray-700 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">المجموع الفرعي:</span>
                    <span className="text-white">{subtotal} شيكل</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-400">خصم الكوبون ({appliedCoupon.name}):</span>
                      <span className="text-green-400">-{couponDiscount} شيكل</span>
                    </div>
                  )}
                  {usePoints && pointsDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-yellow-400">خصم النقاط ({pointsUsed} نقطة):</span>
                      <span className="text-yellow-400">-{pointsDiscount} شيكل</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xl font-bold pt-2">
                    <span className="text-gray-400">المجموع:</span>
                    <span className="text-orange-500">{total} شيكل</span>
                  </div>
                  {/* النقاط المكتسبة */}
                  <div className="flex justify-between text-sm bg-green-900/30 p-2 rounded-lg">
                    <span className="text-green-400">🎁 ستكسب من هذا الطلب:</span>
                    <span className="text-green-400 font-bold">+{earnedPoints} نقطة</span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowCheckout(true)}
                    className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-bold text-lg mt-4"
                  >
                    إتمام الطلب
                  </motion.button>
                </div>
              </>
            )}
          </motion.div>

          {/* Checkout Modal */}
          <AnimatePresence>
            {showCheckout && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowCheckout(false)}
                  className="fixed inset-0 bg-black/50 z-[60]"
                />
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="w-full max-w-md bg-gray-800 rounded-2xl p-6"
                  >
                    <h3 className="text-2xl font-bold text-white mb-6">إتمام الطلب</h3>
                    <form onSubmit={handleCheckout} className="space-y-4">
                      <div>
                        <label className="block text-white mb-2 font-medium">الاسم *</label>
                        <input
                          type="text"
                          value={checkoutData.name}
                          onChange={(e) => setCheckoutData({...checkoutData, name: e.target.value})}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:border-orange-500 focus:outline-none transition-colors"
                          placeholder="أدخل اسمك"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-white mb-2 font-medium">رقم الهاتف *</label>
                        <input
                          type="tel"
                          value={checkoutData.phone}
                          onChange={(e) => setCheckoutData({...checkoutData, phone: e.target.value})}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:border-orange-500 focus:outline-none transition-colors"
                          placeholder="أدخل رقم هاتفك"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-white mb-2 font-medium">العنوان *</label>
                        <input
                          type="text"
                          value={checkoutData.address}
                          onChange={(e) => setCheckoutData({...checkoutData, address: e.target.value})}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:border-orange-500 focus:outline-none transition-colors"
                          placeholder="أدخل عنوان التوصيل"
                          required
                        />
                      </div>
                      <div className="flex gap-3 mt-6">
                        <motion.button
                          type="submit"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={!checkoutData.name.trim() || !checkoutData.phone.trim() || !checkoutData.address.trim()}
                        >
                          إرسال الطلب
                        </motion.button>
                        <motion.button
                          type="button"
                          onClick={() => setShowCheckout(false)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex-1 py-3 bg-gray-700 text-white rounded-xl font-bold"
                        >
                          إلغاء
                        </motion.button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              </>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
};

// Footer
const Footer = () => {
  return (
    <footer className="bg-gray-950 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                <span className="text-2xl">🍕</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">بيتزا الشام</h3>
                <p className="text-orange-400 text-xs">منذ 1995</p>
              </div>
            </div>
            <p className="text-gray-400">
              نقدم أفضل البيتزا بأجود المكونات منذ أكثر من 25 عاماً
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">روابط سريعة</h4>
            <ul className="space-y-3">
              {[
                { name: 'الرئيسية', id: 'hero' },
                { name: 'القائمة', id: 'menu' },
                { name: 'العروض', id: 'offers' },
                { name: 'من نحن', id: 'features' },
                { name: 'اتصل بنا', id: 'contact' }
              ].map((item) => (
                <li key={item.name}>
                  <button
                    onClick={() => {
                      if (item.id === 'hero') {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      } else {
                        document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="text-gray-400 hover:text-orange-500 transition-colors"
                  >
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">ساعات العمل</h4>
            <ul className="space-y-3 text-gray-400">
              <li>السبت - الخميس: 11ص - 12م</li>
              <li>الجمعة: 1م - 12م</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">تابعنا</h4>
            <div className="flex gap-4">
              <a
                href={CONTACT_INFO.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:bg-orange-500 hover:text-white transition-colors"
              >
                <Facebook size={18} />
              </a>
              <a
                href={CONTACT_INFO.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:bg-orange-500 hover:text-white transition-colors"
              >
                <Instagram size={18} />
              </a>
              <a
                href={CONTACT_INFO.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:bg-orange-500 hover:text-white transition-colors"
              >
                <Phone size={18} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-gray-500">
          <p>© 2024 بيتزا الشام. جميع الحقوق محفوظة</p>
        </div>
      </div>
    </footer>
  );
};

// Main App Component
function MainApp() {
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showOrderTracker, setShowOrderTracker] = useState(false);
  const [showReferral, setShowReferral] = useState(false);
  const [currentPage, setCurrentPage] = useState('الرئيسية');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [userPoints, setUserPoints] = useState(() => {
    const saved = localStorage.getItem('userPoints');
    return saved ? parseInt(saved) : 150; // نقاط افتراضية للتجربة
  });
  const [lastOrderId, setLastOrderId] = useState(null);
  
  const { darkMode, lang, user } = useApp();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // حفظ النقاط
  useEffect(() => {
    localStorage.setItem('userPoints', userPoints.toString());
  }, [userPoints]);

  const addToCart = (item, size) => {
    const finalPrice = Math.round(item.price * size.multiplier);
    const cartItemId = `${item.id}-${size.id}`;
    
    const existing = cart.find(i => i.id === item.id && i.sizeId === size.id);
    if (existing) {
      setCart(cart.map(i => 
        (i.id === item.id && i.sizeId === size.id) 
          ? {...i, quantity: i.quantity + 1} 
          : i
      ));
    } else {
      setCart([...cart, {
        ...item, 
        sizeId: size.id,
        sizeName: size.name,
        price: finalPrice,
        quantity: 1
      }]);
    }
    
    // إظهار تأكيد الإضافة
    const toast = document.createElement('div');
    toast.className = 'fixed top-24 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse';
    toast.textContent = `✓ تمت إضافة ${item.name} (${size.name})`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  };

  // إضافة نقاط عند الطلب
  const handleOrderComplete = (total) => {
    const earnedPoints = Math.floor(total * POINTS_PER_SHEKEL);
    setUserPoints(prev => prev + earnedPoints);
    setLastOrderId(Math.floor(Math.random() * 90000) + 10000);
    setShowOrderTracker(true);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className={`min-h-screen font-sans ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <Navbar 
        cartCount={cartCount} 
        setShowCart={setShowCart} 
        setCurrentPage={setCurrentPage}
        currentPage={currentPage}
        setShowLogin={setShowLogin}
        userPoints={userPoints}
        setShowReferral={setShowReferral}
      />
      
      <HeroSection />
      <MenuSection 
        addToCart={addToCart} 
        favorites={favorites}
        toggleFavorite={toggleFavorite}
        isFavorite={isFavorite}
      />
      <GallerySection />
      <FeaturesSection />
      <OffersSection />
      <TestimonialsSection />
      <ContactSection />
      <Footer />

      <CartSidebar 
        cart={cart} 
        setCart={setCart} 
        showCart={showCart} 
        setShowCart={setShowCart}
        onOrderComplete={handleOrderComplete}
        userPoints={userPoints}
        setUserPoints={setUserPoints}
      />

      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
      <OrderTracker isOpen={showOrderTracker} onClose={() => setShowOrderTracker(false)} orderId={lastOrderId} />
      <ReferralModal isOpen={showReferral} onClose={() => setShowReferral(false)} />

      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-8 left-8 w-14 h-14 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-orange-500/30 z-40"
          >
            <ArrowUp size={24} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

// App Provider Wrapper
export default function PizzaRestaurant() {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'ar');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  return (
    <AppContext.Provider value={{ lang, setLang, darkMode, setDarkMode, user, setUser }}>
      <MainApp />
    </AppContext.Provider>
  );
}
