'use client';

import { useState, useEffect } from 'react';
import { getProducts } from '@/services/productService';
import { createQuotation } from '@/services/quotationService';

interface QuotationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedProduct?: {
    id: string;
    name: string;
  } | null;
}

export default function QuotationDialog({ isOpen, onClose, preSelectedProduct }: QuotationDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    message: ''
  });
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Array<{ productId: string; productName: string; quantity: number }>>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
      if (preSelectedProduct) {
        setSelectedProducts([{
          productId: preSelectedProduct.id,
          productName: preSelectedProduct.name,
          quantity: 1
        }]);
      }
    }
  }, [isOpen, preSelectedProduct]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await getProducts({ limit: 100 });
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = (product: any) => {
    const exists = selectedProducts.find(p => p.productId === product._id);
    if (!exists) {
      setSelectedProducts([...selectedProducts, {
        productId: product._id,
        productName: product.name,
        quantity: 1
      }]);
    }
  };

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter(p => p.productId !== productId));
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    setSelectedProducts(selectedProducts.map(p => 
      p.productId === productId ? { ...p, quantity: Math.max(1, quantity) } : p
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedProducts.length === 0) {
      alert('Please select at least one product');
      return;
    }

    try {
      setSubmitting(true);
      await createQuotation({
        ...formData,
        products: selectedProducts
      });
      
      alert('✅ Quotation request submitted successfully! We will contact you soon.');
      onClose();
      
      // Reset form
      setFormData({ name: '', email: '', mobile: '', message: '' });
      setSelectedProducts([]);
    } catch (error: any) {
      console.error('Error submitting quotation:', error);
      alert('❌ ' + (error.response?.data?.message || 'Failed to submit quotation request'));
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-orange-300 shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Request Quotation</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Contact Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Message (Optional)</label>
                <input
                  type="text"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Any specific requirements"
                />
              </div>
            </div>
          </div>

          {/* Selected Products */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Selected Products ({selectedProducts.length})</h3>
            {selectedProducts.length === 0 ? (
              <p className="text-gray-500 text-sm">No products selected yet</p>
            ) : (
              <div className="space-y-2">
                {selectedProducts.map((product) => (
                  <div key={product.productId} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <span className="font-medium flex-1">{product.productName}</span>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <label className="text-sm">Qty:</label>
                        <input
                          type="number"
                          min="1"
                          value={product.quantity}
                          onChange={(e) => handleQuantityChange(product.productId, parseInt(e.target.value))}
                          className="w-20 px-2 py-1 border border-gray-300 rounded-md"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveProduct(product.productId)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Add More Products</h3>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent mb-3"
            />
            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
              {loading ? (
                <p className="p-4 text-center text-gray-500">Loading products...</p>
              ) : filteredProducts.length === 0 ? (
                <p className="p-4 text-center text-gray-500">No quotation products found</p>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredProducts
                    .filter(product => product.availableOnQuotation)
                    .map((product) => {
                      const isSelected = selectedProducts.some(p => p.productId === product._id);
                      return (
                        <div
                          key={product._id}
                          className={`p-3 flex items-center justify-between hover:bg-gray-50 ${isSelected ? 'bg-green-50' : ''}`}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            {product.images && product.images[0] && (
                              <img
                                src={product.images[0].url}
                                alt={product.name}
                                className="w-12 h-12 object-contain rounded cursor-pointer"
                                onClick={() => window.open(`/product/${product._id}`, '_blank')}
                              />
                            )}
                            <div>
                              <p className="font-medium text-sm cursor-pointer hover:text-accent" onClick={() => window.open(`/product/${product._id}`, '_blank')}>
                                {product.name}
                              </p>
                              <p className="text-xs text-gray-500">Available on Quotation</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddProduct(product)}
                            disabled={isSelected}
                            className={`px-3 py-1 text-sm rounded-md transition-colors ${
                              isSelected
                                ? 'bg-green-100 text-green-700 cursor-not-allowed'
                                : 'btn-primary'
                            }`}
                          >
                            {isSelected ? 'Added' : 'Add'}
                          </button>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting || selectedProducts.length === 0}
              className="flex-1 btn-primary py-3 rounded-md font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Quotation Request'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
