import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { ArrowLeft, User, Mail, Phone, Calendar, ShoppingBag, DollarSign } from 'lucide-react';

export default function CustomerDetails() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const fetchCustomer = async () => {
    try {
      const { data } = await api.get(`/admin/customers/${id}`);
      setCustomer(data.data);
    } catch (error) {
      console.error('Failed to fetch customer', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="animate-pulse p-6">Loading customer...</div>;
  if (!customer) return <div className="p-6 text-red-500">Customer not found.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/customers" className="p-2 text-charcoal/60 hover:text-charcoal bg-white rounded-lg shadow-sm border border-charcoal/5">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-serif font-bold text-charcoal">Customer Details</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-charcoal/5 p-6 space-y-4">
            <div className="w-16 h-16 bg-brand/10 text-brand rounded-full flex items-center justify-center text-2xl font-bold uppercase mx-auto">
              {customer.firstName?.[0]}{customer.lastName?.[0]}
            </div>
            <div className="text-center">
              <h2 className="text-lg font-bold text-charcoal">{customer.firstName} {customer.lastName}</h2>
              <span className={`inline-flex items-center px-2 py-0.5 mt-2 rounded-full text-xs font-medium ${customer.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {customer.isActive ? 'Active Account' : 'Inactive'}
              </span>
            </div>
            <div className="pt-4 space-y-3 border-t border-charcoal/5">
              <div className="flex items-center gap-3 text-sm text-charcoal/70">
                <Mail className="w-4 h-4" /> {customer.email}
              </div>
              {customer.phone && (
                <div className="flex items-center gap-3 text-sm text-charcoal/70">
                  <Phone className="w-4 h-4" /> {customer.phone}
                </div>
              )}
              <div className="flex items-center gap-3 text-sm text-charcoal/70">
                <Calendar className="w-4 h-4" /> Joined {new Date(customer.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-span-1 md:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-charcoal/5 flex items-center gap-4">
              <div className="p-3 bg-brand/10 text-brand rounded-xl">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-charcoal/60">Total Orders</p>
                <p className="text-2xl font-bold text-charcoal">{customer.orderCount || 0}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-charcoal/5 flex items-center gap-4">
              <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-charcoal/60">Total Spent</p>
                <p className="text-2xl font-bold text-charcoal">${(customer.totalSpent || 0).toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-charcoal/5">
            <h3 className="text-lg font-bold text-charcoal mb-4">Addresses</h3>
            {customer.addresses?.length > 0 ? (
              <div className="space-y-4">
                {customer.addresses.map((addr) => (
                  <div key={addr._id} className="p-4 border border-charcoal/10 rounded-lg">
                    <p className="font-medium text-sm text-charcoal">
                      {addr.firstName} {addr.lastName} {addr.isDefault && <span className="ml-2 text-xs bg-brand/10 text-brand px-2 py-0.5 rounded">Default</span>}
                    </p>
                    <p className="text-sm text-charcoal/70 mt-1">
                      {addr.streetAddress}<br />
                      {addr.apartment && <>{addr.apartment}<br /></>}
                      {addr.city}, {addr.state} {addr.postalCode}<br />
                      {addr.country}
                    </p>
                    <p className="text-sm text-charcoal/50 mt-2">{addr.phone}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-charcoal/50">No addresses saved.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
