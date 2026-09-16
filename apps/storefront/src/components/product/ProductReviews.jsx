import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import Button from '../ui/Button';
import { Star, Upload, X, Loader2, Image as ImageIcon, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

export default function ProductReviews({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (productId) {
      fetchReviews();
      if (isAuthenticated) {
        checkHasReviewed();
      }
    }
  }, [productId, isAuthenticated]);

  const checkHasReviewed = async () => {
    try {
      const res = await api.get(`/reviews/check/${productId}`);
      if (res.data?.hasReviewed) {
        setHasReviewed(true);
      }
    } catch (error) {
      console.error('Failed to check review status', error);
    }
  };

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/reviews/${productId}`);
      setReviews(res.data || []);
    } catch (error) {
      console.error('Failed to fetch reviews', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = () => {
    setShowForm(false);
    setHasReviewed(true);
    fetchReviews();
  };

  return (
    <div className="mt-16 pt-12 border-t border-gray-200">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-serif text-charcoal">Customer Reviews</h2>
        {!showForm && !hasReviewed && (
          <Button variant="outline" onClick={() => setShowForm(true)}>
            Write a Review
          </Button>
        )}
        {!showForm && hasReviewed && (
          <div className="flex items-center text-green-600 gap-2 bg-green-50 px-4 py-2 rounded-lg text-sm font-medium">
            <CheckCircle className="w-4 h-4" /> Thanks for your review!
          </div>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-12"
          >
            <div className="bg-gray-50 p-6 rounded-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-serif font-semibold">Write your review</h3>
                <button onClick={() => setShowForm(false)} className="p-2 text-gray-500 hover:text-charcoal rounded-full hover:bg-gray-200 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <ReviewForm productId={productId} onSubmitSuccess={handleReviewSubmit} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-pink-primary" />
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-8">
          {reviews.map((review) => (
            <ReviewItem key={review._id} review={review} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-2xl">
          <p className="text-gray-500 mb-4">No reviews yet for this product.</p>
          {!showForm && !hasReviewed && (
            <Button variant="dark" onClick={() => setShowForm(true)}>
              Be the first to review
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function ReviewItem({ review }) {
  return (
    <div className="border-b border-gray-100 pb-8 last:border-0 last:pb-0">
      <div className="flex items-center gap-2 mb-2">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star 
              key={star} 
              className={`w-4 h-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`} 
            />
          ))}
        </div>
        <span className="text-sm font-semibold text-charcoal ml-2">
          {review.title}
        </span>
      </div>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-gray-500 font-medium">
          {review.userId?.firstName ? `${review.userId.firstName} ${review.userId.lastName}` : (review.customerName || 'Verified Buyer')}
        </span>
        <span className="text-xs text-gray-400">•</span>
        <span className="text-xs text-gray-400">
          {new Date(review.createdAt).toLocaleDateString()}
        </span>
      </div>
      <p className="text-gray-600 text-sm leading-relaxed mb-4">
        {review.content}
      </p>
      
      {/* Review Images */}
      {review.images && review.images.length > 0 && (
        <div className="flex flex-wrap gap-3 mt-4">
          {review.images.map((img, idx) => (
            <a 
              key={idx} 
              href={img} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block w-20 h-20 rounded-lg overflow-hidden border border-gray-200 hover:opacity-80 transition-opacity"
            >
              <img src={img} alt="Review attachment" className="w-full h-full object-cover" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function ReviewForm({ productId, onSubmitSuccess }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(5);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploading(true);
    setError('');

    try {
      const uploadedUrls = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await api.post('/reviews/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data?.url) {
          uploadedUrls.push(res.data.url);
        }
      }
      setImages(prev => [...prev, ...uploadedUrls]);
    } catch (err) {
      console.error('Image upload failed', err);
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (indexToRemove) => {
    setImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || !title || !content) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await api.post('/reviews', {
        productId,
        rating,
        title,
        content,
        images
      });
      onSubmitSuccess();
    } catch (err) {
      console.error('Review submission failed', err);
      setError(err.response?.data?.error?.message || 'Failed to submit review. Please make sure you are logged in.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
          {error}
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Overall Rating *</label>
        <div className="flex gap-1" onMouseLeave={() => setHoverRating(rating)}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              className="p-1 focus:outline-none"
            >
              <Star 
                className={`w-6 h-6 transition-colors ${
                  star <= hoverRating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'
                }`} 
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Review Title *</label>
        <input 
          type="text" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your experience"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-primary focus:ring-1 focus:ring-pink-primary"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Review Content *</label>
        <textarea 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Tell us what you liked or disliked about this product."
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-primary focus:ring-1 focus:ring-pink-primary resize-y"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Attach Photos (Optional)</label>
        <div className="flex flex-wrap gap-3">
          {images.map((url, idx) => (
            <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 group">
              <img src={url} alt="Upload preview" className="w-full h-full object-cover" />
              <button 
                type="button" 
                onClick={() => removeImage(idx)}
                className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          
          <label className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            {uploading ? (
              <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
            ) : (
              <>
                <ImageIcon className="w-5 h-5 text-gray-400 mb-1" />
                <span className="text-[10px] text-gray-500 font-medium">Add Photo</span>
              </>
            )}
            <input 
              type="file" 
              accept="image/*" 
              multiple 
              className="hidden" 
              onChange={handleImageUpload}
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <Button type="submit" variant="dark" disabled={submitting || uploading}>
          {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2 inline" /> : null}
          Submit Review
        </Button>
      </div>
    </form>
  );
}
