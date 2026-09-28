/**
 * CategoryCard Component
 * ✅ FIXED — correct images for all categories
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Category } from '@/types';

interface CategoryCardProps {
  category: Category;
}

// Map category SLUGS exactly as in database
const getCategoryImage = (category: Category) => {
  const slug = category.slug;

  const imageMap: Record<string, string> = {
    'fresh-fruit': '/fruit.jpg',
    'vegetables': '/vegetable.jpg',
    'dairy-eggs': '/dairy.jpg',
    'beverages': '/beverages.jpg',
    'bakery': '/bakery.jpg',
    'meat-seafood': '/meat.jpg',
  };

  return imageMap[slug || ''] || '/vegetable.jpg';
};

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const imageSrc = getCategoryImage(category);

  return (
    <Link
      to={`/products?category=${category.slug}`}
      className="group block"
    >
      <article className="relative h-48 md:h-56 lg:h-64 overflow-hidden rounded-2xl shadow-soft">
        
        {/* Image */}
        <img
          src={imageSrc}
          alt={category.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/vegetable.jpg';
          }}
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        {/* Text */}
        <div className="absolute inset-0 p-5 flex flex-col justify-end">
          <h3 className="text-xl lg:text-2xl font-semibold text-white mb-1">
            {category.name}
          </h3>

          <div className="flex items-center gap-2 text-white">
            <span className="text-sm font-medium">
              {category.productCount ?? 0} Products
            </span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>

      </article>
    </Link>
  );
};

export default CategoryCard;
