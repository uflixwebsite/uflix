'use client';

import { useState, useEffect } from 'react';
import { getSubcategories } from '@/services/subcategoryService';
import { getMaterials } from '@/services/materialsService';

interface FilterSidebarProps {
  onFilterChange?: (filters: any) => void;
  currentCategory?: string;
}

export default function FilterSidebar({ onFilterChange, currentCategory }: FilterSidebarProps) {
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [groupedSubcategories, setGroupedSubcategories] = useState<Record<string, any[]>>({});
  const [materials, setMaterials] = useState<any[]>([]);
  const colors = ['Beige', 'Brown', 'Black', 'White', 'Gray', 'Blue'];

  useEffect(() => {
    fetchSubcategories();
    fetchMaterials();
  }, [currentCategory]);

  const fetchMaterials = async () => {
    try {
      const response = await getMaterials();
      setMaterials(response.data || []);
    } catch (error) {
      console.error('Error fetching materials:', error);
    }
  };

  const fetchSubcategories = async () => {
    try {
      const params = currentCategory ? { category: currentCategory } : {};
      const response = await getSubcategories(params);
      const data = response.data || [];
      setSubcategories(data);

      // Group by category when showing all subcategories (no currentCategory filter)
      if (!currentCategory) {
        const grouped: Record<string, any[]> = {};
        data.forEach((sub: any) => {
          const cat = sub.category || 'other';
          if (!grouped[cat]) grouped[cat] = [];
          grouped[cat].push(sub);
        });
        setGroupedSubcategories(grouped);
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    }
  };

  const handleApplyFilters = () => {
    if (onFilterChange) {
      onFilterChange({
        priceRange,
        subcategories: selectedSubcategories,
        materials: selectedMaterials
      });
    }
  };

  const toggleSubcategory = (name: string) => {
    setSelectedSubcategories(prev =>
      prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]
    );
  };

  const toggleMaterial = (name: string) => {
    setSelectedMaterials(prev =>
      prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]
    );
  };

  const renderSubcategoryCheckbox = (subcategory: any) => (
    <label key={subcategory._id} className="flex items-center">
      <input
        type="checkbox"
        className="mr-2 w-4 h-4 text-accent border-gray-300 rounded focus:ring-accent"
        checked={selectedSubcategories.includes(subcategory.name)}
        onChange={() => toggleSubcategory(subcategory.name)}
      />
      <span className="text-sm capitalize">{subcategory.name}</span>
    </label>
  );

  const renderMaterialCheckbox = (material: any) => (
    <label key={material._id} className="flex items-center">
      <input
        type="checkbox"
        className="mr-2 w-4 h-4 text-accent border-gray-300 rounded focus:ring-accent"
        checked={selectedMaterials.includes(material.name)}
        onChange={() => toggleMaterial(material.name)}
      />
      <span className="text-sm capitalize">{material.name}</span>
    </label>
  );

  return (
    <div className="bg-white p-6 rounded-lg border border-border">
      <h3 className="text-xl font-bold mb-6">Filters</h3>

      <div className="mb-8">
        <h4 className="font-semibold mb-4">Price Range</h4>
        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max="100000"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-neutral-dark">
            <span>₹0</span>
            <span>₹{priceRange[1]}</span>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h4 className="font-semibold mb-4">Subcategories</h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {subcategories.length === 0 ? (
            <p className="text-sm text-gray-500">No subcategories available</p>
          ) : currentCategory ? (
            // Single category view - flat list
            subcategories.map(renderSubcategoryCheckbox)
          ) : (
            // All categories view - grouped by category
            Object.entries(groupedSubcategories).map(([category, subs]) => (
              <div key={category} className="mb-3">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1 capitalize">{category.replace(/-/g, ' ')}</p>
                {subs.map(renderSubcategoryCheckbox)}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mb-8">
        <h4 className="font-semibold mb-4">Material</h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {materials.length === 0 ? (
            <p className="text-sm text-gray-500">No materials available</p>
          ) : (
            materials.map(renderMaterialCheckbox)
          )}
        </div>
      </div>

      <div className="mb-8">
        <h4 className="font-semibold mb-4">Color</h4>
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => (
            <button
              key={color}
              className="px-3 py-1 border border-border rounded-full text-sm hover:border-accent hover:text-accent transition-colors"
            >
              {color}
            </button>
          ))}
        </div>
      </div>

      <button 
        onClick={handleApplyFilters}
        className="w-full bg-accent hover:bg-secondary text-white py-2 rounded-md font-medium transition-colors"
      >
        Apply Filters
      </button>
    </div>
  );
}
