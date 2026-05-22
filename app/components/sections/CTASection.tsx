'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Page } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { TiptapRenderer } from '@/app/components/ui/TiptapRenderer';
import { cn, getImageSrc } from '@/app/lib/utils';
import { useScrollAnimation } from '@/app/hooks/useScrollAnimation';
type CtaSectionInput = NonNullable<Page['ctaSection']> & {
  subtitle?: unknown;
  image?: { url?: string; altText?: string };
};

interface CTASectionProps {
  ctaSection?: CtaSectionInput | null;
  className?: string;
}

function hexToRgb(hex: string, alpha = 1) {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const normalized = hex.replace(shorthandRegex, (_m, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(normalized);
  return result
    ? `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})`
    : `rgba(0, 0, 0, ${alpha})`;
}

function normalizeHref(href: string): string {
  const t = href.trim();
  if (t.startsWith('http') || t.startsWith('mailto:') || t.startsWith('tel:')) return t;
  return t.startsWith('/') ? t : `/${t}`;
}

function resolveBackgroundImage(cta?: CtaSectionInput | null): string | undefined {
  if (!cta) return undefined;
  const raw =
    cta.backgroundImage ??
    cta.image?.url ??
    (cta as { mediaItems?: Array<{ url?: string }> }).mediaItems?.[0]?.url;

  if (!raw) return undefined;
  return typeof raw === 'string' ? getImageSrc(raw) : undefined;
}

function resolvePrimaryButton(cta?: CtaSectionInput | null) {
  const primary = cta?.primaryButton;
  if (primary?.label?.trim() && primary?.href?.trim()) {
    return { label: primary.label.trim(), href: normalizeHref(primary.href) };
  }
  return null;
}

export const CTASection: React.FC<CTASectionProps> = ({ ctaSection, className }) => {
  const { site } = useWebBuilder();
  const [isLoaded, setIsLoaded] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const themeData = useMemo(() => {
    const t = site?.theme;
    return {
      primaryColor: t?.primaryButtonColorLight || t?.darkPrimaryColor || '#4f46e5',
      secondaryColor: t?.darkSecondaryColor || t?.lightSecondaryColor || '#7c3aed',
    };
  }, [site?.theme]);

  const primaryColor = themeData.primaryColor;
  const secondaryColor = themeData.secondaryColor;

  const ctaImage = resolveBackgroundImage(ctaSection);
  const primaryButton = resolvePrimaryButton(ctaSection);
  const hasContent = Boolean(
    ctaSection?.title || ctaSection?.description || ctaSection?.subtitle || primaryButton || ctaImage
  );

  const { ref: headingRef, isVisible: headingVisible } = useScrollAnimation<HTMLHeadingElement>();
  const { ref: descriptionRef, isVisible: descriptionVisible } = useScrollAnimation<HTMLParagraphElement>();
  const { ref: ctaButtonRef, isVisible: ctaButtonVisible } = useScrollAnimation<HTMLDivElement>();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--theme-primary-color', primaryColor);
    root.style.setProperty('--theme-secondary-color', secondaryColor);
  }, [primaryColor, secondaryColor]);

  if (!ctaSection?.enabled || !hasContent) return null;

  const styles = `
    @keyframes float {
      0% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-20px) rotate(5deg); }
      100% { transform: translateY(0) rotate(0deg); }
    }

    @keyframes pulse {
      0% { opacity: 0.3; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(1.05); }
      100% { opacity: 0.3; transform: scale(1); }
    }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes shimmer-flow {
      0% { transform: translateX(-100%) rotate(-45deg); }
      100% { transform: translateX(300%) rotate(-45deg); }
    }

    .fade-in-up {
      opacity: 0;
      transform: translateY(30px);
    }

    .fade-in-up.visible {
      animation: fadeInUp 0.8s ease-out forwards;
    }

    .floating-shape {
      animation: float 8s ease-in-out infinite;
    }

    .pulse-glow {
      animation: pulse 6s ease-in-out infinite;
    }

    .organic-button {
      display: inline-flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem 3rem;
      font-size: 1rem;
      font-weight: 500;
      text-decoration: none;
      color: white;
      background: transparent;
      border: 2px solid;
      border-image: linear-gradient(135deg, var(--theme-primary-color), var(--theme-secondary-color)) 1;
      border-radius: 50px;
      position: relative;
      overflow: hidden;
      transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
      backdrop-filter: blur(10px);
    }

    .organic-button::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, var(--theme-primary-color), var(--theme-secondary-color));
      opacity: 0;
      transition: opacity 0.6s ease;
      border-radius: 50px;
    }

    .organic-button:hover::before {
      opacity: 1;
    }

    .organic-button:hover {
      transform: translateY(-3px);
      box-shadow: 0 15px 35px ${hexToRgb(primaryColor, 0.3)};
      border-color: transparent;
    }

    .organic-button > * {
      position: relative;
      z-index: 1;
      transition: color 0.3s ease;
    }

    .organic-button .button-text {
      color: white;
    }

    .shimmer-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        45deg,
        transparent 30%,
        rgba(255, 255, 255, 0.3) 50%,
        transparent 70%
      );
      transform: translateX(-100%) rotate(-45deg);
      animation: shimmer-flow 3s ease-in-out infinite;
      animation-delay: 2s;
    }

    .royal-heading {
      font-size: clamp(3rem, 8vw, 6rem);
      font-weight: 300;
      line-height: 0.9;
      letter-spacing: -0.04em;
      color: white;
      font-family: 'serif', Georgia, 'Times New Roman', serif;
    }

    .royal-subheading {
      font-size: clamp(1rem, 2vw, 1.25rem);
      font-weight: 400;
      letter-spacing: 0.05em;
      color: rgba(255, 255, 255, 0.8);
      text-transform: uppercase;
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      <section
        ref={sectionRef}
        className={cn(
          'relative flex min-h-[600px] items-center overflow-hidden py-20',
          className
        )}
        style={{ perspective: '1000px' }}
      >
        <div className="absolute inset-0" style={{ zIndex: 0 }}>
          {ctaImage ? (
            <Image
              src={ctaImage}
              alt="CTA background"
              fill
              className={`object-cover transition-all duration-1000 ${
                isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
              }`}
              quality={75}
              sizes="100vw"
              priority
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
              }}
            />
          )}

          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${hexToRgb(primaryColor, 0.85)}, ${hexToRgb(secondaryColor, 0.85)})`,
            }}
          />
          <div className="shimmer-overlay" />
        </div>

        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-white opacity-5 blur-3xl pulse-glow" />
        <div
          className="absolute bottom-0 left-0 h-[30rem] w-[30rem] rounded-full bg-white opacity-[0.03] blur-3xl pulse-glow"
          style={{ animationDelay: '2s' }}
        />

        <div className="container relative z-10 mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center" style={{ transform: 'translateZ(50px)' }}>
            {ctaSection.subtitle && (
              <p
                className={`royal-subheading fade-in-up mb-4 ${headingVisible ? 'visible' : ''}`}
                style={{ animationDelay: '0.2s' }}
              >
                <TiptapRenderer content={ctaSection.subtitle} as="inline" />
              </p>
            )}

            <div
              className={`mx-auto h-px transition-all duration-1000 delay-300 ${
                headingVisible ? 'w-24 opacity-60' : 'w-0 opacity-0'
              }`}
              style={{
                background: 'linear-gradient(90deg, transparent, white, transparent)',
              }}
            />

            {ctaSection.title && (
              <h2
                ref={headingRef}
                className={`royal-heading fade-in-up mb-6 ${headingVisible ? 'visible' : ''}`}
                style={{ animationDelay: '0.4s' }}
              >
                <TiptapRenderer content={ctaSection.title} as="inline" />
              </h2>
            )}

            {ctaSection.description && (
              <p
                ref={descriptionRef}
                className={`fade-in-up mx-auto mb-10 max-w-3xl text-xl leading-relaxed text-white/90 ${
                  descriptionVisible ? 'visible' : ''
                }`}
                style={{ animationDelay: '0.6s' }}
              >
                <TiptapRenderer content={ctaSection.description} as="inline" />
              </p>
            )}

            {primaryButton && (
              <div
                ref={ctaButtonRef}
                className={`fade-in-up ${ctaButtonVisible ? 'visible' : ''}`}
                style={{ animationDelay: '0.8s' }}
              >
                <Link href={primaryButton.href} className="organic-button group">
                  <span className="button-text">{primaryButton.label}</span>
                  <svg
                    className="h-5 w-5 transition-transform duration-500 group-hover:translate-x-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default CTASection;
