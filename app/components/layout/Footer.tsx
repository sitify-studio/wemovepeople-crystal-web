'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMemo } from 'react';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import {
  getBrandName,
  getCopyrightText,
  getFooterNavLinks,
  getFooterDescriptionContent,
  hasFooterDescriptionContent,
} from '@/app/lib/siteContent';
import { getAreaCity, getAreaRegion } from '@/app/lib/serviceAreaSlugs';
import { getImageSrc } from '@/app/lib/utils';
import { tiptapToText } from '@/app/lib/seo';
import { TiptapRenderer } from '@/app/components/ui/TiptapRenderer';
import { useScrollAnimation, useStaggeredAnimation } from '@/app/hooks/useScrollAnimation';
import { getThemeColors } from '@/app/lib/themeBuilder';

type DisplayServiceArea = {
  city: string;
  region: string;
};

function normalizeServiceArea(area: unknown): DisplayServiceArea | null {
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

function getSocialIcon(platform: string) {
  const platformLower = platform.toLowerCase();
  switch (platformLower) {
    case 'facebook':
      return (
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      );
    case 'instagram':
      return (
        <>
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0 5.838a4 4 0 100 8 4 4 0 000-8zm6.406-2.845a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z" />
        </>
      );
    case 'twitter':
    case 'x':
      return (
        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
      );
    case 'linkedin':
      return (
        <>
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </>
      );
    case 'youtube':
      return (
        <>
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </>
      );
    default:
      return null;
  }
}

export const Footer: React.FC = () => {
  const { site, pages, services } = useWebBuilder();

  const businessName = getBrandName(site);

  const footerDescription = useMemo(
    () => getFooterDescriptionContent(site),
    [site]
  );
  const showFooterDescription = useMemo(
    () => hasFooterDescriptionContent(footerDescription),
    [footerDescription]
  );

  const logoImage = useMemo(() => {
    const url = site?.footer?.logo?.url || site?.theme?.logoUrl;
    return url ? getImageSrc(url) : undefined;
  }, [site?.footer?.logo?.url, site?.theme?.logoUrl]);

  const themeColors = useMemo(() => getThemeColors(site), [site]);

  const themeData = useMemo(() => {
    const t = site?.theme;
    return {
      footerBackground:
        t?.sectionBackgroundColorDark ||
        t?.cardBackgroundColorDark ||
        t?.darkPrimaryColor ||
        'var(--wb-section-bg-dark)',
      primaryColor:
        t?.primaryButtonColorLight ||
        t?.primaryButtonColorDark ||
        themeColors.primaryButton,
      secondaryColor:
        t?.darkSecondaryColor ||
        t?.lightSecondaryColor ||
        themeColors.secondary,
      textOnDark: t?.textOnDarkColor || themeColors.textOnDark,
      textOnDarkSecondary:
        t?.textOnDarkSecondaryColor || themeColors.textOnDarkSecondary,
      hoverActive:
        t?.hoverActiveColorLight ||
        t?.hoverActiveColorDark ||
        themeColors.hoverActive,
    };
  }, [site?.theme, themeColors]);

  const businessData = useMemo(() => {
    const addr = site?.business?.address;
    const serviceAreas: DisplayServiceArea[] = [];
    const seen = new Set<string>();

    const addArea = (area: unknown) => {
      const normalized = normalizeServiceArea(area);
      if (!normalized) return;
      const key = `${normalized.city}|${normalized.region}`.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      serviceAreas.push(normalized);
    };

    for (const service of services.filter((s) => s.status === 'published')) {
      (service.serviceAreas ?? []).forEach(addArea);
    }
    if (serviceAreas.length === 0) {
      (site?.serviceAreas ?? []).forEach(addArea);
    }

    const showSocial = site?.footer?.showSocialLinks !== false;

    return {
      email: site?.business?.email?.trim() || '',
      phone: site?.business?.phone?.trim() || '',
      address: {
        street: addr?.street?.trim() || '',
        city: addr?.city?.trim() || '',
        state: addr?.state?.trim() || '',
        zipCode: addr?.zipCode?.trim() || '',
      },
      socialLinks: showSocial ? (site?.socialLinks ?? []).filter((s) => s?.url?.trim()) : [],
      serviceAreas,
    };
  }, [site, services]);

  const quickLinks = useMemo(() => getFooterNavLinks(pages), [pages]);

  const copyright = useMemo(() => {
    const fromCms = tiptapToText(site?.footer?.copyright);
    if (fromCms) return fromCms;
    const fallback = getCopyrightText(site);
    if (fallback && !/^©\d{4}$/.test(fallback.trim())) return fallback;
    return `© ${new Date().getFullYear()} ${businessName}. All rights reserved.`;
  }, [site, businessName]);

  const { ref: footerRef, isVisible: footerVisible } =
    useScrollAnimation<HTMLElement>({ threshold: 0.1 });
  const { ref: serviceAreasRef } = useStaggeredAnimation(
    businessData.serviceAreas.length,
    100
  );

  if (!site) return null;

  const hasAddress =
    businessData.address.street ||
    businessData.address.city ||
    businessData.address.state ||
    businessData.address.zipCode;

  return (
    <footer
      ref={footerRef}
      id="contact"
      className="relative overflow-hidden pt-12 pb-3 sm:pt-14 sm:pb-4 md:pt-16 md:pb-5"
      style={{
        backgroundColor: themeData.footerBackground,
        color: themeData.textOnDark,
      }}
    >
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle, ${themeData.primaryColor}, transparent 70%)`,
          }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle, ${themeData.secondaryColor}, transparent 70%)`,
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 mb-6">
          <div className="lg:col-span-2">
            {logoImage && (
              <div
                className={`mb-6 transition-all duration-1000 ${
                  footerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
              >
                <Image
                  src={logoImage}
                  alt="Logo"
                  width={280}
                  height={88}
                  className="h-16 w-auto hover:scale-105 transition-transform duration-300 md:h-20"
                />
              </div>
            )}

            {showFooterDescription && (
              <div
                className={`mb-6 max-w-md text-sm leading-relaxed transition-all duration-1000 delay-300 sm:text-base ${
                  footerVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                }`}
                style={{ color: themeData.textOnDarkSecondary }}
              >
                <TiptapRenderer content={footerDescription} as="inline" />
              </div>
            )}

            {businessData.socialLinks.length > 0 && (
              <div
                className={`transition-all duration-1000 delay-500 ${
                  footerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
              >
                <p className="mb-4 font-medium" style={{ color: themeData.textOnDark }}>
                  Follow Us
                </p>
                <div className="flex space-x-4">
                  {businessData.socialLinks.map((social, index) => {
                    const iconPath = getSocialIcon(social.platform);
                    return (
                      <a
                        key={`${social.platform}-${index}`}
                        href={social.url}
                        className="flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-300 hover:scale-110"
                        style={{
                          color: themeData.textOnDarkSecondary,
                          backgroundColor: `color-mix(in srgb, ${themeData.textOnDark} 10%, transparent)`,
                          backdropFilter: 'blur(10px)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = themeData.primaryColor;
                          e.currentTarget.style.color = themeData.textOnDark;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = `color-mix(in srgb, ${themeData.textOnDark} 10%, transparent)`;
                          e.currentTarget.style.color = themeData.textOnDarkSecondary;
                        }}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`Follow us on ${social.platform}`}
                      >
                        {iconPath ? (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            {iconPath}
                          </svg>
                        ) : (
                          <span className="text-xs">{social.platform.charAt(0).toUpperCase()}</span>
                        )}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div>
            <h4
              className={`mb-6 text-lg font-semibold transition-all duration-1000 delay-400 ${
                footerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ color: themeData.textOnDark }}
            >
              Quick Links
            </h4>
            <div
              className={`space-y-3 transition-all duration-1000 delay-500 ${
                footerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              {quickLinks.map((link, index) => (
                <Link
                  key={link.id}
                  href={link.href}
                  className="block transition-colors duration-300 hover:translate-x-1"
                  style={{
                    color: themeData.textOnDarkSecondary,
                    transitionDelay: `${index * 0.1}s`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = themeData.textOnDark;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = themeData.textOnDarkSecondary;
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4
              className={`mb-6 text-lg font-semibold transition-all duration-1000 delay-600 ${
                footerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ color: themeData.textOnDark }}
            >
              Contact Info
            </h4>
            <div
              className={`space-y-4 transition-all duration-1000 delay-700 ${
                footerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              {businessData.phone && (
                <div className="flex items-center space-x-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `color-mix(in srgb, ${themeData.primaryColor} 20%, transparent)` }}
                  >
                    <svg
                      className="w-4 h-4"
                      style={{ color: themeData.primaryColor }}
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                    </svg>
                  </div>
                  <a
                    href={`tel:${businessData.phone.replace(/\s/g, '')}`}
                    className="transition-colors"
                    style={{ color: themeData.textOnDarkSecondary }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = themeData.textOnDark;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = themeData.textOnDarkSecondary;
                    }}
                  >
                    {businessData.phone}
                  </a>
                </div>
              )}

              {businessData.email && (
                <div className="flex items-center space-x-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `color-mix(in srgb, ${themeData.secondaryColor} 20%, transparent)` }}
                  >
                    <svg
                      className="w-4 h-4"
                      style={{ color: themeData.secondaryColor }}
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                    </svg>
                  </div>
                  <a
                    href={`mailto:${businessData.email}`}
                    className="transition-colors"
                    style={{ color: themeData.textOnDarkSecondary }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = themeData.textOnDark;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = themeData.textOnDarkSecondary;
                    }}
                  >
                    {businessData.email}
                  </a>
                </div>
              )}

              {hasAddress && (
                <div className="flex items-start space-x-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center mt-1"
                    style={{ backgroundColor: `color-mix(in srgb, ${themeData.primaryColor} 20%, transparent)` }}
                  >
                    <svg
                      className="w-4 h-4"
                      style={{ color: themeData.primaryColor }}
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                  </div>
                  <div style={{ color: themeData.textOnDarkSecondary }}>
                    {businessData.address.street && <div>{businessData.address.street}</div>}
                    <div>
                      {[businessData.address.city, businessData.address.state]
                        .filter(Boolean)
                        .join(', ')}
                      {businessData.address.zipCode ? ` ${businessData.address.zipCode}` : ''}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {businessData.serviceAreas.length > 0 && (
          <div
            className={`mb-4 transition-all duration-1000 delay-800 ${
              footerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="text-center mb-3">
              <h4 className="mb-2 text-lg font-semibold" style={{ color: themeData.textOnDark }}>
                Service Areas
              </h4>
              <div
                className="h-px mx-auto w-16"
                style={{
                  background: `linear-gradient(90deg, transparent, ${themeData.primaryColor}, transparent)`,
                }}
              />
            </div>
            <div ref={serviceAreasRef} className="flex flex-wrap justify-center gap-6">
              {businessData.serviceAreas.slice(0, 8).map((area, index) => (
                <div
                  key={`${area.city}-${area.region}-${index}`}
                  className="text-sm transition-colors duration-300"
                  style={{
                    color: themeData.textOnDarkSecondary,
                    transitionDelay: `${index * 0.1}s`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = themeData.textOnDark;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = themeData.textOnDarkSecondary;
                  }}
                >
                  {area.region ? `${area.city}, ${area.region}` : area.city}
                </div>
              ))}
            </div>
          </div>
        )}

        <div
          className="pt-4 pb-0"
          style={{
            borderTop: `1px solid color-mix(in srgb, ${themeData.textOnDark} 12%, transparent)`,
          }}
        >
          <p
            className="text-center text-sm leading-snug"
            style={{ color: themeData.textOnDarkSecondary }}
          >
            {copyright}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
