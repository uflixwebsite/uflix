'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { deleteContact, getContacts, updateContact } from '@/services/contactService';
import { getCurrentUser } from '@/services/authService';

export default function AdminContactsPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<any[]>([]);
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
      fetchContacts();
    } catch (error) {
      console.error('Error checking admin access:', error);
      router.push('/sign-in');
    }
  };

  const fetchContacts = async () => {
    try {
      const params: any = { limit: 100 };
      if (filterStatus) params.status = filterStatus;

      const data = await getContacts(params);
      setContacts(data.data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authorized) {
      fetchContacts();
    }
  }, [filterStatus, authorized]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateContact(id, { status: newStatus });
      fetchContacts();
    } catch (error: any) {
      alert('❌ ' + (error.response?.data?.message || 'Failed to update status'));
    }
  };

  const handleDelete = async (id: string, customerName: string) => {
    if (!confirm(`Are you sure you want to delete the contact submission from ${customerName}?`)) return;

    try {
      await deleteContact(id);
      alert('✅ Contact submission deleted successfully!');
      fetchContacts();
    } catch (error: any) {
      alert('❌ ' + (error.response?.data?.message || 'Failed to delete contact submission'));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'contacted': return 'bg-blue-100 text-blue-800';
      case 'replied': return 'bg-purple-100 text-purple-800';
      case 'closed': return 'bg-green-100 text-green-800';
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
            <h1 className="text-3xl font-bold">Contact Submissions</h1>
            <p className="text-neutral-dark mt-2">Review and manage contact form messages</p>
          </div>
        </div>

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
              <option value="replied">Replied</option>
              <option value="closed">Closed</option>
            </select>
            <span className="text-sm text-gray-600 ml-auto">
              Total: {contacts.length} submissions
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-border overflow-hidden">
          {contacts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-neutral-dark">No contact submissions found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {contacts.map((contact) => (
                <div key={contact._id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{contact.name}</h3>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(contact.status)}`}>
                          {contact.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Email:</span>
                          <a href={`mailto:${contact.email}`} className="ml-2 text-accent hover:underline">
                            {contact.email}
                          </a>
                        </div>
                        <div>
                          <span className="text-gray-600">Phone:</span>
                          <a href={`tel:${contact.phone}`} className="ml-2 text-accent hover:underline">
                            {contact.phone}
                          </a>
                        </div>
                        <div>
                          <span className="text-gray-600">Date:</span>
                          <span className="ml-2">{new Date(contact.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setExpandedId(expandedId === contact._id ? null : contact._id)}
                      className="ml-4 inline-flex items-center gap-2 rounded-md border border-accent px-3 py-2 text-sm font-medium text-accent hover:bg-accent hover:text-white transition-colors"
                    >
                      <span>{expandedId === contact._id ? 'Hide' : 'View'} details</span>
                      <svg className={`w-4 h-4 transition-transform ${expandedId === contact._id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  {expandedId === contact._id && (
                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <h4 className="font-semibold mb-1">Subject</h4>
                          <p className="text-gray-700 bg-gray-50 p-3 rounded-md">{contact.subject}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">Selected Product</h4>
                          <p className="text-gray-700 bg-gray-50 p-3 rounded-md">{contact.selectedProduct || 'N/A'}</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Message</h4>
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md whitespace-pre-line">{contact.message}</p>
                      </div>

                      {contact.notes && (
                        <div>
                          <h4 className="font-semibold mb-2">Internal Notes</h4>
                          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md whitespace-pre-line">{contact.notes}</p>
                        </div>
                      )}

                      <div className="flex gap-3 flex-wrap">
                        <select
                          value={contact.status}
                          onChange={(e) => handleStatusChange(contact._id, e.target.value)}
                          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                        >
                          <option value="pending">Pending</option>
                          <option value="contacted">Contacted</option>
                          <option value="replied">Replied</option>
                          <option value="closed">Closed</option>
                        </select>
                        <button
                          onClick={() => handleDelete(contact._id, contact.name)}
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