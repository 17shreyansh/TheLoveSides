import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { User, Package, MapPin, LogOut, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('personal');
  
  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Orders state
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/');
    } else if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setPhone(user.phone || '');
      
      // Fetch orders
      const fetchOrders = async () => {
        setLoadingOrders(true);
        try {
          // api.js handles baseURL and token via interceptors
          const { api } = await import('../lib/api.js');
          const data = await api.get('/orders', { withCredentials: true });
          setOrders(data.data || []);
        } catch (err) {
          console.error('Failed to fetch orders:', err);
        } finally {
          setLoadingOrders(false);
        }
      };
      
      fetchOrders();
    }
  }, [user, isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <Loader2 className="w-10 h-10 animate-spin text-pink-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !user) return null;

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      await updateProfile({ firstName, lastName, phone });
      setMessage('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'orders', label: 'Order History', icon: Package },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
  ];

  return (
    <div className="bg-cream min-h-screen pt-32 pb-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl sm:text-5xl font-serif text-charcoal mb-2">
              My Profile
            </h1>
            <p className="text-charcoal/60 text-lg font-sans">
              Manage your account and preferences
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl font-medium transition-colors shadow-sm border border-red-100"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-pink-soft/20 sticky top-24">
              <div className="p-4 mb-4 bg-ivory rounded-xl border border-pink-soft/10">
                <div className="font-serif text-charcoal text-xl mb-1">
                  {user.firstName || user.lastName ? `${user.firstName || ''} ${user.lastName || ''}` : 'Welcome User'}
                </div>
                <div className="text-charcoal/60 text-sm font-sans">{user.email}</div>
              </div>
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                        isActive 
                          ? 'bg-pink-primary text-white shadow-md' 
                          : 'text-charcoal/70 hover:bg-ivory hover:text-pink-primary'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-8 sm:p-10 shadow-sm border border-pink-soft/20"
            >
              {activeTab === 'personal' && (
                <div>
                  <h2 className="text-3xl font-serif text-charcoal mb-8">Personal Information</h2>
                  
                  {message && (
                    <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl flex items-center gap-3 border border-green-100">
                      <CheckCircle2 className="w-5 h-5 shrink-0" />
                      <p className="font-medium text-sm">{message}</p>
                    </div>
                  )}

                  {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 border border-red-100">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <p className="font-medium text-sm">{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-2xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-charcoal/80 mb-2">First Name</label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full px-4 py-3 bg-ivory border-2 border-transparent focus:border-pink-primary focus:bg-white rounded-xl text-charcoal outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-charcoal/80 mb-2">Last Name</label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full px-4 py-3 bg-ivory border-2 border-transparent focus:border-pink-primary focus:bg-white rounded-xl text-charcoal outline-none transition-all"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-charcoal/80 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={user.email}
                        disabled
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl text-charcoal/50 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-charcoal/80 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-3 bg-ivory border-2 border-transparent focus:border-pink-primary focus:bg-white rounded-xl text-charcoal outline-none transition-all"
                      />
                    </div>

                    <div className="pt-4">
                      <Button
                        type="submit"
                        disabled={saving}
                        className="min-w-[150px] flex items-center justify-center rounded-xl"
                      >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'orders' && (
                <div>
                  <h2 className="text-3xl font-serif text-charcoal mb-8">Order History</h2>
                  
                  {loadingOrders ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-pink-primary" />
                    </div>
                  ) : orders.length > 0 ? (
                    <div className="space-y-6">
                      {orders.map((order) => (
                        <div key={order._id || order.id} className="border border-pink-soft/20 rounded-2xl p-6 bg-ivory/30 shadow-sm transition-all hover:shadow-md">
                          <div className="flex flex-col md:flex-row justify-between md:items-center border-b border-pink-soft/20 pb-4 mb-4 gap-4">
                            <div>
                              <div className="text-sm text-charcoal/60 mb-1">
                                Order Placed
                              </div>
                              <div className="font-medium text-charcoal">
                                {new Date(order.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric', month: 'long', day: 'numeric'
                                })}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-charcoal/60 mb-1">
                                Total
                              </div>
                              <div className="font-medium text-charcoal">
                                ₹{order.grandTotal?.toFixed(2) || (order.amount || 0).toFixed(2)}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-charcoal/60 mb-1">
                                Order Number
                              </div>
                              <Link 
                                to={`/order/${order._id}`}
                                className="font-medium text-pink-primary hover:text-pink-primary/80 font-mono underline underline-offset-4"
                              >
                                {order.orderNumber || order.id}
                              </Link>
                            </div>
                            <div className="md:text-right">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-pink-primary/10 text-pink-primary border border-pink-primary/20">
                                {order.status?.replace(/_/g, ' ') || 'PROCESSING'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            {order.items?.map((item, index) => (
                              <div key={index} className="flex gap-4 items-center">
                                {item.image ? (
                                  <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-xl border border-pink-soft/20" />
                                ) : (
                                  <div className="w-16 h-16 bg-gray-100 flex items-center justify-center rounded-xl border border-pink-soft/20">
                                    <Package className="w-6 h-6 text-gray-400" />
                                  </div>
                                )}
                                <div className="flex-1">
                                  <h4 className="font-serif text-charcoal">{item.name}</h4>
                                  <p className="text-sm text-charcoal/60">Qty: {item.quantity}</p>
                                </div>
                                <div className="text-right font-medium text-charcoal">
                                  ₹{(item.price * item.quantity).toFixed(2)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center bg-ivory/50 rounded-2xl border border-dashed border-pink-soft/50">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                        <Package className="w-8 h-8 text-pink-primary" />
                      </div>
                      <h3 className="text-xl font-serif text-charcoal mb-2">No orders yet</h3>
                      <p className="text-charcoal/60 font-sans">When you place orders, they will appear here.</p>
                      <Button className="mt-6 rounded-xl" onClick={() => navigate('/products')}>
                        Start Shopping
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'addresses' && (
                <div>
                  <h2 className="text-3xl font-serif text-charcoal mb-8">Saved Addresses</h2>
                  <div className="flex flex-col items-center justify-center py-24 text-center bg-ivory/50 rounded-2xl border border-dashed border-pink-soft/50">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                      <MapPin className="w-8 h-8 text-pink-primary" />
                    </div>
                    <h3 className="text-xl font-serif text-charcoal mb-2">No addresses saved</h3>
                    <p className="text-charcoal/60 font-sans">Add an address during checkout to save it here.</p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
