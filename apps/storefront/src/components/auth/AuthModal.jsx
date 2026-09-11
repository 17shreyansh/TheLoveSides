import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, KeyRound, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';

export default function AuthModal({ isOpen, onClose }) {
  const { requestOtp, verifyOtp } = useAuth();
  
  const [step, setStep] = useState('email'); // 'email' | 'otp'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter a valid email address');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await requestOtp(email);
      setSuccessMsg('OTP sent to your email!');
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('OTP must be 6 digits');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await verifyOtp(email, otp);
      setSuccessMsg('Successfully logged in!');
      setTimeout(() => {
        onClose();
        // reset state after closing
        setTimeout(() => {
          setStep('email');
          setEmail('');
          setOtp('');
          setSuccessMsg(null);
        }, 500);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-hero-dark/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-cream rounded-2xl shadow-2xl overflow-hidden p-8 sm:p-10 z-10 border border-pink-soft/30"
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-charcoal/50 hover:text-pink-primary transition-colors focus:outline-none"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="mb-8 text-center">
              <h2 className="text-3xl sm:text-4xl font-serif text-charcoal mb-3">
                {step === 'email' ? 'Welcome Back' : 'Verify Email'}
              </h2>
              <p className="text-charcoal/70 font-sans text-sm sm:text-base">
                {step === 'email' 
                  ? 'Enter your email to receive a magic code.'
                  : `We sent a 6-digit code to ${email}`}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 text-sm font-medium border border-red-100">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {successMsg && (
              <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl flex items-center gap-3 text-sm font-medium border border-green-100">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <p>{successMsg}</p>
              </div>
            )}

            {step === 'email' ? (
              <form onSubmit={handleRequestOtp} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-charcoal/80 mb-2 font-sans">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal/40" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-12 pr-4 py-4 bg-ivory border-2 border-transparent focus:border-pink-primary focus:bg-white rounded-xl text-charcoal outline-none transition-all font-sans"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 text-lg flex items-center justify-center rounded-xl"
                >
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    'Continue with Email'
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-charcoal/80 mb-2 font-sans">
                    6-Digit Code
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal/40" />
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      className="w-full pl-12 pr-4 py-4 bg-ivory border-2 border-transparent focus:border-pink-primary focus:bg-white rounded-xl text-charcoal outline-none transition-all tracking-widest font-mono text-xl text-center"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full py-4 text-lg flex items-center justify-center rounded-xl"
                >
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    'Verify & Login'
                  )}
                </Button>
                
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="w-full text-center text-sm text-charcoal/60 hover:text-pink-primary transition-colors font-sans mt-4"
                >
                  Use a different email
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

