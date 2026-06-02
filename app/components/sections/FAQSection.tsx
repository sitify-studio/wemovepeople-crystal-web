'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import type { Page } from '@/app/lib/types';
import { TiptapRenderer } from '@/app/components/ui/TiptapRenderer';
import { cn, SECTION_PY } from '@/app/lib/utils';
import { tiptapToText } from '@/app/lib/seo';
import { useScrollAnimation } from '@/app/hooks/useScrollAnimation';
import { useThemeColors, useThemeFonts } from '@/app/hooks/useTheme';

interface FAQSectionProps {
  faqSection?: Page['faqSection'];
  className?: string;
}

type FaqItem = {
  question: string;
  answer: string;
};

export const FAQSection: React.FC<FAQSectionProps> = ({ faqSection, className }) => {
  const themeColors = useThemeColors();
  const themeFonts = useThemeFonts();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const { ref: titleRef, isVisible: titleVisible } =
    useScrollAnimation<HTMLHeadingElement>({ threshold: 0.3 });
  const { ref: descriptionRef, isVisible: descriptionVisible } =
    useScrollAnimation<HTMLParagraphElement>({ threshold: 0.3 });

  const questions = useMemo<FaqItem[]>(() => {
    return (
      faqSection?.items
        ?.filter((item) => item?.question || item?.answer)
        .map((item) => ({
          question: tiptapToText(item.question),
          answer: tiptapToText(item.answer),
        }))
        .filter((item) => item.question || item.answer) ?? []
    );
  }, [faqSection?.items]);

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  if (!faqSection?.enabled) return null;
  if (questions.length === 0 && !faqSection.title && !faqSection.description) return null;

  return (
    <section
      ref={sectionRef}
      className={cn(SECTION_PY, 'relative overflow-hidden', className)}
      style={{
        backgroundColor: themeColors.pageBackground,
        color: themeColors.mainText,
        fontFamily: themeFonts.body,
      }}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle, ${themeColors.primaryButton}, transparent 70%)`,
          }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle, ${themeColors.hoverActive}, transparent 70%)`,
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div
              className={`transition-all duration-1000 ease-out ${
                titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              {faqSection.title && (
                <h2
                  ref={titleRef}
                  className="text-4xl md:text-5xl font-bold mb-4"
                  style={{ color: themeColors.mainText, fontFamily: themeFonts.heading }}
                >
                  <TiptapRenderer content={faqSection.title} as="inline" />
                </h2>
              )}
            </div>

            {faqSection.description && (
              <p
                ref={descriptionRef}
                className={`text-lg max-w-2xl mx-auto transition-all duration-1000 delay-200 ${
                  descriptionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ color: themeColors.secondaryText }}
              >
                <TiptapRenderer content={faqSection.description} as="inline" />
              </p>
            )}
          </div>

          {/* FAQ Questions */}
          <div className="space-y-4 mb-12">
            {questions.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={index}
                  className={`rounded-lg overflow-hidden transition-all duration-300 ${
                    isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                  style={{
                    transitionDelay: `${index * 0.1}s`,
                  }}
                >
                  <button
                    type="button"
                    className="w-full px-6 py-4 text-left flex justify-between items-center transition-all duration-300 shadow-lg"
                    onClick={() => toggleQuestion(index)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${index}`}
                    style={{
                      background: isOpen
                        ? `linear-gradient(135deg, ${themeColors.primaryButton}, ${themeColors.hoverActive})`
                        : themeColors.cardBackgroundDark,
                      color: '#ffffff',
                    }}
                    onMouseEnter={(e) => {
                      if (!isOpen) {
                        e.currentTarget.style.backgroundColor = themeColors.sectionBackgroundDark;
                        e.currentTarget.style.color = '#ffffff';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isOpen) {
                        e.currentTarget.style.background = themeColors.cardBackgroundDark;
                        e.currentTarget.style.color = '#ffffff';
                      }
                    }}
                  >
                    <span className="font-medium text-base pr-4">{faq.question}</span>
                    <div className="flex-shrink-0">
                      <svg
                        className={`w-5 h-5 transform transition-transform duration-300 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    </div>
                  </button>

                  <div
                    id={`faq-answer-${index}`}
                    className="overflow-hidden transition-all duration-500 ease-in-out"
                    style={{
                      maxHeight: isOpen ? '500px' : '0px',
                      opacity: isOpen ? 1 : 0,
                      backgroundColor: themeColors.cardBackgroundDark,
                    }}
                  >
                    <div
                      className="px-6 py-5 border-l-4"
                      style={{
                        borderColor: 'color-mix(in srgb, #ffffff 25%, transparent)',
                      }}
                    >
                      <p className="leading-relaxed text-white">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            style={{
              opacity: isLoaded ? 1 : 0,
              transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
              transition: 'opacity 0.8s ease, transform 0.8s ease',
              transitionDelay: '0.8s',
            }}
          >
            <Link
              href="/contact-us"
              className="px-8 py-3 font-medium rounded-lg transition-all duration-300 hover:shadow-lg"
              style={{
                color: '#ffffff',
                backgroundColor: themeColors.hoverActive,
                boxShadow: `0 4px 15px color-mix(in srgb, ${themeColors.hoverActive} 25%, transparent)`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 8px 25px color-mix(in srgb, ${themeColors.hoverActive} 35%, transparent)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `0 4px 15px color-mix(in srgb, ${themeColors.hoverActive} 25%, transparent)`;
              }}
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
