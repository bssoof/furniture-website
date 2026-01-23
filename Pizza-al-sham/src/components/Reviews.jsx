import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Send, User, Calendar, ThumbsUp } from 'lucide-react';
import { reviewServices } from '../services/firebase';

export const ReviewsSection = ({ itemId, userId }) => {
  const [reviews, setReviews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    rating: 5,
    comment: ''
  });

  useEffect(() => {
    loadReviews();
  }, [itemId]);

  const loadReviews = async () => {
    setLoading(true);
    const data = await reviewServices.getItemReviews(itemId);
    setReviews(data);
    setLoading(false);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!userId) {
      alert('يجب تسجيل الدخول أولاً');
      return;
    }

    const result = await reviewServices.addReview(userId, itemId, formData);
    if (result.success) {
      setFormData({ rating: 5, comment: '' });
      setShowForm(false);
      await loadReviews();
    }
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <section className="py-12 bg-gray-800 rounded-2xl p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">التقييمات والآراء</h3>
          {!showForm && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setShowForm(true)}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              إضافة تقييم
            </motion.button>
          )}
        </div>

        {/* Rating Summary */}
        <div className="bg-gray-700 p-6 rounded-xl mb-6">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-500">{averageRating}</div>
              <div className="flex gap-1 justify-center mt-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < Math.round(averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500'}
                  />
                ))}
              </div>
              <p className="text-gray-400 text-sm mt-2">{reviews.length} تقييم</p>
            </div>
            <div className="flex-1">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = reviews.filter(r => r.rating === rating).length;
                const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                return (
                  <div key={rating} className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-gray-400 w-4">{rating}</span>
                    <Star size={14} className="text-yellow-400 fill-yellow-400" />
                    <div className="flex-1 h-2 bg-gray-600 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-400 w-8 text-left">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Review Form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onSubmit={handleSubmitReview}
            className="bg-gray-700 p-6 rounded-xl mb-6"
          >
            <div className="mb-4">
              <label className="block text-white mb-3 font-medium">التقييم</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <motion.button
                    key={rating}
                    type="button"
                    whileHover={{ scale: 1.2 }}
                    onClick={() => setFormData({...formData, rating})}
                    className={`p-2 transition-colors ${
                      formData.rating >= rating
                        ? 'text-yellow-400'
                        : 'text-gray-500 hover:text-yellow-400'
                    }`}
                  >
                    <Star
                      size={28}
                      fill={formData.rating >= rating ? 'currentColor' : 'none'}
                    />
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-white mb-2 font-medium">التعليق</label>
              <textarea
                value={formData.comment}
                onChange={(e) => setFormData({...formData, comment: e.target.value})}
                placeholder="اكتب رأيك..."
                rows={4}
                className="w-full px-4 py-3 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none resize-none"
              />
            </div>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                type="submit"
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
              >
                <Send size={18} />
                إرسال التقييم
              </motion.button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-8 text-gray-400">جاري تحميل التقييمات...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-400">لا توجد تقييمات حتى الآن</div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-700 p-4 rounded-lg"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                    {review.userName?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="text-white font-medium">{review.userName || 'مستخدم'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500'}
                          />
                        ))}
                      </div>
                      <span className="text-gray-400 text-sm ml-2">
                        <Calendar size={14} className="inline mr-1" />
                        منذ يومين
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-gray-300 text-sm mb-3">{review.comment}</p>
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-1 text-gray-400 hover:text-green-400 transition-colors text-sm">
                  <ThumbsUp size={14} />
                  <span>0</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
};

export const ReviewsModal = ({ isOpen, onClose, itemId, userId }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-800 rounded-2xl max-w-2xl w-full max-h-96 overflow-y-auto"
      >
        <ReviewsSection itemId={itemId} userId={userId} />
      </motion.div>
    </div>
  );
};
