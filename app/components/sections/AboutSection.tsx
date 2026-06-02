'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import type { Page } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { TiptapRenderer } from '@/app/components/ui/TiptapRenderer';
import { resolvePrimaryCta } from '@/app/components/ui/made';
import { cn, getImageSrc, SECTION_PY } from '@/app/lib/utils';
import { useScrollAnimation, useStaggeredAnimation } from '@/app/hooks/useScrollAnimation';

interface AboutSectionProps {
  aboutSection: Page['aboutSection'];
  page?: Page | null;
  className?: string;
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '0, 0, 0';
}

export const AboutSection: React.FC<AboutSectionProps> = ({
  aboutSection,
  page,
  className,
}) => {
  const { site, pages } = useWebBuilder();

  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);

  const themeData = useMemo(() => {
    const t = site?.theme;
    return {
      primaryColor: t?.primaryButtonColorLight || t?.darkPrimaryColor || '#4f46e5',
      secondaryColor: t?.darkSecondaryColor || t?.lightSecondaryColor || '#7c3aed',
    };
  }, [site?.theme]);

  const features = useMemo(
    () => aboutSection?.features?.filter((f) => f?.label?.trim()) ?? [],
    [aboutSection?.features]
  );

  const primaryCta = useMemo(
    () => resolvePrimaryCta(page ?? null, site, pages),
    [page, site, pages]
  );

  const aboutImageSrc = aboutSection?.image?.url
    ? getImageSrc(aboutSection.image.url)
    : undefined;
  const aboutImageAlt = aboutSection?.image?.altText || 'About us';

  const { ref: titleRef, isVisible: titleVisible } =
    useScrollAnimation<HTMLHeadingElement>({ threshold: 0.2 });
  const { ref: descRef, isVisible: descVisible } =
    useScrollAnimation<HTMLParagraphElement>({ threshold: 0.2 });
  const { ref: featuresRef, visibleItems } = useStaggeredAnimation(features.length, 150);
  const { ref: imageRef, isVisible: imageVisible } =
    useScrollAnimation<HTMLDivElement>({ threshold: 0.2 });

  const hasContent = Boolean(
    aboutSection?.title || aboutSection?.description || features.length || aboutImageSrc
  );

  useEffect(() => {
    setIsLoaded(true);

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 25,
        y: (e.clientY / window.innerHeight - 0.5) * 25,
      });
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--theme-primary-color', themeData.primaryColor);
    root.style.setProperty('--theme-secondary-color', themeData.secondaryColor);
    root.style.setProperty('--theme-primary-rgb', hexToRgb(themeData.primaryColor));
    root.style.setProperty('--theme-secondary-rgb', hexToRgb(themeData.secondaryColor));
  }, [themeData]);

  if (!aboutSection?.enabled || !hasContent) return null;

  const { primaryColor, secondaryColor } = themeData;

  const styles = `
    @keyframes fade-slide-up {
      from { opacity: 0; transform: translateY(40px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes geometric-spin {
      0% { transform: rotateX(0deg) rotateY(0deg); }
      100% { transform: rotateX(360deg) rotateY(360deg); }
    }

    @keyframes organic-pulse {
      0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.4; }
      50% { transform: scale(1.2) rotate(180deg); opacity: 0.8; }
    }

    @keyframes shimmer-flow {
      0% { transform: translateX(-100%) rotate(-45deg); }
      100% { transform: translateX(300%) rotate(-45deg); }
    }

    @keyframes depth-float {
      0%, 100% { transform: translateZ(0px) rotateX(0deg) rotateY(0deg); filter: blur(0px); }
      50% { transform: translateZ(20px) rotateX(5deg) rotateY(10deg); filter: blur(0.5px); }
    }

    .royal-about-title {
      font-size: clamp(2.5rem, 6vw, 4rem);
      font-weight: 300;
      line-height: 1;
      letter-spacing: -0.03em;
      color: #1a1a1a;
      font-family: 'serif', Georgia, 'Times New Roman', serif;
    }

    .royal-about-description {
      font-size: clamp(1rem, 2vw, 1.25rem);
      font-weight: 400;
      color: #6b7280;
    }

    .split-content {
      background: linear-gradient(135deg,
        rgba(var(--theme-primary-rgb), 0.02) 0%,
        rgba(var(--theme-secondary-rgb), 0.02) 100%);
      backdrop-filter: blur(20px);
    }

    .shimmer-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.25) 50%, transparent 70%);
      transform: translateX(-100%) rotate(-45deg);
      animation: shimmer-flow 3s ease-in-out infinite; animation-delay: 1.5s;
    }

    .organic-shape {
      border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
      animation: organic-pulse 8s ease-in-out infinite;
    }

    .geometric-3d {
      transform-style: preserve-3d;
      animation: geometric-spin 25s linear infinite;
    }

    .parallax-element { will-change: transform; }

    .depth-layer { animation: depth-float 6s ease-in-out infinite; }

    .royal-accent {
      background: linear-gradient(45deg, var(--theme-primary-color), var(--theme-secondary-color));
      background-size: 200% 200%;
      animation: shimmer-flow 4s ease-in-out infinite;
    }

    .fade-slide-animation { animation: fade-slide-up 0.9s ease-out forwards; }

    .royal-feature-card {
      background: white;
      border: 1px solid rgba(0,0,0,0.06);
      border-radius: 20px;
      padding: 1.5rem;
      position: relative;
      overflow: hidden;
      box-shadow: 0 6px 24px rgba(0,0,0,0.05);
      transition: transform 0.4s ease, box-shadow 0.4s ease, border-color 0.4s ease;
    }

    .royal-feature-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 16px 48px rgba(var(--theme-primary-rgb), 0.15);
      border-color: rgba(var(--theme-primary-rgb), 0.15);
    }

    .royal-feature-icon {
      width: 56px; height: 56px; border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, var(--theme-primary-color), var(--theme-secondary-color));
      box-shadow: 0 8px 24px rgba(var(--theme-primary-rgb), 0.2);
    }

    .royal-image-container {
      position: relative; overflow: hidden; border-radius: 24px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.12);
      transition: transform 0.6s ease, box-shadow 0.6s ease;
    }

    .royal-image-container:hover { transform: scale(1.03); box-shadow: 0 18px 60px rgba(0,0,0,0.18); }

    .royal-image-primary { clip-path: polygon(0 0, 85% 0, 100% 100%, 0 85%); }

    .royal-cta-button {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 2.25rem;
      font-size: 1rem;
      font-weight: 500;
      text-decoration: none;
      color: white;
      background: transparent;
      border-radius: 50px;
      position: relative;
      overflow: hidden;
      transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
      backdrop-filter: blur(10px);
      border: 2px solid transparent;
      background-image:
        linear-gradient(white, white),
        linear-gradient(135deg, var(--theme-primary-color), var(--theme-secondary-color));
      background-origin: border-box;
      background-clip: padding-box, border-box;
    }

    .royal-cta-button::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, var(--theme-primary-color), var(--theme-secondary-color));
      opacity: 0;
      transition: opacity 0.6s ease;
      border-radius: 50px;
    }

    .royal-cta-button:hover::before { opacity: 1; }

    .royal-cta-button > * {
      position: relative;
      z-index: 1;
      transition: color 0.3s ease;
    }

    .royal-cta-button .button-text {
      color: var(--theme-primary-color);
    }

    .royal-cta-button:hover {
      transform: translateY(-3px);
      box-shadow: 0 15px 35px rgba(var(--theme-primary-rgb), 0.3);
    }

    .royal-cta-button:hover > * { color: white; }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      <section
        id="about"
        className={cn('relative overflow-hidden bg-white', SECTION_PY, className)}
        style={
          {
            '--theme-primary-color': primaryColor,
            '--theme-secondary-color': secondaryColor,
            '--theme-primary-rgb': hexToRgb(primaryColor),
            '--theme-secondary-rgb': hexToRgb(secondaryColor),
          } as React.CSSProperties
        }
      >
        <div className="absolute inset-0 split-content">
          <div
            className="absolute top-24 right-1/5 h-96 w-96 organic-shape opacity-5"
            style={{
              background: `radial-gradient(circle, ${primaryColor}20, transparent 70%)`,
              transform: `translate(${mousePosition.x * 0.25}px, ${mousePosition.y * 0.25}px) translateY(${scrollY * 0.08}px)`,
            }}
          />
          <div
            className="absolute bottom-24 left-1/4 h-72 w-72 organic-shape opacity-4"
            style={{
              background: `radial-gradient(ellipse, ${secondaryColor}22, transparent 60%)`,
              transform: `translate(${-mousePosition.x * 0.18}px, ${-mousePosition.y * 0.18}px) translateY(${scrollY * 0.05}px)`,
              animationDelay: '1.5s',
            }}
          />

          <div
            className="absolute top-1/3 left-1/6 parallax-element"
            style={{ transform: `translateY(${scrollY * 0.15}px) translateX(${mousePosition.x * 0.08}px)` }}
          >
            <div className="geometric-3d opacity-7">
              <svg width="110" height="110" viewBox="0 0 110 110">
                <defs>
                  <linearGradient id="aboutGeom1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: primaryColor, stopOpacity: 0.35 }} />
                    <stop offset="100%" style={{ stopColor: secondaryColor, stopOpacity: 0.15 }} />
                  </linearGradient>
                </defs>
                <polygon
                  points="55,8 95,40 80,95 30,95 15,40"
                  fill="url(#aboutGeom1)"
                  stroke={primaryColor}
                  strokeWidth="1"
                  opacity="0.5"
                />
                <circle cx="55" cy="48" r="14" fill="none" stroke={secondaryColor} strokeWidth="1" opacity="0.4" />
              </svg>
            </div>
          </div>

          <div
            className="absolute top-1/2 left-10 h-24 w-3 royal-accent opacity-25 parallax-element"
            style={{
              transform: `translateY(${scrollY * 0.25}px) rotate(${mousePosition.x * 0.1}deg)`,
              borderRadius: '50px',
            }}
          />
          <div
            className="absolute top-1/4 right-14 h-28 w-2 royal-accent opacity-20 parallax-element"
            style={{
              transform: `translateY(${scrollY * -0.18}px) rotate(${-mousePosition.y * 0.1}deg)`,
              borderRadius: '50px',
              animationDelay: '1s',
            }}
          />
        </div>

        <div className="relative z-10 flex items-center">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
              <div className="space-y-8 text-left">
                {aboutSection.title && (
                  <h2
                    ref={titleRef}
                    className={`royal-about-title fade-slide-animation transition-all duration-1200 ${
                      titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                    }`}
                    style={{
                      animationDelay: '0.2s',
                      transform: `translateY(${scrollY * 0.05}px)`,
                    }}
                  >
                    <TiptapRenderer content={aboutSection.title} as="inline" />
                  </h2>
                )}

                <div className="flex items-center">
                  <div
                    className={`h-px transition-all duration-1000 delay-500 ${
                      titleVisible ? 'w-32 opacity-40' : 'w-0 opacity-0'
                    }`}
                    style={{
                      background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor}, transparent)`,
                    }}
                  />
                </div>

                {aboutSection.description && (
                  <p
                    ref={descRef}
                    className={`royal-about-description fade-slide-animation max-w-xl transition-all duration-1200 delay-400 ${
                      descVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`}
                    style={{
                      animationDelay: '0.4s',
                      transform: `translateY(${scrollY * 0.03}px)`,
                    }}
                  >
                    <TiptapRenderer content={aboutSection.description} as="inline" />
                  </p>
                )}

                {features.length > 0 && (
                  <div ref={featuresRef} className="mb-12 space-y-6">
                    {features.map((feature, index) => (
                      <div
                        key={`${feature.label}-${index}`}
                        className={`feature-reveal-animation transition-all duration-1000 ${
                          visibleItems.includes(index)
                            ? 'opacity-100 translate-x-0'
                            : 'opacity-0 -translate-x-12'
                        }`}
                        style={{ animationDelay: `${0.6 + index * 0.2}s` }}
                      >
                        <div className="royal-feature-card group">
                          <div className="shimmer-overlay" />
                          <div className="flex items-start space-x-6">
                            <div className="royal-feature-icon shrink-0">
                              <svg className="h-7 w-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p
                                className="text-lg font-medium leading-relaxed"
                                style={{ color: primaryColor, letterSpacing: '0.01em' }}
                              >
                                {feature.label}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {primaryCta && (
                  <div
                    className={`transition-all duration-1200 ${
                      isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    }`}
                  >
                    <Link href={primaryCta.href} className="royal-cta-button group">
                      <span className="button-text">{primaryCta.label}</span>
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  </div>
                )}
              </div>

              <div
                ref={imageRef}
                className={`relative transition-all duration-1200 delay-500 ${
                  imageVisible ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-12 scale-95'
                }`}
                style={{ transform: `translateY(${scrollY * 0.02}px)` }}
              >
                {aboutImageSrc && (
                  <div className="royal-image-container royal-image-primary relative aspect-[4/3] w-full min-h-[320px]">
                    <Image
                      src={aboutImageSrc}
                      alt={aboutImageAlt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutSection;
