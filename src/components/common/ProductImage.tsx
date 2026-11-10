import React, { useEffect, useState } from 'react';
import { Package } from 'lucide-react';

interface ProductImageProps {
  src?: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
}

export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  className = '',
  loading = 'lazy',
}) => {
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    setErrored(false);
  }, [src]);

  if (!src || errored) {
    return (
      <div
        className={`flex items-center justify-center bg-[#F3EFE7] text-[#9AA39C] ${className}`}
        role="img"
        aria-label={alt}
      >
        <Package className="h-5 w-5" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      onError={() => setErrored(true)}
      className={`object-cover bg-[#F3EFE7] ${className}`}
    />
  );
};
