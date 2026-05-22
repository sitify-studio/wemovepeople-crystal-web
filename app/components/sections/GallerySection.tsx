'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Page } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { TiptapRenderer } from '@/app/components/ui/TiptapRenderer';
import { cn, getImageSrc } from '@/app/lib/utils';
import { tiptapToText } from '@/app/lib/seo';
import { useScrollAnimation } from '@/app/hooks/useScrollAnimation';

interface GallerySectionProps {
  gallerySection?: Page['gallerySection'];
  className?: string;
}

type GalleryImage = {
  id: string;
  title: string;
  altText: string;
  imageUrl: string;
};

export const GallerySection: React.FC<GallerySectionProps> = ({
  gallerySection,
  className,
}) => {
  const { site } = useWebBuilder();

  const theme = useMemo(() => {
    const t = site?.theme;
    return {
      primaryColor: t?.primaryButtonColorLight || t?.darkPrimaryColor || '#7c4a35',
      secondaryColor: t?.darkSecondaryColor || t?.lightSecondaryColor || '#1E40AF',
    };
  }, [site?.theme]);

  const galleryImages = useMemo<GalleryImage[]>(() => {
    return (
      gallerySection?.images
        ?.filter((img) => img?.url)
        .map((img, index) => {
          const caption = tiptapToText(img.caption);
          const alt = img.altText?.trim() || caption || 'Gallery image';
          return {
            id: `gallery-${index}`,
            title: caption || alt,
            altText: alt,
            imageUrl: getImageSrc(img.url),
          };
        }) ?? []
    );
  }, [gallerySection?.images]);

  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  const { ref: titleRef, isVisible: titleVisible } =
    useScrollAnimation<HTMLHeadingElement>({ threshold: 0.2 });
  const { ref: descRef, isVisible: descVisible } =
    useScrollAnimation<HTMLParagraphElement>({ threshold: 0.2 });

  useEffect(() => {
    if (galleryImages.length > 0) {
      setSelectedImage(galleryImages[0]);
    } else {
      setSelectedImage(null);
    }
  }, [galleryImages]);

  if (!gallerySection?.enabled) return null;

  const hasContent =
    galleryImages.length > 0 || gallerySection.title || gallerySection.description;
  if (!hasContent) return null;

  return (
    <section
      id="gallery"
      className={cn(
        'relative overflow-hidden bg-white py-16 sm:py-20 md:py-24 lg:py-28',
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div
          className="absolute right-0 top-1/3 h-80 w-80 rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle, ${theme.primaryColor}12, transparent 70%)`,
          }}
        />
        <div
          className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle, ${theme.secondaryColor}10, transparent 70%)`,
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center md:mb-14">
          <div className="mb-6 flex items-center justify-center gap-4 text-gray-600/80">
            <span className="text-xs font-medium uppercase tracking-[0.2em]">Gallery</span>
            <span
              className="h-px w-16 sm:w-24"
              style={{
                background: `linear-gradient(90deg, transparent, ${theme.primaryColor}, transparent)`,
              }}
            />
          </div>

          {gallerySection.title && (
            <h2
              ref={titleRef}
              className={cn(
                'mx-auto max-w-3xl text-3xl font-light tracking-tight text-gray-900 transition-all duration-700 sm:text-4xl md:text-5xl',
                titleVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              )}
              style={{ fontFamily: 'Georgia, serif' }}
            >
              <TiptapRenderer content={gallerySection.title} as="inline" />
            </h2>
          )}

          {gallerySection.description && (
            <p
              ref={descRef}
              className={cn(
                'mx-auto mt-6 max-w-2xl text-base text-gray-600 transition-all duration-700 delay-150 sm:text-lg',
                descVisible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
              )}
            >
              <TiptapRenderer content={gallerySection.description} as="inline" />
            </p>
          )}

          <div className="mt-8 flex justify-center">
            <Link
              href="/gallery"
              className="inline-flex items-center justify-center rounded-full px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] transition-all duration-300"
              style={{
                color: theme.primaryColor,
                border: `1px solid ${theme.primaryColor}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.background = `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = theme.primaryColor;
              }}
            >
              View Full Gallery
            </Link>
          </div>
        </div>

        {selectedImage && galleryImages.length > 0 && (
          <div className="flex flex-col items-stretch gap-6 lg:flex-row lg:gap-8">
            <div className="flex-1 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="relative aspect-[16/10] w-full bg-gray-50 sm:aspect-[5/3] lg:h-[min(520px,60vh)] lg:aspect-auto">
                <Image
                  src={selectedImage.imageUrl}
                  alt={selectedImage.altText}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 65vw"
                  priority
                />
              </div>
              {selectedImage.title && (
                <p
                  className="border-t border-gray-100 px-5 py-4 text-center text-sm text-gray-600"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  {selectedImage.title}
                </p>
              )}
            </div>

            <div className="flex gap-3 overflow-x-auto pb-1 lg:w-72 lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden lg:pb-0 lg:max-h-[min(560px,62vh)]">
              {galleryImages.map((image) => {
                const isActive = selectedImage.id === image.id;
                return (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => setSelectedImage(image)}
                    className={cn(
                      'group relative shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-300',
                      'h-24 w-32 sm:h-28 sm:w-36 lg:h-auto lg:w-full lg:aspect-[16/10]',
                      isActive
                        ? 'scale-[1.02] shadow-md'
                        : 'border-transparent opacity-80 hover:opacity-100 hover:scale-[1.02]'
                    )}
                    style={{
                      borderColor: isActive ? theme.primaryColor : 'transparent',
                    }}
                    aria-label={`View ${image.altText}`}
                    aria-pressed={isActive}
                  >
                    <Image
                      src={image.imageUrl}
                      alt={image.altText}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 120px, 288px"
                    />
                    <div
                      className={cn(
                        'absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/50 to-transparent p-2 transition-opacity duration-300',
                        isActive ? 'opacity-100' : 'opacity-0 lg:group-hover:opacity-100'
                      )}
                    >
                      <span className="line-clamp-2 text-center text-[10px] font-medium uppercase tracking-wider text-white">
                        {image.title}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default GallerySection;
