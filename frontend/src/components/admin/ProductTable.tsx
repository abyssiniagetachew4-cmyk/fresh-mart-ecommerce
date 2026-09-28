import React from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Star, Trash2, Edit } from 'lucide-react';
import axios from 'axios';
import { toast } from '../../hooks/use-toast';

interface Props {
  products: any[];
  onEdit: (product: any) => void;
  onRefresh: () => void;
}

const ProductTable: React.FC<Props> = ({ products, onEdit, onRefresh }) => {
  const toggleFeatured = async (id: string) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/products/admin/${id}/featured`
      );
      toast({ title: 'Featured status updated' });
      onRefresh();
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update featured status',
        variant: 'destructive'
      });
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/products/admin/${id}`
      );
      toast({ title: 'Product deleted' });
      onRefresh();
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete product',
        variant: 'destructive'
      });
    }
  };

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left">
          <th>Name</th>
          <th>Price</th>
          <th>Stock</th>
          <th>Status</th>
          <th>Featured</th>
          <th />
        </tr>
      </thead>

      <tbody>
        {products.map(product => (
          <tr key={product._id} className="border-t">
            <td>{product.name}</td>
            <td>${product.price}</td>
            <td>
              {product.stock}
              {product.stock <= product.lowStockThreshold && (
                <Badge variant="destructive" className="ml-2">
                  Low
                </Badge>
              )}
            </td>
            <td>
              <Badge>{product.status}</Badge>
            </td>
            <td>
              <Button
                size="icon"
                variant={product.isFeatured ? 'default' : 'outline'}
                onClick={() => toggleFeatured(product._id)}
              >
                <Star className="w-4 h-4" />
              </Button>
            </td>
            <td className="flex gap-2">
              <Button
                size="icon"
                variant="outline"
                onClick={() => onEdit(product)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="destructive"
                onClick={() => deleteProduct(product._id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ProductTable;
