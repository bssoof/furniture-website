import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  query, 
  where, 
  getDocs,
  addDoc,
  updateDoc,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Firebase Configuration - تحديث هذه البيانات من Firebase Console
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo_key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "pizza-al-sham.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "pizza-al-sham",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "pizza-al-sham.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "demo",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "demo"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Auth Services
export const authServices = {
  // تسجيل حساب جديد
  registerUser: async (email, password, userData) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // تحديث الملف الشخصي
      await updateProfile(user, {
        displayName: userData.fullName
      });

      // حفظ بيانات المستخدم في Firestore
      await setDoc(doc(db, 'users', user.uid), {
        fullName: userData.fullName,
        email: email,
        phone: userData.phone,
        address: userData.address || '',
        createdAt: serverTimestamp(),
        favorites: [],
        orderHistory: [],
        avatar: '',
        preferences: {
          notifications: true,
          emailUpdates: true
        }
      });

      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // تسجيل الدخول
  loginUser: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // تسجيل الخروج
  logoutUser: async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // الاستماع لتغييرات حالة المستخدم
  onAuthStateChange: (callback) => {
    return onAuthStateChanged(auth, callback);
  }
};

// User Services
export const userServices = {
  // الحصول على بيانات المستخدم
  getUserData: async (userId) => {
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  },

  // تحديث بيانات المستخدم
  updateUserData: async (userId, data) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, data);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // إضافة إلى المفضلة
  addToFavorites: async (userId, itemId) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userData = await userServices.getUserData(userId);
      const favorites = userData?.favorites || [];
      
      if (!favorites.includes(itemId)) {
        favorites.push(itemId);
        await updateDoc(userRef, { favorites });
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // إزالة من المفضلة
  removeFromFavorites: async (userId, itemId) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userData = await userServices.getUserData(userId);
      const favorites = userData?.favorites || [];
      
      const updatedFavorites = favorites.filter(id => id !== itemId);
      await updateDoc(userRef, { favorites: updatedFavorites });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// Orders Services
export const orderServices = {
  // إنشاء طلب جديد
  createOrder: async (userId, orderData) => {
    try {
      const ordersCollection = collection(db, 'orders');
      const docRef = await addDoc(ordersCollection, {
        userId,
        items: orderData.items,
        total: orderData.total,
        status: 'pending', // pending, confirmed, preparing, on_the_way, delivered
        deliveryAddress: orderData.address,
        phoneNumber: orderData.phone,
        notes: orderData.notes || '',
        paymentStatus: 'pending', // pending, completed, failed
        paymentMethod: orderData.paymentMethod || 'cash',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        estimatedDelivery: null
      });
      return { success: true, orderId: docRef.id };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // الحصول على طلبات المستخدم
  getUserOrders: async (userId) => {
    try {
      const q = query(
        collection(db, 'orders'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting orders:', error);
      return [];
    }
  },

  // الحصول على تفاصيل الطلب
  getOrderDetails: async (orderId) => {
    try {
      const docRef = doc(db, 'orders', orderId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
    } catch (error) {
      console.error('Error getting order details:', error);
      return null;
    }
  },

  // تحديث حالة الطلب (للإدارة)
  updateOrderStatus: async (orderId, status) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { 
        status,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// Menu Services
export const menuServices = {
  // الحصول على جميع المنتجات
  getMenuItems: async () => {
    try {
      const menuCollection = collection(db, 'menu');
      const querySnapshot = await getDocs(menuCollection);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting menu items:', error);
      return [];
    }
  },

  // إضافة منتج جديد (للإدارة)
  addMenuItem: async (itemData) => {
    try {
      const menuCollection = collection(db, 'menu');
      const docRef = await addDoc(menuCollection, {
        ...itemData,
        createdAt: serverTimestamp()
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // تحديث منتج (للإدارة)
  updateMenuItem: async (itemId, itemData) => {
    try {
      const itemRef = doc(db, 'menu', itemId);
      await updateDoc(itemRef, {
        ...itemData,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// Reviews Services
export const reviewServices = {
  // إضافة تقييم
  addReview: async (userId, itemId, reviewData) => {
    try {
      const reviewsCollection = collection(db, 'reviews');
      const docRef = await addDoc(reviewsCollection, {
        userId,
        itemId,
        rating: reviewData.rating,
        comment: reviewData.comment,
        createdAt: serverTimestamp()
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // الحصول على تقييمات المنتج
  getItemReviews: async (itemId) => {
    try {
      const q = query(
        collection(db, 'reviews'),
        where('itemId', '==', itemId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting reviews:', error);
      return [];
    }
  }
};

// Storage Services
export const storageServices = {
  // تحميل صورة
  uploadImage: async (file, path) => {
    try {
      const storageRef = ref(storage, `${path}/${file.name}-${Date.now()}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      return { success: true, url: downloadURL };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

export default {
  authServices,
  userServices,
  orderServices,
  menuServices,
  reviewServices,
  storageServices
};
