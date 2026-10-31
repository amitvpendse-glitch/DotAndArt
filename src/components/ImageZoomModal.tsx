import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Eye,
  ArrowRight,
  Maximize2,
  Download,
  Check,
} from 'lucide-react';
import { Product } from '../types';
import { SafeProductImage } from './SafeProductImage';
import { AvailableBadge } from './AvailableBadge';
import { downloadArtworkImage } from '../utils/whatsapp';

interface ImageZoomModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  initialImageIndex?: number;
  onSelectProduct?: (sku: string) => void;
  onPrevProduct?: () => void;
  onNextProduct?: () => void;
  hasPrevProduct?: boolean;
  hasNextProduct?: boolean;
}

export const ImageZoomModal: React.FC<ImageZoomModalProps> = ({
  product,
  isOpen,
  onClose,
  initialImageIndex = 0,
  onSelectProduct,
  onPrevProduct,
  onNextProduct,
  hasPrevProduct = true,
  hasNextProduct = true,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState<number>(initialImageIndex);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panPosition, setPanPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync initial index when modal opens or product changes
  useEffect(() => {
    setActiveImageIndex(initialImageIndex);
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  }, [product, initialImageIndex, isOpen]);

  // Keyboard controls (Esc to close, Left/Right arrows to switch artworks or photos)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        if (zoomLevel <= 1) {
          if (onPrevProduct) {
            onPrevProduct();
          } else {
            handlePrevImage();
          }
        }
      } else if (e.key === 'ArrowRight') {
        if (zoomLevel <= 1) {
          if (onNextProduct) {
            onNextProduct();
          } else {
            handleNextImage();
          }
        }
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-') {
        handleZoomOut();
      } else if (e.key === '0') {
        handleResetZoom();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeImageIndex, product, zoomLevel, onPrevProduct, onNextProduct]);

  if (!isOpen || !product) return null;

  const imagesList = product?.images && product?.images.length > 0 ? product?.images : [];
  const currentImage = imagesList[activeImageIndex] || {
    storage_path: undefined,
    alt_text: product.name,
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 3.5));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPanPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  const handlePrevImage = () => {
    if (imagesList.length <= 1) return;
    setActiveImageIndex((prev) => (prev === 0 ? imagesList.length - 1 : prev - 1));
    handleResetZoom();
  };

  const handleNextImage = () => {
    if (imagesList.length <= 1) return;
    setActiveImageIndex((prev) => (prev === imagesList.length - 1 ? 0 : prev + 1));
    handleResetZoom();
  };

  const handleDoubleClick = () => {
    if (zoomLevel === 1) {
      setZoomLevel(2);
    } else {
      handleResetZoom();
    }
  };

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel <= 1) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { ...panPosition };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoomLevel <= 1) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPanPosition({
      x: panStartRef.current.x + dx,
      y: panStartRef.current.y + dy,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Wheel zoom handler
  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY < 0) {
      setZoomLevel((prev) => Math.min(prev + 0.2, 3.5));
    } else if (e.deltaY > 0) {
      setZoomLevel((prev) => {
        const next = Math.max(prev - 0.2, 1);
        if (next === 1) setPanPosition({ x: 0, y: 0 });
        return next;
      });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md transition-all animate-in fade-in duration-200 select-none p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl h-[92vh] flex flex-col bg-slate-950/90 text-white rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-white/10 bg-slate-900/80 backdrop-blur-md shrink-0 z-20">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
              <Eye className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-sm sm:text-base font-bold text-white truncate">
                  {product.name}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-amber-300 border border-white/10 shrink-0">
                  {product.sku}
                </span>
                {product.show_available_badge !== false && (
                  <AvailableBadge
                    isAvailable={product.is_available !== false}
                    badgeText={product.available_badge_text}
                    unavailableText={product.unavailable_badge_text}
                    size="xs"
                  />
                )}
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                {product.category_name || 'Catalog Artwork'} • High Definition Zoom Inspector
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">


            {onSelectProduct && (
              <button
                onClick={() => {
                  onClose();
                  onSelectProduct(product.sku);
                }}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all cursor-pointer shadow-md"
              >
                <span>View Product</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer border border-white/10"
              title="Close Zoom Viewer (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Image Stage */}
        <div
          ref={containerRef}
          className={`relative flex-1 bg-slate-950 flex items-center justify-center overflow-hidden p-4 ${
            zoomLevel > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in'
          }`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          onDoubleClick={handleDoubleClick}
        >
          {/* Image Container with Zoom & Pan */}
          <div
            className="w-full h-full flex items-center justify-center transition-transform duration-100 ease-out"
            style={{
              transform: `scale(${zoomLevel}) translate(${panPosition.x / zoomLevel}px, ${
                panPosition.y / zoomLevel
              }px)`,
            }}
          >
            <SafeProductImage
              src={currentImage.storage_path}
              alt={currentImage.alt_text || product.name}
              name={product.name}
              sku={product.sku}
              category_slug={product.category_slug}
              size="lg"
              priority={true}
              useThumbnail={false}
              fit="contain"
              className="max-w-full max-h-full object-contain pointer-events-none drop-shadow-2xl"
            />
          </div>

          {/* Previous / Next Product & Image Navigation overlay buttons */}
          {(onPrevProduct || imagesList.length > 1) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onPrevProduct) {
                  onPrevProduct();
                } else if (imagesList.length > 1 && activeImageIndex > 0) {
                  handlePrevImage();
                } else {
                  handlePrevImage();
                }
              }}
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 p-3 sm:p-3.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-white backdrop-blur-md border border-white/20 shadow-2xl transition-all cursor-pointer hover:scale-110 flex items-center justify-center"
              title="Previous Artwork Item"
            >
              <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
            </button>
          )}

          {(onNextProduct || imagesList.length > 1) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onNextProduct) {
                  onNextProduct();
                } else if (imagesList.length > 1 && activeImageIndex < imagesList.length - 1) {
                  handleNextImage();
                } else {
                  handleNextImage();
                }
              }}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 p-3 sm:p-3.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-white backdrop-blur-md border border-white/20 shadow-2xl transition-all cursor-pointer hover:scale-110 flex items-center justify-center"
              title="Next Artwork Item"
            >
              <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
            </button>
          )}

          {/* Floating Zoom Control Bar */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-900/90 backdrop-blur-lg border border-white/15 shadow-2xl">
            <button
              onClick={handleZoomOut}
              disabled={zoomLevel <= 1}
              className="p-1.5 rounded-lg hover:bg-white/15 text-slate-200 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer"
              title="Zoom Out (-)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <span className="px-2 text-xs font-mono font-bold text-amber-400 min-w-[3.5rem] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>

            <button
              onClick={handleZoomIn}
              disabled={zoomLevel >= 3.5}
              className="p-1.5 rounded-lg hover:bg-white/15 text-slate-200 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer"
              title="Zoom In (+)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <div className="w-px h-4 bg-white/20 mx-1" />

            <button
              onClick={handleResetZoom}
              className="p-1.5 rounded-lg hover:bg-white/15 text-slate-200 transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-medium"
              title="Reset Zoom (0)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>

            {/* Direct preset buttons */}
            <div className="hidden md:flex items-center gap-1 ml-1 pl-2 border-l border-white/20">
              {[1, 1.5, 2, 3].map((scale) => (
                <button
                  key={scale}
                  onClick={() => {
                    setZoomLevel(scale);
                    if (scale === 1) setPanPosition({ x: 0, y: 0 });
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                    zoomLevel === scale
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-white/5 hover:bg-white/15 text-slate-300'
                  }`}
                >
                  {scale}x
                </button>
              ))}
            </div>
          </div>

          {/* Guidance Helper Note */}
          <div className="absolute top-4 right-4 hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/60 backdrop-blur-xs border border-white/10 text-[10px] text-slate-300 pointer-events-none">
            <ZoomIn className="w-3 h-3 text-amber-400" />
            <span>Double click or scroll to zoom • Drag to pan</span>
          </div>
        </div>

        {/* Bottom Thumbnail Gallery Bar & Specs Bar */}
        <div className="px-4 sm:px-6 py-3 border-t border-white/10 bg-slate-900/90 backdrop-blur-md shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Thumbnails if multiple images exist */}
          {imagesList.length > 1 ? (
            <div className="flex items-center gap-2 overflow-x-auto max-w-full py-1">
              {imagesList.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => {
                    setActiveImageIndex(idx);
                    handleResetZoom();
                  }}
                  className={`relative w-12 h-12 rounded-xl overflow-hidden border-2 transition-all cursor-pointer p-1 bg-slate-950 shrink-0 ${
                    activeImageIndex === idx
                      ? 'border-amber-400 scale-105 shadow-md ring-2 ring-amber-400/30'
                      : 'border-white/20 opacity-60 hover:opacity-100'
                  }`}
                >
                  <SafeProductImage
                    src={img.storage_path}
                    alt={img.alt_text || `Thumbnail ${idx + 1}`}
                    name={product.name}
                    sku={product.sku}
                    category_slug={product.category_slug}
                    size="sm"
                    fit="contain"
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-400 font-mono">
              Base Size: <strong className="text-white">{product.base_size}</strong>
            </div>
          )}

          {/* Details & Mobile View Product Button */}
          <div className="flex items-center justify-between w-full sm:w-auto gap-4">
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                Artwork Price
              </span>
              <span className="font-serif text-lg font-bold text-amber-400">
                ₹{product.base_price.toLocaleString('en-IN')}
              </span>
            </div>

            {onSelectProduct && (
              <button
                onClick={() => {
                  onClose();
                  onSelectProduct(product.sku);
                }}
                className="sm:hidden flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-500 text-slate-950 text-xs font-bold transition-all cursor-pointer"
              >
                <span>View Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
