'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuthState } from '@/hooks/useAuthState';
import { getPincodeSettings, updatePincodeSettings, addPincode, deletePincode } from '@/services/pincodeSettingsService';

interface PincodeEntry {
  pincode: string;
  state: string;
  city: string;
  transitDays: string;
  assemblyDays: string;
  enabled: boolean;
}

export default function PincodeSettingsPage() {
  const router = useRouter();
  const { status, isAdmin } = useAuthState();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<{ pincodes: PincodeEntry[] }>({ pincodes: [] });
  const [newPincode, setNewPincode] = useState<PincodeEntry>({
    pincode: '',
    state: '',
    city: '',
    transitDays: '',
    assemblyDays: '',
    enabled: true
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push('/sign-in');
      return;
    }
    if (status === 'authenticated' && !isAdmin) {
      router.push('/');
      return;
    }
    if (status === 'authenticated' && isAdmin) {
      fetchSettings();
    }
  }, [status, isAdmin, router]);

  const fetchSettings = async () => {
    try {
      const res = await getPincodeSettings();
      if (res?.success && res?.data) {
        setSettings(res.data);
      }
    } catch (e) {
      console.error('Error fetching pincode settings:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updatePincodeSettings(settings);
      alert('Pincode settings saved successfully!');
    } catch (e) {
      alert('Failed to save pincode settings');
    } finally {
      setSaving(false);
    }
  };

  const handleAddPincode = async () => {
    if (!newPincode.pincode.trim() || !newPincode.state.trim() || !newPincode.city.trim() || 
        !newPincode.transitDays.trim() || !newPincode.assemblyDays.trim()) {
      alert('Please fill all fields');
      return;
    }

    try {
      await addPincode(newPincode);
      setNewPincode({
        pincode: '',
        state: '',
        city: '',
        transitDays: '',
        assemblyDays: '',
        enabled: true
      });
      await fetchSettings();
      alert('Pincode added successfully!');
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to add pincode');
    }
  };

  const handleDeletePincode = async (index: number) => {
    if (!confirm('Are you sure you want to delete this pincode?')) return;

    try {
      await deletePincode(index);
      await fetchSettings();
      alert('Pincode deleted successfully!');
    } catch (e) {
      alert('Failed to delete pincode');
    }
  };

  // Filter and paginate pincodes
  const filteredPincodes = settings.pincodes.filter(pincode =>
    pincode.pincode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pincode.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pincode.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPincodes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPincodes = filteredPincodes.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const updatePincodeField = (index: number, field: keyof PincodeEntry, value: any) => {
    setSettings(prev => ({
      pincodes: prev.pincodes.map((pincode, i) => 
        i === index ? { ...pincode, [field]: value } : pincode
      )
    }));
  };

  const updateNewPincodeField = (field: keyof PincodeEntry, value: any) => {
    setNewPincode(prev => ({ ...prev, [field]: value }));
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (status === 'unauthenticated' || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Pincode Settings</h1>
            <p className="text-neutral-dark mt-2">Manage delivery areas and timelines</p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-accent text-white rounded-md hover:bg-secondary transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg border border-border p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
                placeholder="Search by pincode, state, or city..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div className="text-sm text-gray-600">
              Showing {currentPincodes.length} of {filteredPincodes.length} results
            </div>
          </div>
        </div>

        {/* Add New Pincode */}
        <div className="bg-white rounded-lg border border-border p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Add New Pincode</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
              <input
                type="text"
                value={newPincode.pincode}
                onChange={(e) => updateNewPincodeField('pincode', e.target.value)}
                placeholder="e.g., 201301"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input
                type="text"
                value={newPincode.state}
                onChange={(e) => updateNewPincodeField('state', e.target.value)}
                placeholder="e.g., Uttar Pradesh"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={newPincode.city}
                onChange={(e) => updateNewPincodeField('city', e.target.value)}
                placeholder="e.g., Noida"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Transit Days</label>
              <input
                type="text"
                value={newPincode.transitDays}
                onChange={(e) => updateNewPincodeField('transitDays', e.target.value)}
                placeholder="e.g., 1-3 Days"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assembly Days</label>
              <input
                type="text"
                value={newPincode.assemblyDays}
                onChange={(e) => updateNewPincodeField('assemblyDays', e.target.value)}
                placeholder="e.g., 1-2 Days"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleAddPincode}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Add Pincode
              </button>
            </div>
          </div>
        </div>

        {/* Existing Pincodes */}
        <div className="bg-white rounded-lg border border-border p-6">
          <h2 className="text-xl font-semibold mb-4">Existing Pincodes ({filteredPincodes.length})</h2>
          
          {filteredPincodes.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              {searchTerm ? 'No pincodes found matching your search.' : 'No pincodes configured yet. Add your first pincode above!'}
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pincode</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transit</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assembly</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enabled</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentPincodes.map((pincode, index) => (
                      <tr key={startIndex + index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            value={pincode.pincode}
                            onChange={(e) => updatePincodeField(startIndex + index, 'pincode', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-accent"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            value={pincode.state}
                            onChange={(e) => updatePincodeField(startIndex + index, 'state', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-accent"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            value={pincode.city}
                            onChange={(e) => updatePincodeField(startIndex + index, 'city', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-accent"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            value={pincode.transitDays}
                            onChange={(e) => updatePincodeField(startIndex + index, 'transitDays', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-accent"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            value={pincode.assemblyDays}
                            onChange={(e) => updatePincodeField(startIndex + index, 'assemblyDays', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-accent"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={pincode.enabled}
                            onChange={(e) => updatePincodeField(startIndex + index, 'enabled', e.target.checked)}
                            className="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleDeletePincode(startIndex + index)}
                            className="text-red-600 hover:text-red-900 font-medium"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => handlePageChange(i + 1)}
                        className={`px-3 py-1 border rounded-md ${
                          currentPage === i + 1
                            ? 'bg-accent text-white border-accent'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
