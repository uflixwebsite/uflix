'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getCurrentUser } from '@/services/authService';
import api from '@/services/api';
import { getCategoryTree } from '@/services/categoryService';
import { useAuthState } from '@/hooks/useAuthState';
import CategoryTreePicker, { flattenTree } from '@/components/CategoryTreePicker';

export default function AddProductPage() {
  const router = useRouter();
  const { status, isAdmin } = useAuthState();
  const [dataLoading, setDataLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categoryTree, setCategoryTree] = useState<any[]>([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    sku: '',
    material: '',
    dimensions: {
      length: '',
      width: '',
      height: '',
      unit: 'cm'
    },
    weight: '',
    colors: '',
    features: [''],
    warranty: '',
    availableOnQuotation: false,
    isActive: true,
    isFeatured: false,
    newArrival: false,
    bestSeller: false
  });

  const fetchCategoryTree = async () => {
    setCategoryLoading(true);
    try {
      const res = await getCategoryTree();
      setCategoryTree(res.data || []);
    } catch (error) {
      console.error('Error fetching category tree:', error);
    }
    setCategoryLoading(false);
  };

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') { router.push('/sign-in'); return; }
    if (status === 'authenticated' && !isAdmin) { router.push('/'); return; }
  }, [status, isAdmin, router]);

  useEffect(() => {
    if (status === 'authenticated' && isAdmin) fetchCategoryTree();
  }, [status, isAdmin]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    const currentFiles = selectedFiles;
    const totalFiles = currentFiles.length + newFiles.length;
    
    if (totalFiles > 6) {
      alert(`Maximum 6 images allowed. You currently have ${currentFiles.length} images and tried to add ${newFiles.length} more.`);
      return;
    }
    
    const allFiles = [...currentFiles, ...newFiles];
    setSelectedFiles(allFiles);
    
    // Create preview URLs for new files only
    const newUrls = newFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls([...previewUrls, ...newUrls]);
  };

  const removeImage = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newUrls = previewUrls.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setPreviewUrls(newUrls);
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check if file is a video
      if (!file.type.startsWith('video/')) {
        alert('Please select a video file');
        return;
      }
      
      // Check file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        alert('Video size should be less than 50MB');
        return;
      }
      
      setSelectedVideo(file);
      setVideoPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeVideo = () => {
    setSelectedVideo(null);
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
      setVideoPreviewUrl('');
    }
  };


  const addFeature = () => {
    if (formData.features.length < 5) {
      setFormData({
        ...formData,
        features: [...formData.features, '']
      });
    } else {
      alert('Maximum 5 features allowed');
    }
  };

  const removeFeature = (index: number) => {
    const newFeatures = formData.features.filter((_: any, i: number) => i !== index);
    setFormData({
      ...formData,
      features: newFeatures.length > 0 ? newFeatures : ['']
    });
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({
      ...formData,
      features: newFeatures
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Product name is required');
      return;
    }
    
    if (selectedFiles.length === 0) {
      alert('At least one product image is required');
      return;
    }

    setDataLoading(true);

    try {
      // Step 1: Upload images to Cloudinary
      setUploading(true);
      const flat = flattenTree(categoryTree);
      const selectedNodes = selectedCategoryIds.map(id => flat.find((n: any) => n._id === id)).filter(Boolean);
      const categoryFolder = (selectedNodes[0] as any)?.slug || 'uncategorized';
      const uploadFormData = new FormData();
      selectedFiles.forEach((file) => {
        uploadFormData.append('images', file);
      });

      const uploadResponse = await api.post(`/upload/images?folder=products/${categoryFolder}`, uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploading(false);
      
      const images = uploadResponse.data.data.map((img: any) => ({
        url: img.url,
        alt: formData.name
      }));

      // Step 2: Upload video if selected
      let videoUrl = null;
      if (selectedVideo) {
        const videoFormData = new FormData();
        videoFormData.append('video', selectedVideo);
        
        const videoUploadResponse = await api.post(`/upload/video?folder=products/${categoryFolder}`, videoFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        videoUrl = videoUploadResponse.data.data.url;
      }

      // Step 3: Create product with uploaded image and video URLs
      const primaryNode = selectedNodes[selectedNodes.length - 1] as any;
      const subcategoryForSubmit = primaryNode
        ? { _id: primaryNode._id, name: primaryNode.name }
        : null;

      const productData = {
        name: formData.name,
        description: formData.description,
        price: formData.price ? parseFloat(formData.price) : 0,
        discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : undefined,
        sku: formData.sku || null,
        categories: selectedNodes.map((n: any) => n.slug).filter(Boolean),
        categoryRef: selectedCategoryIds[selectedCategoryIds.length - 1] || null,
        categoryRefs: selectedCategoryIds,
        subcategory: subcategoryForSubmit,
        material: formData.material || undefined,
        weight: formData.weight ? { value: parseFloat(formData.weight), unit: 'kg' } : undefined,
        dimensions: {
          length: formData.dimensions.length ? parseFloat(formData.dimensions.length) : undefined,
          width: formData.dimensions.width ? parseFloat(formData.dimensions.width) : undefined,
          height: formData.dimensions.height ? parseFloat(formData.dimensions.height) : undefined,
          unit: formData.dimensions.unit
        },
        colors: formData.colors ? formData.colors.split(',').map(c => c.trim()).filter(c => c) : [],
        specifications: formData.features ? formData.features.filter((f: string) => f.trim() !== '').map(f => ({ key: f, value: f })) : [],
        images: images,
        video: videoUrl,
        availableOnQuotation: formData.availableOnQuotation,
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        newArrival: formData.newArrival,
        bestSeller: formData.bestSeller
      };

      await api.post('/products', productData);
      alert('Product created successfully!');
      router.push('/admin/products');
    } catch (error: any) {
      console.error('Error creating product:', error);
      alert(error.response?.data?.message || 'Failed to create product');
    } finally {
      setDataLoading(false);
      setUploading(false);
    }
  };

  // Show loading while auth is hydrating OR while creating product
  if (status === 'loading' || (status === 'authenticated' && isAdmin && dataLoading)) {
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

  // Don't render content if not authorized (will redirect)
  if (status === 'unauthenticated' || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-neutral-dark hover:text-accent transition-colors mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-3xl font-bold">Add New Product</h1>
          <p className="text-neutral-dark mt-2">Fill in the product details below</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-border p-6">
          {/* Image Upload */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Product Images *</h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer flex flex-col items-center justify-center"
              >
                <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-sm text-gray-600 mb-1">Click to upload product images</p>
                <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 10MB (Max 6 images)</p>
              </label>
            </div>
            
            {previewUrls.length > 0 && (
              <div className="grid grid-cols-4 gap-4 mt-4">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Video Upload */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Product Video (Optional)</h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoSelect}
                className="hidden"
                id="video-upload"
              />
              <label
                htmlFor="video-upload"
                className="cursor-pointer flex flex-col items-center justify-center"
              >
                <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-gray-600 mb-1">Click to upload product video</p>
                <p className="text-xs text-gray-500">MP4, WebM, MOV up to 50MB (Max 1 video)</p>
              </label>
            </div>
            
            {videoPreviewUrl && (
              <div className="mt-4">
                <div className="relative group">
                  <video
                    src={videoPreviewUrl}
                    controls
                    className="w-full h-64 object-cover rounded-md bg-black"
                  />
                  <button
                    type="button"
                    onClick={removeVideo}
                    className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Basic Information */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Basic Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Product Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">SKU (Optional)</label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="e.g., FURN-001"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              {/* Category tree picker — multi-select, any depth */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Category
                  <span className="text-xs text-gray-400 ml-2 font-normal">
                    (select one or more at any depth —{' '}
                    <a href="/admin/subcategories" className="text-accent underline">manage subcategories →</a>)
                  </span>
                </label>
                <CategoryTreePicker
                  tree={categoryTree}
                  selectedIds={selectedCategoryIds}
                  onChange={setSelectedCategoryIds}
                  loading={categoryLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Material</label>
                <input
                  type="text"
                  value={formData.material}
                  onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Pricing</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Discount Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.discountPrice}
                  onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>
          </div>

          {/* Dimensions */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Dimensions</h2>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Length</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.dimensions.length}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    dimensions: { ...formData.dimensions, length: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Width</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.dimensions.width}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    dimensions: { ...formData.dimensions, width: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Height</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.dimensions.height}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    dimensions: { ...formData.dimensions, height: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Unit</label>
                <select
                  value={formData.dimensions.unit}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    dimensions: { ...formData.dimensions, unit: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="cm">cm</option>
                  <option value="inch">inch</option>
                  <option value="m">m</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Weight (kg)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Additional Details</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Colors (comma separated)</label>
                <input
                  type="text"
                  value={formData.colors}
                  onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                  placeholder="e.g., Black, White, Brown"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Warranty</label>
                <input
                  type="text"
                  value={formData.warranty}
                  onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                  placeholder="e.g., 1 year"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Product Features</label>
                <div className="space-y-3">
                  {formData.features.map((feature: any, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Feature (e.g., Material: Solid Wood)"
                        value={feature || ''}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                      {formData.features.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="px-3 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50 transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  {formData.features.length < 5 && (
                    <button
                      type="button"
                      onClick={addFeature}
                      className="px-4 py-2 text-accent border border-accent rounded-md hover:bg-accent hover:text-white transition-colors"
                    >
                      Add Another Feature
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">Use format: Feature Name: Value (e.g., Material: Solid Wood)</p>
              </div>

              <div className="md:col-span-2 space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Active (visible to customers)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">⭐ Featured on Homepage</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.newArrival}
                    onChange={(e) => setFormData({ ...formData, newArrival: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">🆕 New Arrival</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.bestSeller}
                    onChange={(e) => setFormData({ ...formData, bestSeller: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">🔥 Best Seller</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.availableOnQuotation}
                    onChange={(e) => setFormData({ ...formData, availableOnQuotation: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">💬 Available on Quotation (No price display)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={dataLoading || uploading}
              className="px-6 py-3 bg-accent text-white rounded-md hover:bg-secondary transition-colors font-semibold disabled:opacity-50"
            >
              {uploading ? 'Uploading Images...' : dataLoading ? 'Creating Product...' : 'Create Product'}
            </button>
            <Link
              href="/admin/products"
              className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors font-semibold"
            >
              Cancel
            </Link>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
