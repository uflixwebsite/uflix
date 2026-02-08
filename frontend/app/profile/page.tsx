'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SignOutButton } from '@clerk/nextjs';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getCurrentUser } from '@/services/authService';
import { getOrders, trackOrder, cancelOrder } from '@/services/orderService';
import { useAuthState } from '@/hooks/useAuthState';
import api from '@/services/api';

export default function ProfilePage() {
  const router = useRouter();
  const { status, user: authUser } = useAuthState();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [editing, setEditing] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [trackingInfo, setTrackingInfo] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [addressForm, setAddressForm] = useState({
    name: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false,
  });

  useEffect(() => {
    // Wait for auth to finish loading
    if (status === 'loading') {
      return;
    }

    // Only redirect when we know the auth state
    if (status === 'unauthenticated') {
      router.push('/sign-in');
      return;
    }

    // User is authenticated - fetch user data
    if (status === 'authenticated') {
      fetchUser();
    }
  }, [status, router]);

  useEffect(() => {
    if (activeTab === 'orders' && orders.length === 0) {
      fetchOrders();
    }
  }, [activeTab]);

  const fetchUser = async () => {
    try {
      const data = await getCurrentUser();
      setUser(data.data);
      setFormData({
        name: data.data.name,
        email: data.data.email,
        phone: data.data.phone || '',
      });
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const data = await getOrders();
      setOrders(data.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleTrackOrder = async (orderId: string) => {
    try {
      const data = await trackOrder(orderId);
      setTrackingInfo(data.data);
      setSelectedOrder(orderId);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to track order');
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    const reason = prompt('Please provide a reason for cancellation:');
    if (!reason) return;
    
    try {
      await cancelOrder(orderId, reason);
      alert('Order cancelled successfully!');
      fetchOrders();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/users/profile', formData);
      alert('Profile updated successfully!');
      setEditing(false);
      fetchUser();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    try {
      await api.put('/auth/updatepassword', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      alert('Password updated successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update password');
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAddress) {
        await api.put(`/users/address/${editingAddress._id}`, addressForm);
        alert('Address updated successfully!');
      } else {
        await api.post('/users/address', addressForm);
        alert('Address added successfully!');
      }
      setShowAddressForm(false);
      setEditingAddress(null);
      setAddressForm({
        name: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        isDefault: false,
      });
      fetchUser();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to save address');
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      await api.delete(`/users/address/${addressId}`);
      alert('Address deleted successfully!');
      fetchUser();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete address');
    }
  };

  const handleEditAddress = (address: any) => {
    setEditingAddress(address);
    setAddressForm({
      name: address.name,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      isDefault: address.isDefault || false,
    });
    setShowAddressForm(true);
  };

  // Show loading while auth is hydrating OR while fetching user data
  if (status === 'loading' || (status === 'authenticated' && loading)) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Don't render content if not authorized (will redirect)
  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">My Account</h1>

        <div className="grid md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg border border-border p-4 space-y-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full text-left px-4 py-3 rounded-md transition-colors ${
                  activeTab === 'profile' ? 'bg-accent text-white' : 'hover:bg-gray-100'
                }`}
              >
                Profile Information
              </button>
              <button
                onClick={() => setActiveTab('addresses')}
                className={`w-full text-left px-4 py-3 rounded-md transition-colors ${
                  activeTab === 'addresses' ? 'bg-accent text-white' : 'hover:bg-gray-100'
                }`}
              >
                Manage Addresses
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`w-full text-left px-4 py-3 rounded-md transition-colors ${
                  activeTab === 'password' ? 'bg-accent text-white' : 'hover:bg-gray-100'
                }`}
              >
                Change Password
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full text-left px-4 py-3 rounded-md transition-colors ${
                  activeTab === 'orders' ? 'bg-accent text-white' : 'hover:bg-gray-100'
                }`}
              >
                My Orders
              </button>
              <SignOutButton>
                <button className="w-full text-left px-4 py-3 rounded-md hover:bg-red-50 text-red-600 transition-colors">
                  Logout
                </button>
              </SignOutButton>
            </div>
          </div>

          {/* Content */}
          <div className="md:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-lg border border-border p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Profile Information</h2>
                  {!editing && (
                    <button
                      onClick={() => setEditing(true)}
                      className="text-accent hover:text-secondary font-semibold"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>

                {editing ? (
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Full Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        className="px-6 py-2 bg-accent text-white rounded-md hover:bg-secondary transition-colors"
                      >
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(false);
                          setFormData({
                            name: user.name,
                            email: user.email,
                            phone: user.phone || '',
                          });
                        }}
                        className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-neutral-dark">Full Name</p>
                      <p className="text-lg font-semibold">{user.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-dark">Email</p>
                      <p className="text-lg font-semibold">{user.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-dark">Phone</p>
                      <p className="text-lg font-semibold">{user.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-dark">Account Type</p>
                      <p className="text-lg font-semibold capitalize">{user.role}</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-dark">Member Since</p>
                      <p className="text-lg font-semibold">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div className="bg-white rounded-lg border border-border p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Saved Addresses</h2>
                  <button
                    onClick={() => {
                      setShowAddressForm(!showAddressForm);
                      setEditingAddress(null);
                      setAddressForm({
                        name: '',
                        phone: '',
                        addressLine1: '',
                        addressLine2: '',
                        city: '',
                        state: '',
                        pincode: '',
                        isDefault: false,
                      });
                    }}
                    className="text-accent hover:text-secondary font-semibold"
                  >
                    {showAddressForm ? 'Cancel' : '+ Add New Address'}
                  </button>
                </div>

                {showAddressForm && (
                  <form onSubmit={handleAddAddress} className="mb-6 p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-semibold mb-4">
                      {editingAddress ? 'Edit Address' : 'New Address'}
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={addressForm.name}
                        onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                        className="col-span-2 px-4 py-2 border border-gray-300 rounded-md"
                        required
                      />
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        value={addressForm.phone}
                        onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                        className="col-span-2 px-4 py-2 border border-gray-300 rounded-md"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Address Line 1"
                        value={addressForm.addressLine1}
                        onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                        className="col-span-2 px-4 py-2 border border-gray-300 rounded-md"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Address Line 2 (Optional)"
                        value={addressForm.addressLine2}
                        onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                        className="col-span-2 px-4 py-2 border border-gray-300 rounded-md"
                      />
                      <input
                        type="text"
                        placeholder="City"
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        className="px-4 py-2 border border-gray-300 rounded-md"
                        required
                      />
                      <input
                        type="text"
                        placeholder="State"
                        value={addressForm.state}
                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                        className="px-4 py-2 border border-gray-300 rounded-md"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Pincode"
                        value={addressForm.pincode}
                        onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                        className="px-4 py-2 border border-gray-300 rounded-md"
                        required
                      />
                      <label className="flex items-center col-span-2">
                        <input
                          type="checkbox"
                          checked={addressForm.isDefault}
                          onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                          className="mr-2"
                        />
                        <span className="text-sm">Set as default address</span>
                      </label>
                      <button
                        type="submit"
                        className="col-span-2 bg-accent text-white py-2 rounded-md hover:bg-secondary"
                      >
                        {editingAddress ? 'Update Address' : 'Save Address'}
                      </button>
                    </div>
                  </form>
                )}

                <div className="space-y-4">
                  {user.addresses && user.addresses.length > 0 ? (
                    user.addresses.map((addr: any) => (
                      <div
                        key={addr._id}
                        className="p-4 border border-gray-200 rounded-lg hover:border-accent transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <p className="font-semibold">{addr.name}</p>
                              {addr.isDefault && (
                                <span className="px-2 py-1 bg-accent text-white text-xs rounded-md">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-neutral-dark">{addr.phone}</p>
                            <p className="text-sm text-neutral-dark mt-2">
                              {addr.addressLine1}, {addr.addressLine2 && `${addr.addressLine2}, `}
                              {addr.city}, {addr.state} - {addr.pincode}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditAddress(addr)}
                              className="text-accent hover:text-secondary text-sm font-semibold"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(addr._id)}
                              className="text-red-600 hover:text-red-700 text-sm font-semibold"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-neutral-dark py-8">No addresses saved yet</p>
                  )}
                </div>
              </div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <div className="bg-white rounded-lg border border-border p-6">
                <h2 className="text-2xl font-bold mb-6">Change Password</h2>
                <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium mb-2">Current Password</label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, currentPassword: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">New Password</label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, newPassword: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                      required
                      minLength={6}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                      required
                      minLength={6}
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-accent text-white rounded-md hover:bg-secondary transition-colors"
                  >
                    Update Password
                  </button>
                </form>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-lg border border-border p-6">
                <h2 className="text-2xl font-bold mb-6">My Orders</h2>
                
                {ordersLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-32 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order: any) => (
                      <div
                        key={order._id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-accent transition-colors"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="font-semibold text-lg">Order #{order.orderNumber}</p>
                            <p className="text-sm text-neutral-dark">
                              Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.orderStatus)}`}>
                            {order.orderStatus.toUpperCase()}
                          </span>
                        </div>

                        <div className="space-y-2 mb-4">
                          {order.items.slice(0, 2).map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-3">
                              {item.image && (
                                <img 
                                  src={item.image} 
                                  alt={item.name}
                                  className="w-12 h-12 object-cover rounded"
                                />
                              )}
                              <div className="flex-1">
                                <p className="text-sm font-medium">{item.name}</p>
                                <p className="text-xs text-neutral-dark">Qty: {item.quantity}</p>
                              </div>
                              <p className="text-sm font-semibold">₹{item.discountPrice || item.price}</p>
                            </div>
                          ))}
                          {order.items.length > 2 && (
                            <p className="text-xs text-neutral-dark">
                              +{order.items.length - 2} more item(s)
                            </p>
                          )}
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                          <div>
                            <p className="text-sm text-neutral-dark">Total Amount</p>
                            <p className="text-lg font-bold">₹{order.totalPrice.toFixed(2)}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleTrackOrder(order._id)}
                              className="px-4 py-2 text-sm border border-accent text-accent rounded-md hover:bg-accent hover:text-white transition-colors"
                            >
                              Track Order
                            </button>
                            {['pending', 'confirmed', 'processing'].includes(order.orderStatus) && (
                              <button
                                onClick={() => handleCancelOrder(order._id)}
                                className="px-4 py-2 text-sm border border-red-600 text-red-600 rounded-md hover:bg-red-600 hover:text-white transition-colors"
                              >
                                Cancel
                              </button>
                            )}
                            <button
                              onClick={() => router.push(`/orders/${order._id}`)}
                              className="px-4 py-2 text-sm bg-accent text-white rounded-md hover:bg-secondary transition-colors"
                            >
                              View Details
                            </button>
                          </div>
                        </div>

                        {/* Tracking Info */}
                        {selectedOrder === order._id && trackingInfo && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <h3 className="font-semibold mb-3">Order Tracking</h3>
                            <div className="space-y-3">
                              {trackingInfo.trackingInfo?.trackingNumber && (
                                <div>
                                  <p className="text-sm text-neutral-dark">Tracking Number</p>
                                  <p className="font-semibold">{trackingInfo.trackingInfo.trackingNumber}</p>
                                  {trackingInfo.trackingInfo.carrier && (
                                    <p className="text-sm text-neutral-dark">Carrier: {trackingInfo.trackingInfo.carrier}</p>
                                  )}
                                </div>
                              )}
                              
                              {trackingInfo.statusHistory && trackingInfo.statusHistory.length > 0 && (
                                <div>
                                  <p className="text-sm text-neutral-dark mb-2">Status History</p>
                                  <div className="space-y-2">
                                    {trackingInfo.statusHistory.map((history: any, idx: number) => (
                                      <div key={idx} className="flex items-start gap-2">
                                        <div className="w-2 h-2 bg-accent rounded-full mt-1.5"></div>
                                        <div className="flex-1">
                                          <p className="text-sm font-medium capitalize">{history.status}</p>
                                          <p className="text-xs text-neutral-dark">
                                            {new Date(history.timestamp).toLocaleString('en-IN')}
                                          </p>
                                          {history.note && (
                                            <p className="text-xs text-neutral-dark mt-1">{history.note}</p>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => {
                                setSelectedOrder(null);
                                setTrackingInfo(null);
                              }}
                              className="mt-3 text-sm text-accent hover:text-secondary"
                            >
                              Close Tracking
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <p className="text-neutral-dark mb-4">No orders yet</p>
                    <button
                      onClick={() => router.push('/shop')}
                      className="px-6 py-2 bg-accent text-white rounded-md hover:bg-secondary transition-colors"
                    >
                      Start Shopping
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
