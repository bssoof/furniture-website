import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff, Mail, Phone, Home, User, Lock } from 'lucide-react';
import { authServices } from '../services/firebase';
import { useAuthStore } from '../store';

export const AuthModal = ({ isOpen, onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    address: ''
  });

  const setUser = useAuthStore(state => state.setUser);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await authServices.loginUser(formData.email, formData.password);
      } else {
        result = await authServices.registerUser(formData.email, formData.password, {
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address
        });
      }

      if (result.success) {
        setUser(result.user);
        onSuccess?.();
        onClose();
        setFormData({
          email: '',
          password: '',
          fullName: '',
          phone: '',
          address: ''
        });
      } else {
        setError(result.error || 'حدث خطأ ما');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-md bg-gray-800 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <>
                    <div>
                      <label className="block text-white mb-2 font-medium">الاسم الكامل</label>
                      <div className="relative">
                        <User className="absolute right-3 top-3 text-gray-500" size={20} />
                        <input
                          type="text"
                          value={formData.fullName}
                          onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                          className="w-full pl-4 pr-10 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:border-orange-500 focus:outline-none transition-colors"
                          placeholder="أدخل اسمك الكامل"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-white mb-2 font-medium">رقم الهاتف</label>
                      <div className="relative">
                        <Phone className="absolute right-3 top-3 text-gray-500" size={20} />
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="w-full pl-4 pr-10 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:border-orange-500 focus:outline-none transition-colors"
                          placeholder="أدخل رقم هاتفك"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-white mb-2 font-medium">البريد الإلكتروني</label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-3 text-gray-500" size={20} />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full pl-4 pr-10 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:border-orange-500 focus:outline-none transition-colors"
                      placeholder="أدخل بريدك الإلكتروني"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white mb-2 font-medium">كلمة المرور</label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-3 text-gray-500" size={20} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="w-full pl-10 pr-10 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:border-orange-500 focus:outline-none transition-colors"
                      placeholder="أدخل كلمة المرور"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-3 text-gray-500"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-500/20 border border-red-500 rounded-xl text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-bold disabled:opacity-50"
                >
                  {isLoading ? 'جاري المعالجة...' : (isLogin ? 'دخول' : 'إنشاء حساب')}
                </motion.button>
              </form>

              <button
                onClick={() => setIsLogin(!isLogin)}
                className="w-full mt-4 text-orange-400 hover:text-orange-300 transition-colors"
              >
                {isLogin ? 'ليس لديك حساب؟ إنشاء واحد جديد' : 'هل لديك حساب؟ دخول'}
              </button>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export const UserProfile = ({ user, onLogout }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    fullName: user?.displayName || '',
    phone: '',
    address: ''
  });

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 p-8 rounded-2xl">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-4xl">
              {user?.displayName?.charAt(0) || '👤'}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{user?.displayName}</h2>
              <p className="text-gray-400">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => onLogout?.()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            تسجيل الخروج
          </button>
        </div>

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            تعديل الملف الشخصي
          </button>
        ) : (
          <form className="space-y-4">
            <div>
              <label className="block text-white mb-2">الاسم</label>
              <input
                type="text"
                value={editData.fullName}
                onChange={(e) => setEditData({...editData, fullName: e.target.value})}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                حفظ
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
