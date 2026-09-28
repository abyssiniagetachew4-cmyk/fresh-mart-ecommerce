import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { toast } from '../../hooks/use-toast';
import axios from 'axios';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product?: any;
  categories: any[];
}

const ProductFormModal: React.FC<Props> = ({
  open,
  onClose,
  onSuccess,
  product,
  categories
}) => {
  const [form, setForm] = useState({
    name: '',
    price: '',
    stock: '',
    description: '',
    category: '',
    brand: '',
    sku: '',
    lowStockThreshold: '10',
    isFeatured: false,
    isActive: true
  });

  const [isLoading, setIsLoading] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || '',
        price: product.price?.toString() || '',
        stock: product.stock?.toString() || '',
        description: product.description || '',
        category: product.category?._id || product.category || '',
        brand: product.brand || '',
        sku: product.sku || '',
        lowStockThreshold: product.lowStockThreshold?.toString() || '10',
        isFeatured: Boolean(product.isFeatured),
        isActive: product.isActive !== false
      });
    } else {
      setForm({
        name: '',
        price: '',
        stock: '',
        description: '',
        category: categories.length > 0 ? categories[0]._id : '',
        brand: '',
        sku: '',
        lowStockThreshold: '10',
        isFeatured: false,
        isActive: true
      });
    }
  }, [product, categories]);

  if (!open) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Product name is required',
        variant: 'destructive'
      });
      return false;
    }

    if (!form.price || parseFloat(form.price) <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Price must be greater than 0',
        variant: 'destructive'
      });
      return false;
    }

    if (!form.category) {
      toast({
        title: 'Validation Error',
        description: 'Please select a category',
        variant: 'destructive'
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    // MINIMAL PAYLOAD - Only required fields
    const payload = {
      name: form.name.trim(),
      price: parseFloat(form.price),
      category: form.category, // Just the category ID
      stock: parseInt(form.stock) || 0,
      description: form.description.trim() || '',
      brand: form.brand.trim() || '',
      // SKU and other fields are optional in backend
    };

    console.log('🚀 Sending MINIMAL payload:', payload);

    try {
      const url = product
        ? `http://localhost:5000/api/products/admin/${product._id}`
        : `http://localhost:5000/api/products/admin`;

      const response = await axios({
        method: product ? 'put' : 'post',
        url,
        data: payload,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Backend response:', response.data);

      if (response.data.success) {
        toast({
          title: 'Success! 🎉',
          description: product ? 'Product updated' : 'Product created'
        });
        
        onSuccess();
        onClose();
      } else {
        throw new Error(response.data.message || 'Failed to save');
      }

    } catch (error: any) {
      console.error('❌ Error details:', error);
      
      // Get detailed error info
      let errorMessage = 'Failed to save product';
      let errorDetails = '';
      
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        
        errorMessage = `Server error (${error.response.status}): `;
        if (error.response.data?.message) {
          errorMessage += error.response.data.message;
          errorDetails = error.response.data.stack || '';
        } else if (error.response.data?.error) {
          errorMessage += error.response.data.error;
        }
      } else if (error.request) {
        errorMessage = 'No response from server. Is backend running?';
      } else {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {product ? 'Edit Product' : 'Add Product'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            ✕
          </Button>
        </div>

        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-blue-700 font-medium">Debug Mode</p>
          <p className="text-blue-600 text-sm mt-1">
            Sending minimal required fields only
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Product Name *</label>
              <Input 
                name="name" 
                placeholder="e.g., Organic Apples" 
                value={form.name} 
                onChange={handleChange} 
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Price ($) *</label>
              <Input 
                name="price" 
                type="number" 
                step="0.01"
                min="0.01"
                placeholder="0.00" 
                value={form.price} 
                onChange={handleChange} 
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Stock</label>
              <Input 
                name="stock" 
                type="number" 
                min="0"
                placeholder="0" 
                value={form.stock} 
                onChange={handleChange} 
              />
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Category *</label>
              <Select 
                value={form.category} 
                onValueChange={value => setForm({ ...form, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Brand</label>
              <Input 
                name="brand" 
                placeholder="FreshFarm" 
                value={form.brand} 
                onChange={handleChange} 
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Description</label>
              <Textarea
                name="description"
                placeholder="Product description..."
                value={form.description}
                onChange={handleChange}
                rows={2}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Saving...' : (product ? 'Update' : 'Create')}
          </Button>
        </div>

        <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
          <p className="font-medium">Debug Info:</p>
          <p>Category ID: {form.category}</p>
          <p>Category Name: {form.category ? categories.find(c => c._id === form.category)?.name : 'None'}</p>
        </div>
      </div>
    </div>
  );
};

export default ProductFormModal;