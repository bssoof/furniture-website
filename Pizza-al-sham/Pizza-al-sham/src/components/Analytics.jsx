import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, TrendingUp, Users, ShoppingCart, DollarSign,
  Calendar, Download, Eye, ArrowUp, ArrowDown
} from 'lucide-react';

export const Analytics = () => {
  const [period, setPeriod] = useState('week'); // week, month, year
  const [data, setData] = useState({
    totalOrders: 126,
    totalRevenue: 5420,
    totalUsers: 342,
    averageOrderValue: 43,
    topProducts: [
      { name: 'بيتزا مارغريتا', sales: 45, revenue: 1575 },
      { name: 'بيتزا بيبروني', sales: 38, revenue: 1710 },
      { name: 'بيتزا سي فود', sales: 28, revenue: 1820 },
    ],
    ordersByDay: [
      { day: 'السبت', orders: 18 },
      { day: 'الأحد', orders: 22 },
      { day: 'الاثنين', orders: 19 },
      { day: 'الثلاثاء', orders: 25 },
      { day: 'الأربعاء', orders: 21 },
      { day: 'الخميس', orders: 20 },
      { day: 'الجمعة', orders: 1 },
    ],
    customerSatisfaction: 4.7
  });

  const stats = [
    { 
      label: 'إجمالي الطلبات', 
      value: data.totalOrders, 
      change: '+12.5%',
      icon: ShoppingCart,
      color: 'blue'
    },
    { 
      label: 'الإيرادات', 
      value: `${data.totalRevenue} شيكل`, 
      change: '+8.2%',
      icon: DollarSign,
      color: 'green'
    },
    { 
      label: 'المستخدمون', 
      value: data.totalUsers, 
      change: '+15.3%',
      icon: Users,
      color: 'purple'
    },
    { 
      label: 'متوسط الطلب', 
      value: `${data.averageOrderValue} شيكل`, 
      change: '+3.1%',
      icon: BarChart3,
      color: 'orange'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white">الإحصائيات والتقارير</h2>
        <div className="flex gap-2">
          {['week', 'month', 'year'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                period === p
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              {p === 'week' && 'هذا الأسبوع'}
              {p === 'month' && 'هذا الشهر'}
              {p === 'year' && 'هذه السنة'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800 p-6 rounded-2xl"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-gray-400 text-sm">{stat.label}</p>
                <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-${stat.color}-500/20 text-${stat.color}-500`}>
                <stat.icon size={24} />
              </div>
            </div>
            <div className="flex items-center gap-2 text-green-400 text-sm">
              <ArrowUp size={16} />
              <span>{stat.change}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by Day */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-800 p-6 rounded-2xl"
        >
          <h3 className="text-lg font-bold text-white mb-6">الطلبات حسب اليوم</h3>
          <div className="space-y-4">
            {data.ordersByDay.map((day, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">{day.day}</span>
                  <span className="text-white font-bold">{day.orders}</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(day.orders / 25) * 100}%` }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-orange-500 to-red-600"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-800 p-6 rounded-2xl"
        >
          <h3 className="text-lg font-bold text-white mb-6">أفضل المنتجات</h3>
          <div className="space-y-4">
            {data.topProducts.map((product, index) => (
              <div key={index} className="bg-gray-700/50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{product.name}</span>
                  <span className="text-orange-500 font-bold">{product.sales} بيع</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="h-2 flex-1 bg-gray-600 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(product.sales / 45) * 100}%` }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-600"
                    />
                  </div>
                  <span className="text-gray-400 text-sm ml-4">{product.revenue} شيكل</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-orange-500/20 to-red-600/20 border border-orange-500/30 p-6 rounded-2xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-gray-400 text-sm">رضا العملاء</p>
            <p className="text-3xl font-bold text-yellow-400 mt-2">{data.customerSatisfaction} ⭐</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">معدل النمو</p>
            <p className="text-3xl font-bold text-green-400 mt-2">+12.5%</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">معدل التحويل</p>
            <p className="text-3xl font-bold text-blue-400 mt-2">28%</p>
          </div>
        </div>
      </motion.div>

      {/* Export Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
      >
        <Download size={20} />
        تنزيل التقرير
      </motion.button>
    </div>
  );
};

export default Analytics;
