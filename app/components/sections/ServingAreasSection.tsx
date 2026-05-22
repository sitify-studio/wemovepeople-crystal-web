'use client';

import { useEffect, useState, useMemo } from 'react';
import type { Page } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { TiptapRenderer } from '@/app/components/ui/TiptapRenderer';
import { cn } from '@/app/lib/utils';
import { tiptapToText } from '@/app/lib/seo';
import { getAreaCity, getAreaRegion, normalizeSlug, resolveServiceSlug } from '@/app/lib/serviceAreaSlugs';
import { useScrollAnimation } from '@/app/hooks/useScrollAnimation';

interface ServingAreasSectionProps {
  servingAreasSection?: Page['servingAreasSection'];
  className?: string;
}

type DisplayArea = {
  city: string;
  region: string;
};

function normalizeServiceArea(area: unknown): DisplayArea | null {
  if (!area) return null;

  if (typeof area === 'string') {
    const trimmed = area.trim();
    if (!trimmed) return null;
    const parts = trimmed.split(',').map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      return { city: parts[0], region: parts.slice(1).join(', ') };
    }
    return { city: trimmed, region: '' };
  }

  const city = getAreaCity(area);
  const region = getAreaRegion(area);
  if (!city && !region) return null;
  return { city: city || region, region: city ? region : '' };
}

function areaKey(area: DisplayArea): string {
  return `${area.city}|${area.region}`.toLowerCase();
}

export const ServingAreasSection: React.FC<ServingAreasSectionProps> = ({
  servingAreasSection,
  className,
}) => {
  const { site, services } = useWebBuilder();
  const [isLoaded, setIsLoaded] = useState(false);

  const { ref: titleRef, isVisible: titleVisible } =
    useScrollAnimation<HTMLHeadingElement>({ threshold: 0.3 });
  const { ref: areasRef, isVisible: areasVisible } =
    useScrollAnimation<HTMLDivElement>({ threshold: 0.3 });

  const themeData = useMemo(() => {
    const t = site?.theme;
    return {
      primaryColor: t?.primaryButtonColorLight || t?.darkPrimaryColor || '#8B4513',
      secondaryColor: t?.darkSecondaryColor || t?.lightSecondaryColor || '#D2691E',
    };
  }, [site?.theme]);

  const serviceAreas = useMemo<DisplayArea[]>(() => {
    const result: DisplayArea[] = [];
    const seen = new Set<string>();
    const add = (area: unknown) => {
      const normalized = normalizeServiceArea(area);
      if (!normalized) return;
      const key = areaKey(normalized);
      if (seen.has(key)) return;
      seen.add(key);
      result.push(normalized);
    };
    const sectionSlug = servingAreasSection?.serviceSlug?.trim();

    if (sectionSlug) {
      const match = services.find(
        (s) => resolveServiceSlug(s) === normalizeSlug(sectionSlug)
      );
      (match?.serviceAreas ?? []).forEach(add);
      if (result.length > 0) return result;
    }

    const published = services.filter((s) => s.status === 'published');
    for (const service of published) {
      (service.serviceAreas ?? []).forEach(add);
    }
    if (result.length > 0) return result;

    (site?.serviceAreas ?? []).forEach(add);
    return result;
  }, [servingAreasSection?.serviceSlug, services, site?.serviceAreas]);

  const sectionTitle = useMemo(() => {
    if (servingAreasSection?.title) {
      const text = tiptapToText(servingAreasSection.title).trim();
      if (text) return { isTiptap: true as const, content: servingAreasSection.title };
    }
    return { isTiptap: false as const, content: 'Our Serving Area' };
  }, [servingAreasSection?.title]);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  if (!servingAreasSection?.enabled) return null;
  if (serviceAreas.length === 0) return null;

  const primaryColor = themeData.primaryColor;
  const secondaryColor = themeData.secondaryColor;

  return (
    <section
      className={cn('py-16 sm:py-20 md:py-24 lg:py-32 relative overflow-hidden bg-pink-50', className)}
    >
      {/* Background subtle elements */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle, ${primaryColor}, transparent 70%)`,
          }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle, ${secondaryColor}, transparent 70%)`,
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Title */}
          <div className="text-center mb-12">
            <h2
              ref={titleRef}
              className={`text-4xl md:text-5xl font-bold mb-8 transition-all duration-1000 ${
                titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{
                color: '#8B4513',
                fontFamily: 'Georgia, serif',
              }}
            >
              {sectionTitle.isTiptap ? (
                <TiptapRenderer content={sectionTitle.content} as="inline" />
              ) : (
                sectionTitle.content
              )}
            </h2>

            {/* Decorative wavy line */}
            <div
              className={`flex justify-center mb-8 transition-all duration-1000 delay-300 ${
                titleVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
              }`}
            >
              <svg width="400" height="40" viewBox="0 0 400 40" className="max-w-full">
                <path
                  d="M10 20 Q50 5, 90 20 T170 20 T250 20 T330 20 T390 20"
                  fill="none"
                  stroke={primaryColor}
                  strokeWidth="2"
                  opacity="0.7"
                />
                <circle cx="90" cy="20" r="2" fill={primaryColor} opacity="0.8" />
                <circle cx="170" cy="20" r="2" fill={secondaryColor} opacity="0.8" />
                <circle cx="250" cy="20" r="2" fill={primaryColor} opacity="0.8" />
                <circle cx="330" cy="20" r="2" fill={secondaryColor} opacity="0.8" />
              </svg>
            </div>
          </div>

          {/* Service Areas List */}
          <div
            ref={areasRef}
            className={`flex flex-wrap justify-center items-center gap-6 md:gap-8 lg:gap-12 transition-all duration-1000 delay-500 ${
              areasVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {serviceAreas.map((area, index) => (
              <div
                key={areaKey(area)}
                className={`flex items-center gap-2 transition-all duration-700 ${
                  isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{
                  transitionDelay: `${0.6 + index * 0.1}s`,
                }}
              >
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  style={{ color: primaryColor }}
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>

                <span
                  className="text-lg md:text-xl font-medium whitespace-nowrap"
                  style={{
                    color: '#8B4513',
                    fontFamily: 'Georgia, serif',
                  }}
                >
                  {area.region ? `${area.city}, ${area.region}` : area.city}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServingAreasSection;
