'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getDashboard } from '@/services/adminService';
import { useAuthState } from '@/hooks/useAuthState';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { status, isAdmin } = useAuthState();
  const [dashboard, setDashboard] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(false);

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

    if (status === 'authenticated' && !isAdmin) {
      router.push('/');
      return;
    }

    // User is authenticated and is admin - fetch dashboard
    if (status === 'authenticated' && isAdmin) {
      fetchDashboard();
    }
  }, [status, isAdmin, router]);

  const fetchDashboard = async () => {
    setDataLoading(true);
    try {
      const data = await getDashboard();
      setDashboard(data.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setDataLoading(false);
    }
  };

  // Show loading while auth is hydrating OR while fetching dashboard data
  if (status === 'loading' || (status === 'authenticated' && isAdmin && dataLoading && !dashboard)) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Don't render content if not authorized (will redirect)
  if (status === 'unauthenticated' || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex gap-3">
            <Link
              href="/admin/products"
              className="px-4 py-2 bg-accent text-white rounded-md hover:bg-secondary transition-colors"
            >
              Manage Products
            </Link>
            <Link
              href="/admin/orders"
              className="px-4 py-2 border border-accent text-accent rounded-md hover:bg-accent hover:text-white transition-colors"
            >
              Manage Orders
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-dark mb-1">Total Orders</p>
                <p className="text-3xl font-bold">{dashboard?.overview?.totalOrders || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-dark mb-1">Total Revenue</p>
                <p className="text-3xl font-bold">₹{(dashboard?.overview?.totalRevenue || 0).toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-dark mb-1">Total Products</p>
                <p className="text-3xl font-bold">{dashboard?.overview?.totalProducts || 0}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-dark mb-1">Total Users</p>
                <p className="text-3xl font-bold">{dashboard?.overview?.totalUsers || 0}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Order Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-border p-6">
            <p className="text-sm text-neutral-dark mb-2">Pending Orders</p>
            <p className="text-2xl font-bold text-yellow-600">{dashboard?.overview?.pendingOrders || 0}</p>
          </div>
          <div className="bg-white rounded-lg border border-border p-6">
            <p className="text-sm text-neutral-dark mb-2">Processing Orders</p>
            <p className="text-2xl font-bold text-blue-600">{dashboard?.overview?.processingOrders || 0}</p>
          </div>
          <div className="bg-white rounded-lg border border-border p-6">
            <p className="text-sm text-neutral-dark mb-2">Shipped Orders</p>
            <p className="text-2xl font-bold text-indigo-600">{dashboard?.overview?.shippedOrders || 0}</p>
          </div>
          <div className="bg-white rounded-lg border border-border p-6">
            <p className="text-sm text-neutral-dark mb-2">Delivered Orders</p>
            <p className="text-2xl font-bold text-green-600">{dashboard?.overview?.deliveredOrders || 0}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg border border-border p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Recent Orders</h2>
              <Link href="/admin/orders" className="text-accent hover:text-secondary text-sm font-semibold">
                View All →
              </Link>
            </div>
            <div className="space-y-4">
              {dashboard?.recentOrders?.slice(0, 5).map((order: any) => (
                <div key={order._id} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-semibold">{order.orderNumber}</p>
                    <p className="text-sm text-neutral-dark">{order.user?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-accent">₹{order.totalPrice.toLocaleString()}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      order.orderStatus === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.orderStatus === 'shipped' ? 'bg-blue-100 text-blue-800' :
                      order.orderStatus === 'processing' ? 'bg-purple-100 text-purple-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.orderStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-lg border border-border p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Top Selling Products</h2>
              <Link href="/admin/products" className="text-accent hover:text-secondary text-sm font-semibold">
                View All →
              </Link>
            </div>
            <div className="space-y-4">
              {dashboard?.topProducts?.slice(0, 5).map((product: any) => (
                <div key={product._id} className="flex gap-4 p-4 border border-gray-200 rounded-lg">
                  <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                    {product.images && product.images[0] && (
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${product.images[0].url}`}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold line-clamp-1">{product.name}</p>
                    <p className="text-sm text-neutral-dark">Sold: {product.sold} units</p>
                    <p className="text-sm font-semibold text-accent">₹{product.price.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-border p-6">
          <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/admin/products"
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-accent hover:bg-accent/5 transition-colors text-center"
            >
              <svg className="w-8 h-8 mx-auto mb-2 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p className="font-semibold">Manage Products</p>
            </Link>
            <Link
              href="/admin/products/new"
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-accent hover:bg-accent/5 transition-colors text-center"
            >
              <svg className="w-8 h-8 mx-auto mb-2 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <p className="font-semibold">Add Product</p>
            </Link>
            <Link
              href="/admin/quotations"
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-accent hover:bg-accent/5 transition-colors text-center"
            >
              <svg className="w-8 h-8 mx-auto mb-2 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="font-semibold">Quotation Requests</p>
            </Link>
            <Link
              href="/admin/users"
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-accent hover:bg-accent/5 transition-colors text-center"
            >
              <svg className="w-8 h-8 mx-auto mb-2 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <p className="font-semibold">Manage Users</p>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
