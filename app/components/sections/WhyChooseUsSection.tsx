'use client';

import { useEffect, useState, useMemo } from 'react';
import type { Page } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { TiptapRenderer } from '@/app/components/ui/TiptapRenderer';
import { cn, SECTION_PY } from '@/app/lib/utils';
import { tiptapToText } from '@/app/lib/seo';
import { useScrollAnimation, useStaggeredAnimation } from '@/app/hooks/useScrollAnimation';

interface WhyChooseUsSectionProps {
  whyChooseUsSection?: Page['whyChooseUsSection'];
  className?: string;
}

type HighlightItem = {
  name: string;
  description: string;
  titleContent?: unknown;
  descriptionContent?: unknown;
};

function isStatHighlight(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  if (trimmed.length > 14) return false;
  if (/[+%]/.test(trimmed)) return true;
  if (/^\d[\d.,]*\s*(k|m|\+|%|yrs?|years?)?$/i.test(trimmed)) return true;
  if (/^\d+\s*\/\s*\d+$/.test(trimmed)) return true;
  return /^[\d.,]+$/.test(trimmed);
}

export const WhyChooseUsSection: React.FC<WhyChooseUsSectionProps> = ({
  whyChooseUsSection,
  className,
}) => {
  const { site } = useWebBuilder();

  const theme = useMemo(
    () => {
      const t = site?.theme;
      return {
        primaryColor: t?.primaryButtonColorLight || t?.darkPrimaryColor || '#000000',
        secondaryColor: t?.darkSecondaryColor || t?.lightSecondaryColor || '#000000',
      };
    },
    [site?.theme]
  );

  const services = useMemo<HighlightItem[]>(() => {
    return (
      whyChooseUsSection?.items
        ?.map((item) => ({
          name: tiptapToText(item.title),
          description: tiptapToText(item.description),
          titleContent: item.title,
          descriptionContent: item.description,
        }))
        .filter((item) => item.name || item.description) ?? []
    );
  }, [whyChooseUsSection?.items]);

  const cardGridClass = useMemo(() => {
    const count = services.length;
    if (count <= 1) return 'grid-cols-1 max-w-md mx-auto';
    if (count === 2) return 'grid-cols-1 sm:grid-cols-2 max-w-4xl mx-auto';
    if (count === 3) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
  }, [services.length]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  
  const { ref: titleRef, isVisible: titleVisible } =
    useScrollAnimation<HTMLHeadingElement>({ threshold: 0.2 });
  const { ref: descRef, isVisible: descVisible } =
    useScrollAnimation<HTMLParagraphElement>({ threshold: 0.2 });
  const { ref: servicesRef, visibleItems } = useStaggeredAnimation(
    services.length,
    200
  );

  useEffect(() => {
    setIsLoaded(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
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

  // Helper function to format the display value
  const formatDisplayValue = (description: string) => {
    if (description.includes("+")) {
      return { value: description.replace("+", ""), suffix: "+" };
    }
    if (description.includes("%")) {
      return { value: description.replace("%", ""), suffix: "%" };
    }
    if (description.includes("/")) {
      return { value: description, suffix: "" };
    }
    return { value: description, suffix: "" };
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? 
      `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
      '0, 0, 0';
  };

  const styles = `
    @keyframes royal-float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      33% { transform: translateY(-12px) rotate(1deg); }
      66% { transform: translateY(-6px) rotate(-1deg); }
    }

    @keyframes fade-slide-up {
      from { 
        opacity: 0; 
        transform: translateY(50px); 
      }
      to { 
        opacity: 1; 
        transform: translateY(0); 
      }
    }
    
    @keyframes geometric-spin {
      0% { transform: rotateX(0deg) rotateY(0deg); }
      100% { transform: rotateX(360deg) rotateY(360deg); }
    }

    @keyframes organic-pulse {
      0%, 100% { 
        transform: scale(1) rotate(0deg);
        opacity: 0.3;
      }
      50% { 
        transform: scale(1.3) rotate(180deg);
        opacity: 0.7;
      }
    }

    @keyframes shimmer-flow {
      0% { transform: translateX(-100%) rotate(-45deg); }
      100% { transform: translateX(300%) rotate(-45deg); }
    }

    @keyframes depth-float {
      0%, 100% { 
        transform: translateZ(0px) rotateX(0deg) rotateY(0deg);
        filter: blur(0px);
      }
      50% { 
        transform: translateZ(30px) rotateX(8deg) rotateY(15deg);
        filter: blur(0.8px);
      }
    }

    @keyframes counter-rise {
      0% {
        opacity: 0;
        transform: translateY(30px) scale(0.8);
      }
      50% {
        transform: translateY(-5px) scale(1.05);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    /* Typography matching hero */
    .royal-section-title {
      font-size: clamp(2.5rem, 6vw, 4rem);
      font-weight: 300;
      line-height: 0.95;
      letter-spacing: -0.03em;
      color: #1a1a1a;
      font-family: 'serif', Georgia, 'Times New Roman', serif;
    }

    .royal-section-subtitle {
      font-size: clamp(0.9rem, 1.8vw, 1.1rem);
      font-weight: 400;
      letter-spacing: 0.08em;
      color: #666;
      text-transform: uppercase;
    }

    /* Card styling with royal aesthetics */
    .royal-service-card {
      background: rgba(255, 255, 255, 0.95);
      border: 1px solid rgba(var(--theme-primary-rgb), 0.08);
      border-radius: 24px;
      padding: 3rem 2rem;
      position: relative;
      overflow: hidden;
      backdrop-filter: blur(20px);
      transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
    }

    .royal-service-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, var(--theme-primary-color), var(--theme-secondary-color));
      opacity: 0;
      transition: opacity 0.6s ease;
    }

    .royal-service-card:hover {
      transform: translateY(-8px) rotateX(2deg);
      box-shadow: 0 20px 60px rgba(var(--theme-primary-rgb), 0.15);
      border-color: rgba(var(--theme-primary-rgb), 0.2);
    }

    .royal-service-card:hover::before {
      opacity: 1;
    }

    /* 3D Number display */
    .royal-number-display {
      width: 120px;
      height: 120px;
      margin: 0 auto 2rem;
      position: relative;
      transform-style: preserve-3d;
      transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1);
    }

    .royal-number-display:hover {
      transform: rotateY(15deg) rotateX(-10deg);
    }

    .royal-number-circle {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
      background: linear-gradient(135deg, var(--theme-primary-color), var(--theme-secondary-color));
      box-shadow: 
        0 12px 40px rgba(var(--theme-primary-rgb), 0.3),
        inset 0 2px 8px rgba(255, 255, 255, 0.2);
    }

    .royal-number-circle::before {
      content: '';
      position: absolute;
      inset: 4px;
      border-radius: 50%;
      border: 1px solid rgba(255, 255, 255, 0.25);
      background: linear-gradient(135deg, 
        rgba(255, 255, 255, 0.1) 0%, 
        rgba(255, 255, 255, 0.05) 50%,
        transparent 100%);
    }

    .number-value {
      font-size: 2.25rem;
      font-weight: 300;
      font-family: 'serif', Georgia, serif;
      line-height: 1;
    }

    .number-suffix {
      font-size: 1rem;
      font-weight: 400;
      opacity: 0.9;
      margin-top: -4px;
    }

    /* Organic shapes */
    .organic-shape {
      border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
      animation: organic-pulse 12s ease-in-out infinite;
    }

    /* 3D Geometric elements */
    .geometric-3d {
      transform-style: preserve-3d;
      animation: geometric-spin 30s linear infinite;
    }

    .depth-element {
      animation: depth-float 8s ease-in-out infinite;
    }

    /* Split content background matching hero */
    .split-content {
      background: linear-gradient(135deg, 
        rgba(var(--theme-primary-rgb), 0.02) 0%, 
        rgba(var(--theme-secondary-rgb), 0.02) 100%);
      backdrop-filter: blur(20px);
    }

    .parallax-element {
      will-change: transform;
    }

    .royal-accent {
      background: linear-gradient(45deg, var(--theme-primary-color), var(--theme-secondary-color));
      background-size: 200% 200%;
      animation: shimmer-flow 5s ease-in-out infinite;
    }

    .shimmer-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        45deg,
        transparent 30%,
        rgba(255, 255, 255, 0.1) 50%,
        transparent 70%
      );
      transform: translateX(-100%) rotate(-45deg);
      animation: shimmer-flow 4s ease-in-out infinite;
      animation-delay: 1s;
    }

    .floating-element {
      animation: royal-float 8s ease-in-out infinite;
    }

    .fade-slide-animation {
      animation: fade-slide-up 1s ease-out forwards;
    }

    .counter-animation {
      animation: counter-rise 1.2s cubic-bezier(0.23, 1, 0.32, 1) forwards;
    }

    /* Service title styling */
    .service-title {
      font-size: 1.25rem;
      font-weight: 500;
      line-height: 1.3;
      letter-spacing: 0.01em;
      background: linear-gradient(135deg, var(--theme-primary-color), var(--theme-secondary-color));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .card-glow-blob {
      position: absolute;
      top: 12%;
      left: 50%;
      transform: translateX(-50%);
      width: 200px;
      height: 200px;
      border-radius: 50%;
      background: radial-gradient(
        circle,
        rgba(var(--theme-primary-rgb), 0.28) 0%,
        rgba(var(--theme-secondary-rgb), 0.12) 45%,
        transparent 72%
      );
      filter: blur(32px);
      pointer-events: none;
      z-index: 0;
    }

    .card-content-body {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      min-height: 220px;
      gap: 1rem;
      padding-top: 1rem;
    }

    .card-description {
      font-size: 0.95rem;
      line-height: 1.65;
      color: #5c5c5c;
      text-align: center;
      max-width: 100%;
    }

    .royal-service-card--content {
      padding: 2rem 1.75rem 2.25rem;
      text-align: center;
    }
  `;

  if (!whyChooseUsSection?.enabled) return null;
  if (
    services.length === 0 &&
    !whyChooseUsSection.title &&
    !whyChooseUsSection.description
  ) {
    return null;
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      
      <section
        id="service-highlights"
        className={cn('relative overflow-hidden bg-white', SECTION_PY, className)}
        style={{
          '--theme-primary-color': theme.primaryColor,
          '--theme-secondary-color': theme.secondaryColor,
          '--theme-primary-rgb': hexToRgb(theme.primaryColor),
          '--theme-secondary-rgb': hexToRgb(theme.secondaryColor),
        } as React.CSSProperties}
      >
        {/* Royal Background with Parallax - matching hero */}
        <div className="absolute inset-0 split-content">
          {/* Organic floating shapes */}
          <div 
            className="absolute top-32 right-1/4 w-96 h-96 organic-shape opacity-4"
            style={{
              background: `radial-gradient(circle, ${theme.primaryColor}15, transparent 70%)`,
              transform: `translate(${mousePosition.x * 0.2}px, ${mousePosition.y * 0.2}px) translateY(${scrollY * 0.08}px)`
            }}
          />
          
          <div 
            className="absolute bottom-40 left-1/5 w-80 h-80 organic-shape opacity-3"
            style={{
              background: `radial-gradient(ellipse, ${theme.secondaryColor}20, transparent 60%)`,
              transform: `translate(${-mousePosition.x * 0.15}px, ${-mousePosition.y * 0.15}px) translateY(${scrollY * 0.05}px)`,
              animationDelay: '3s'
            }}
          />

          {/* 3D Geometric Elements */}
          <div 
            className="absolute top-1/4 left-1/6 parallax-element"
            style={{ transform: `translateY(${scrollY * 0.15}px) translateX(${mousePosition.x * 0.08}px)` }}
          >
            <div className="geometric-3d opacity-6">
              <svg width="100" height="100" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="serviceGeometric1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: theme.primaryColor, stopOpacity: 0.4 }} />
                    <stop offset="100%" style={{ stopColor: theme.secondaryColor, stopOpacity: 0.2 }} />
                  </linearGradient>
                </defs>
                <polygon 
                  points="50,5 85,35 70,75 30,75 15,35" 
                  fill="url(#serviceGeometric1)" 
                  stroke={theme.primaryColor} 
                  strokeWidth="1" 
                  opacity="0.5"
                />
                <circle cx="50" cy="40" r="12" fill="none" stroke={theme.secondaryColor} strokeWidth="1" opacity="0.6" />
              </svg>
            </div>
          </div>
          
          <div 
            className="absolute bottom-1/3 right-1/4 parallax-element"
            style={{ transform: `translateY(${scrollY * -0.12}px) translateX(${-mousePosition.x * 0.12}px)` }}
          >
            <div className="depth-element opacity-5">
              <svg width="90" height="90" viewBox="0 0 90 90">
                <rect 
                  x="15" y="15" width="60" height="60" 
                  fill="none" 
                  stroke={theme.primaryColor} 
                  strokeWidth="1.5" 
                  opacity="0.4"
                  transform="rotate(30 45 45)"
                />
                <circle cx="45" cy="45" r="30" fill="none" stroke={theme.secondaryColor} strokeWidth="1" opacity="0.3" />
                <circle cx="45" cy="45" r="15" fill={theme.primaryColor} opacity="0.1" />
            </svg>
            </div>
          </div>

          {/* Elegant floating accents matching hero */}
          <div 
            className="absolute top-1/3 left-12 w-2 h-32 royal-accent opacity-25 parallax-element"
            style={{ 
              transform: `translateY(${scrollY * 0.25}px) rotate(${mousePosition.x * 0.08}deg)`,
              borderRadius: '50px'
            }}
          />
          
          <div 
            className="absolute bottom-1/4 right-20 w-3 h-24 royal-accent opacity-20 parallax-element"
            style={{ 
              transform: `translateY(${scrollY * -0.18}px) rotate(${-mousePosition.y * 0.08}deg)`,
              borderRadius: '50px',
              animationDelay: '1s'
            }}
          />

          {/* Scattered organic dots */}
          <div 
            className="absolute top-1/2 left-1/4 w-4 h-4 rounded-full floating-element opacity-6"
            style={{ 
              backgroundColor: `${theme.primaryColor}50`,
              animationDelay: '2s'
            }}
          />
          <div 
            className="absolute top-1/4 right-1/3 w-3 h-3 rounded-full floating-element opacity-5"
            style={{ 
              backgroundColor: `${theme.secondaryColor}60`,
              animationDelay: '4s'
            }}
          />
        </div>

        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          {/* Header Section with royal styling */}
          <div className="text-center mb-20 space-y-8">
            
            {/* Subtle icon indicator */}
            <div 
              className={`inline-block transition-all duration-1200 ${
                isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
              }`}
            >
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto floating-element"
                style={{
                  background: `linear-gradient(135deg, ${theme.primaryColor}10, ${theme.secondaryColor}10)`,
                  border: `1px solid ${theme.primaryColor}20`
                }}
              >
                <svg className="w-7 h-7" style={{ color: theme.primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              </div>
            </div>
            
            {/* Royal title */}
            <div>
            {whyChooseUsSection?.title && (
            <h2
              ref={titleRef}
                className={`royal-section-title fade-slide-animation mb-4 transition-all duration-1200 ${
                titleVisible
                  ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-12"
              }`}
                style={{ 
                  animationDelay: '0.2s',
                  transform: `translateY(${scrollY * 0.05}px)`
                }}
            >
              <TiptapRenderer content={whyChooseUsSection.title} as="inline" />
            </h2>
            )}
            
              {/* Elegant divider */}
              <div className="flex items-center justify-center mt-6">
              <div 
                  className={`h-px transition-all duration-1000 delay-500 ${
                    titleVisible ? 'w-24 opacity-50' : 'w-0 opacity-0'
                }`}
                style={{
                    background: `linear-gradient(90deg, transparent, ${theme.primaryColor}, ${theme.secondaryColor}, transparent)`
                }}
              />
              </div>
            </div>
            
            {/* Subtitle */}
            {whyChooseUsSection?.description && (
            <p
              ref={descRef}
              className={`royal-section-subtitle fade-slide-animation max-w-2xl mx-auto transition-all duration-1200 delay-400 ${
                descVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ 
                animationDelay: '0.4s',
                transform: `translateY(${scrollY * 0.03}px)`
              }}
            >
              <TiptapRenderer content={whyChooseUsSection.description} as="inline" />
            </p>
            )}
          </div>

          {/* Service Cards Grid with royal design */}
          <div
            ref={servicesRef}
            className={cn('grid gap-8 lg:gap-10', cardGridClass)}
          >
            {services && services.length > 0 ? services.map((service, index) => {
              const showStat = isStatHighlight(service.description);
              const { value, suffix } = showStat
                ? formatDisplayValue(service.description)
                : { value: '', suffix: '' };

              return (
                <div
                  key={`service-${index}`}
                  className={`fade-slide-animation transition-all duration-1000 ${
                    visibleItems.includes(index)
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-12"
                  }`}
                  style={{ 
                    animationDelay: `${0.6 + index * 0.15}s`,
                    transform: `translateY(${scrollY * 0.02}px)`
                  }}
                >
                  <div
                    className={cn(
                      'royal-service-card text-center group',
                      !showStat && 'royal-service-card--content'
                    )}
                  >
                    <div className="shimmer-overlay" />

                    {showStat ? (
                      <>
                        <div className="royal-number-display floating-element">
                          <div className="royal-number-circle">
                            <span className="number-value counter-animation">{value}</span>
                            {suffix && <span className="number-suffix">{suffix}</span>}
                          </div>
                        </div>
                        {service.name && (
                          <h3 className="service-title mb-6">{service.name}</h3>
                        )}
                      </>
                    ) : (
                      <div className="card-content-body">
                        <div className="card-glow-blob" aria-hidden />
                        {service.description && (
                          <div className="card-description">
                            {service.descriptionContent &&
                            typeof service.descriptionContent === 'object' ? (
                              <TiptapRenderer
                                content={service.descriptionContent}
                                as="inline"
                              />
                            ) : (
                              service.description
                            )}
                          </div>
                        )}
                        {service.name && (
                          <h3 className="service-title mb-0">
                            {service.titleContent && typeof service.titleContent === 'object' ? (
                              <TiptapRenderer content={service.titleContent} as="inline" />
                            ) : (
                              service.name
                            )}
                          </h3>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-center space-x-3 opacity-60 mt-6">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: theme.primaryColor }}
                      />
                      <div
                        className="w-12 h-px"
                        style={{
                          background: `linear-gradient(90deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
                        }}
                      />
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: theme.secondaryColor }}
                      />
                    </div>

                    <div
                      className="absolute top-6 right-6 w-2 h-2 rounded-full floating-element opacity-40"
                      style={{
                        backgroundColor: theme.primaryColor,
                        animationDelay: `${index * 0.7}s`,
                      }}
                    />
                  </div>
                </div>
              );
            }) : (
              <div className="col-span-full">
                <div className="royal-service-card max-w-md mx-auto text-center">
                  <div 
                    className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                    style={{ 
                      background: `linear-gradient(135deg, ${theme.primaryColor}15, ${theme.secondaryColor}15)` 
                    }}
                  >
                    <svg className="w-10 h-10" style={{ color: theme.primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <p className="text-gray-600">No service highlights available</p>
                </div>
              </div>
            )}
          </div>

          {/* Royal bottom accent */}
          <div className="text-center mt-24">
            <div className="inline-flex items-center space-x-8 px-8 py-6 bg-white/80 backdrop-blur-20 border border-gray-100/50 rounded-full shadow-lg">
              <div 
                className="w-20 h-px floating-element opacity-60"
                style={{
                  background: `linear-gradient(90deg, transparent, ${theme.primaryColor}, transparent)`,
                  animationDelay: '0s'
                }}
              />
              <div className="flex items-center space-x-4">
                <div 
                  className="w-2 h-2 rounded-full floating-element"
                  style={{ 
                    backgroundColor: theme.primaryColor,
                    animationDelay: '1s'
                  }}
                />
                <span 
                  className="text-lg font-light tracking-wide"
                  style={{ 
                    background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  Excellence in Every Detail
                </span>
                <div 
                  className="w-2 h-2 rounded-full floating-element"
                  style={{ 
                    backgroundColor: theme.secondaryColor,
                    animationDelay: '2s'
                  }}
                />
              </div>
              <div 
                className="w-20 h-px floating-element opacity-60"
                style={{
                  background: `linear-gradient(90deg, transparent, ${theme.secondaryColor}, transparent)`,
                  animationDelay: '0.5s'
                }}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default WhyChooseUsSection;