'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { createPortal } from 'react-dom';

interface ImageZoomProps {
  src: string;
  alt: string;
  className?: string;
}

export default function ImageZoom({ src, alt, className = '' }: ImageZoomProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [imageTop, setImageTop] = useState(0);
  const [imageHeight, setImageHeight] = useState(0);
  const imageRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setZoomPosition({ x, y });
    setImageTop(rect.top);
    setImageHeight(rect.height);

    if (!isZoomed) setIsZoomed(true);
  }, [isZoomed]);

  const handleMouseLeave = () => {
    setIsZoomed(false);
  };

  return (
    <>
      {/* Main image container */}
      <div
        ref={imageRef}
        className={`relative w-full aspect-square bg-white rounded-2xl overflow-hidden border border-gray-200 cursor-crosshair ${className}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Zoomed image - fixed on the right side of viewport, medium size */}
      {isZoomed && typeof window !== 'undefined' && createPortal(
        <div
          className="fixed right-8 left-auto bg-white border border-gray-200 shadow-2xl z-[100] pointer-events-none rounded-2xl overflow-hidden"
          style={{
            top: '120px',
            width: '65vw',
            height: '500px',
            maxWidth: '700px',
            maxHeight: '550px',
          }}
        >
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `url(${src})`,
              backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
              backgroundSize: '300%',
              backgroundRepeat: 'no-repeat',
            }}
          />
        </div>,
        document.body
      )}
    </>
  );
}
