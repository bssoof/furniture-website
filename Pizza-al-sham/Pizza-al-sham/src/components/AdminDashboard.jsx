import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, Package, ShoppingCart, Users, TrendingUp, Plus, Edit2, Trash2,
  Eye, Search, Filter, Download, Settings, LogOut
} from 'lucide-react';
import { orderServices, menuServices } from '../services/firebase';

export const AdminDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    if (activeTab === 'orders') {
      // تحميل الطلبات
    } else if (activeTab === 'menu') {
      const items = await menuServices.getMenuItems();
      setMenuItems(items);
    }
    setLoading(false);
  };

  const stats = [
    { label: 'الطلبات اليوم', value: '24', icon: ShoppingCart, color: 'orange' },
    { label: 'المستخدمون', value: '156', icon: Users, color: 'blue' },
    { label: 'الإيرادات', value: '2,450 شيكل', icon: TrendingUp, color: 'green' },
    { label: 'المنتجات', value: menuItems.length, icon: Package, color: 'purple' }
  ];

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">لوحة التحكم</h1>
            <p className="text-gray-400">أدر مطعم بيتزا الشام</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={onLogout}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <LogOut size={20} />
            تسجيل الخروج
          </motion.button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800 p-6 rounded-2xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
                </div>
                <div className={`w-14 h-14 rounded-full flex items-center justify-center bg-${stat.color}-500/20 text-${stat.color}-500`}>
                  <stat.icon size={28} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-700">
          {['orders', 'menu', 'users', 'analytics'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === tab
                  ? 'text-orange-500 border-b-2 border-orange-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'orders' && 'الطلبات'}
              {tab === 'menu' && 'قائمة الطعام'}
              {tab === 'users' && 'المستخدمون'}
              {tab === 'analytics' && 'الإحصائيات'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-gray-800 rounded-2xl p-6">
          {activeTab === 'orders' && <OrdersSection orders={orders} loading={loading} />}
          {activeTab === 'menu' && <MenuSection items={menuItems} loading={loading} />}
          {activeTab === 'users' && <UsersSection loading={loading} />}
          {activeTab === 'analytics' && <AnalyticsSection />}
        </div>
      </div>
    </div>
  );
};

const OrdersSection = ({ orders, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOrders = orders.filter(order =>
    order.id?.includes(searchTerm) || order.phone?.includes(searchTerm)
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">الطلبات</h2>
        <div className="relative">
          <Search className="absolute right-3 top-3 text-gray-500" size={20} />
          <input
            type="text"
            placeholder="بحث عن طلب..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-4 pr-10 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-orange-500 focus:outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-400">جاري التحميل...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-8 text-gray-400">لا توجد طلبات</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-right px-6 py-4 text-gray-400">معرف الطلب</th>
                <th className="text-right px-6 py-4 text-gray-400">العميل</th>
                <th className="text-right px-6 py-4 text-gray-400">المجموع</th>
                <th className="text-right px-6 py-4 text-gray-400">الحالة</th>
                <th className="text-right px-6 py-4 text-gray-400">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                  <td className="px-6 py-4 text-white">{order.id}</td>
                  <td className="px-6 py-4 text-white">{order.phone}</td>
                  <td className="px-6 py-4 text-orange-500 font-bold">{order.total} شيكل</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      order.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {order.status === 'completed' && 'مكتمل'}
                      {order.status === 'pending' && 'قيد الانتظار'}
                      {order.status === 'preparing' && 'جاري التحضير'}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <button className="p-2 hover:bg-gray-600 rounded transition-colors">
                      <Eye size={18} className="text-gray-400" />
                    </button>
                    <button className="p-2 hover:bg-gray-600 rounded transition-colors">
                      <Edit2 size={18} className="text-gray-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const MenuSection = ({ items, loading }) => {
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">إدارة قائمة الطعام</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
        >
          <Plus size={20} />
          إضافة طبق جديد
        </motion.button>
      </div>

      {showAddForm && <AddMenuItemForm />}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item.id} className="bg-gray-700 rounded-xl p-4">
            <div className="w-full h-32 bg-orange-500/20 rounded-lg mb-4 flex items-center justify-center">
              <span className="text-6xl">🍕</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{item.name}</h3>
            <p className="text-gray-400 text-sm mb-4">{item.price} شيكل</p>
            <div className="flex gap-2">
              <button className="flex-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
                <Edit2 size={16} />
                تعديل
              </button>
              <button className="flex-1 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors flex items-center justify-center gap-2">
                <Trash2 size={16} />
                حذف
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AddMenuItemForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'كلاسيك',
    description: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    // إضافة الطبق
    console.log('Adding menu item:', formData);
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="bg-gray-700 p-6 rounded-xl mb-6 grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      <input
        type="text"
        placeholder="اسم الطبق"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
        className="px-4 py-2 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400"
      />
      <input
        type="number"
        placeholder="السعر"
        value={formData.price}
        onChange={(e) => setFormData({...formData, price: e.target.value})}
        className="px-4 py-2 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400"
      />
      <select
        value={formData.category}
        onChange={(e) => setFormData({...formData, category: e.target.value})}
        className="px-4 py-2 bg-gray-600 border border-gray-500 rounded text-white"
      >
        <option>كلاسيك</option>
        <option>مميزة</option>
        <option>نباتي</option>
        <option>فاخرة</option>
      </select>
      <input
        type="text"
        placeholder="الوصف"
        value={formData.description}
        onChange={(e) => setFormData({...formData, description: e.target.value})}
        className="px-4 py-2 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 col-span-2"
      />
      <button
        type="submit"
        className="col-span-2 px-6 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
      >
        إضافة
      </button>
    </motion.form>
  );
};

const UsersSection = ({ loading }) => {
  return (
    <div className="text-center py-8 text-gray-400">
      إدارة المستخدمين قريباً
    </div>
  );
};

const AnalyticsSection = () => {
  return (
    <div className="text-center py-8 text-gray-400">
      الإحصائيات والتقارير قريباً
    </div>
  );
};
