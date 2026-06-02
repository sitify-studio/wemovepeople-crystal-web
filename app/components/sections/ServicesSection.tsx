'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Page, Service } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { TiptapRenderer } from '@/app/components/ui/TiptapRenderer';
import { cn, getImageSrc, SECTION_PY } from '@/app/lib/utils';
import { useScrollAnimation } from '@/app/hooks/useScrollAnimation';
import { tiptapToText } from '@/app/lib/seo';

interface ServicesSectionProps {
  servicesSection?: Page['servicesSection'];
  companyDetailSection?: Page['companyDetailSection'];
  ctaSection?: Page['ctaSection'];
  page?: Page | null;
  className?: string;
}

function resolveServiceImage(service: Service): string | undefined {
  if (service.thumbnailImage?.url) return getImageSrc(service.thumbnailImage.url);
  if (service.galleryImages?.[0]?.url) return getImageSrc(service.galleryImages[0].url);
  return undefined;
}

function normalizeHref(href: string): string {
  const t = href.trim();
  if (t.startsWith('http') || t.startsWith('mailto:') || t.startsWith('tel:')) return t;
  return t.startsWith('/') ? t : `/${t}`;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  servicesSection,
  className,
}) => {
  const { site, services: allServices } = useWebBuilder();

  const theme = useMemo(() => {
    const t = site?.theme;
    return {
      primaryColor: t?.primaryButtonColorLight || t?.darkPrimaryColor || '#7c4a35',
      secondaryColor: t?.darkSecondaryColor || t?.lightSecondaryColor || '#1E40AF',
    };
  }, [site?.theme]);

  const displayServices = useMemo(() => {
    const ids = servicesSection?.serviceIds ?? [];
    const published = (allServices ?? []).filter((s) => s.status === 'published');

    if (ids.length === 0) return published;

    return ids
      .map((id) => published.find((s) => s._id === id))
      .filter((s): s is Service => Boolean(s));
  }, [servicesSection?.serviceIds, allServices]);

  const { ref: titleRef, isVisible: titleVisible } =
    useScrollAnimation<HTMLHeadingElement>({ threshold: 0.2 });
  const { ref: descRef, isVisible: descVisible } =
    useScrollAnimation<HTMLParagraphElement>({ threshold: 0.2 });

  if (!servicesSection?.enabled) return null;

  const hasContent = Boolean(
    servicesSection.title || servicesSection.description || displayServices.length > 0
  );
  if (!hasContent) return null;

  return (
    <section
      id="services"
      className={cn('relative bg-white', SECTION_PY, className)}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-12">
          <aside className="lg:col-span-4">
            <div className="space-y-6 lg:sticky lg:top-24">
              <div className="flex items-center gap-4 text-gray-700/80">
                <span className="text-sm uppercase tracking-wide">What We Offer</span>
                <span
                  className="h-px flex-1"
                  style={{
                    background: `linear-gradient(90deg, ${theme.primaryColor}, transparent)`,
                  }}
                />
              </div>

              {servicesSection.title && (
                <h2
                  ref={titleRef}
                  className={`text-2xl font-bold text-gray-900 transition-all duration-700 sm:text-3xl md:text-4xl ${
                    titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                >
                  <TiptapRenderer content={servicesSection.title} as="inline" />
                </h2>
              )}

              {servicesSection.description && (
                <p
                  ref={descRef}
                  className={`text-base text-gray-600 transition-all duration-700 delay-150 sm:text-lg ${
                    descVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                  }`}
                >
                  <TiptapRenderer content={servicesSection.description} as="inline" />
                </p>
              )}
            </div>
          </aside>

          <div className="lg:col-span-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {displayServices.map((service, index) => {
                const imageSrc = resolveServiceImage(service);
                const altText =
                  service.thumbnailImage?.altText ||
                  service.galleryImages?.[0]?.altText ||
                  `${service.name} image`;
                const description = tiptapToText(service.shortDescription || service.description);
                const ctaHref = service.slug ? `/service/${service.slug}` : '/services';

                return (
                  <article
                    key={service._id}
                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md focus-within:shadow-md"
                    aria-labelledby={`service-title-${index}`}
                  >
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-50">
                      {imageSrc ? (
                        <Image
                          src={imageSrc}
                          alt={altText}
                          fill
                          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1536px) 25vw, 20vw"
                        />
                      ) : (
                        <div
                          className="flex h-full w-full items-center justify-center text-3xl text-gray-300"
                          aria-hidden
                        >
                          🖼️
                        </div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col gap-3 p-5 md:p-6">
                      <h3 id={`service-title-${index}`} className="text-xl font-semibold text-gray-900">
                        {service.name}
                      </h3>

                      {description && (
                        <p className="line-clamp-2 text-sm text-gray-600">{description}</p>
                      )}

                      <div className="mt-auto pt-2">
                        <Link
                          href={normalizeHref(ctaHref)}
                          className="inline-flex w-full items-center justify-center rounded-md px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:w-auto"
                          style={{
                            color: theme.primaryColor,
                            border: `1px solid ${theme.primaryColor}`,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#ffffff';
                            e.currentTarget.style.background = `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = theme.primaryColor;
                          }}
                          aria-label={`Learn more about ${service.name}`}
                        >
                          Learn More
                        </Link>
                      </div>
                    </div>

                    <div className="pointer-events-none absolute right-3 top-3 opacity-20">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.2" />
                        <path
                          d="M12 7v10M7 12h10"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
