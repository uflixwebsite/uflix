'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getQuotations, updateQuotation, deleteQuotation } from '@/services/quotationService';
import { getCurrentUser } from '@/services/authService';

export default function AdminQuotationsPage() {
  const router = useRouter();
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const userData = await getCurrentUser();
      if (userData.data?.role !== 'admin') {
        router.push('/');
        return;
      }
      setAuthorized(true);
      fetchQuotations();
    } catch (error) {
      console.error('Error checking admin access:', error);
      router.push('/sign-in');
    }
  };

  const fetchQuotations = async () => {
    try {
      const params: any = { limit: 100 };
      if (filterStatus) params.status = filterStatus;
      
      const data = await getQuotations(params);
      setQuotations(data.data);
    } catch (error) {
      console.error('Error fetching quotations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authorized) {
      fetchQuotations();
    }
  }, [filterStatus, authorized]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateQuotation(id, { status: newStatus });
      fetchQuotations();
    } catch (error: any) {
      alert('❌ ' + (error.response?.data?.message || 'Failed to update status'));
    }
  };

  const handleDelete = async (id: string, customerName: string) => {
    if (!confirm(`Are you sure you want to delete quotation request from ${customerName}?`)) return;

    try {
      await deleteQuotation(id);
      alert('✅ Quotation deleted successfully!');
      fetchQuotations();
    } catch (error: any) {
      alert('❌ ' + (error.response?.data?.message || 'Failed to delete quotation'));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'contacted': return 'bg-blue-100 text-blue-800';
      case 'quoted': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading || !authorized) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Quotation Requests</h1>
            <p className="text-neutral-dark mt-2">Manage customer quotation requests</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-border p-4 mb-6">
          <div className="flex gap-4 items-center">
            <label className="text-sm font-medium">Filter by Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="contacted">Contacted</option>
              <option value="quoted">Quoted</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <span className="text-sm text-gray-600 ml-auto">
              Total: {quotations.length} requests
            </span>
          </div>
        </div>

        {/* Quotations List */}
        <div className="bg-white rounded-lg border border-border overflow-hidden">
          {quotations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-neutral-dark">No quotation requests found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {quotations.map((quotation) => (
                <div key={quotation._id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{quotation.name}</h3>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(quotation.status)}`}>
                          {quotation.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Email:</span>
                          <a href={`mailto:${quotation.email}`} className="ml-2 text-accent hover:underline">
                            {quotation.email}
                          </a>
                        </div>
                        <div>
                          <span className="text-gray-600">Mobile:</span>
                          <a href={`tel:${quotation.mobile}`} className="ml-2 text-accent hover:underline">
                            {quotation.mobile}
                          </a>
                        </div>
                        <div>
                          <span className="text-gray-600">Date:</span>
                          <span className="ml-2">{new Date(quotation.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setExpandedId(expandedId === quotation._id ? null : quotation._id)}
                      className="text-accent hover:text-secondary"
                    >
                      <svg className={`w-6 h-6 transition-transform ${expandedId === quotation._id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  {expandedId === quotation._id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      {/* Products */}
                      <div className="mb-4">
                        <h4 className="font-semibold mb-2">Requested Products:</h4>
                        <div className="space-y-2">
                          {quotation.products.map((product: any, index: number) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                              {product.productId?.images?.[0] && (
                                <img
                                  src={product.productId.images[0].url}
                                  alt={product.productName}
                                  className="w-12 h-12 object-cover rounded"
                                />
                              )}
                              <div className="flex-1">
                                <p className="font-medium">{product.productName}</p>
                                <p className="text-sm text-gray-600">Quantity: {product.quantity}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Message */}
                      {quotation.message && (
                        <div className="mb-4">
                          <h4 className="font-semibold mb-2">Customer Message:</h4>
                          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">{quotation.message}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-3">
                        <select
                          value={quotation.status}
                          onChange={(e) => handleStatusChange(quotation._id, e.target.value)}
                          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                        >
                          <option value="pending">Pending</option>
                          <option value="contacted">Contacted</option>
                          <option value="quoted">Quoted</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <button
                          onClick={() => handleDelete(quotation._id, quotation.name)}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6">
          <a href="/admin" className="text-accent hover:text-secondary">
            ← Back to Dashboard
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}
