'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import type { Page } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { TiptapRenderer } from '@/app/components/ui/TiptapRenderer';
import { cn, getImageSrc } from '@/app/lib/utils';
import { tiptapToText } from '@/app/lib/seo';
import { useScrollAnimation } from '@/app/hooks/useScrollAnimation';

interface CompanyDetailSectionProps {
  companyDetailSection?: Page['companyDetailSection'];
  className?: string;
}

type DetailCard = {
  heading: string;
  description: string;
  titleContent?: unknown;
  descriptionContent?: unknown;
  imageUrl?: string;
  imageAlt?: string;
  href?: string;
};

function normalizeHref(href: string): string {
  const t = href.trim();
  if (t.startsWith('http') || t.startsWith('mailto:') || t.startsWith('tel:')) return t;
  return t.startsWith('/') ? t : `/${t}`;
}

export const CompanyDetailSection: React.FC<CompanyDetailSectionProps> = ({
  companyDetailSection,
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

  const sections = useMemo<DetailCard[]>(() => {
    return (
      companyDetailSection?.details
        ?.map((detail) => {
          const raw = detail as {
            href?: string;
            url?: string;
            link?: string;
          };
          const link = raw.href || raw.url || raw.link;
          return {
            heading: tiptapToText(detail.title) || tiptapToText(detail.label) || '',
            description: tiptapToText(detail.description) || tiptapToText(detail.value) || '',
            titleContent: detail.title ?? detail.label,
            descriptionContent: detail.description ?? detail.value,
            imageUrl: detail.image?.url ? getImageSrc(detail.image.url) : undefined,
            imageAlt: detail.image?.altText,
            href: typeof link === 'string' && link.trim() ? link.trim() : undefined,
          };
        })
        .filter((item) => item.heading || item.description) ?? []
    );
  }, [companyDetailSection?.details]);

  const { ref: titleRef, isVisible: titleVisible } =
    useScrollAnimation<HTMLHeadingElement>({ threshold: 0.15 });
  const { ref: descRef, isVisible: descVisible } =
    useScrollAnimation<HTMLParagraphElement>({ threshold: 0.15 });

  if (!companyDetailSection?.enabled) return null;
  if (
    sections.length === 0 &&
    !companyDetailSection.title &&
    !companyDetailSection.description
  ) {
    return null;
  }

  return (
    <section
      id="company-detail"
      className={cn(
        'relative overflow-hidden bg-[#f8f6f4] py-16 sm:py-20 md:py-24 lg:py-28',
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute -left-20 top-0 h-[28rem] w-[28rem] rounded-full blur-3xl opacity-70"
          style={{
            background: `radial-gradient(circle, ${theme.primaryColor}18, transparent 65%)`,
          }}
        />
        <div
          className="absolute bottom-0 right-0 h-80 w-80 rounded-full blur-3xl opacity-60"
          style={{
            background: `radial-gradient(circle, ${theme.secondaryColor}14, transparent 70%)`,
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <header className="lg:col-span-4 lg:sticky lg:top-28 lg:self-start">
            <div className="mb-5 flex items-center gap-3">
              <span
                className="h-px w-10 shrink-0"
                style={{
                  background: `linear-gradient(90deg, ${theme.primaryColor}, transparent)`,
                }}
              />
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">
                Our Expertise
              </span>
            </div>

            {companyDetailSection.title && (
              <h2
                ref={titleRef}
                className={cn(
                  'text-3xl font-light leading-tight tracking-tight text-gray-900 transition-all duration-700 sm:text-4xl',
                  titleVisible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
                )}
                style={{ fontFamily: 'Georgia, serif' }}
              >
                <TiptapRenderer content={companyDetailSection.title} as="inline" />
              </h2>
            )}

            {companyDetailSection.description && (
              <p
                ref={descRef}
                className={cn(
                  'mt-5 text-base leading-relaxed text-gray-600 transition-all duration-700 delay-100 sm:text-lg',
                  descVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                )}
              >
                <TiptapRenderer content={companyDetailSection.description} as="inline" />
              </p>
            )}

            <div
              className="mt-8 hidden h-24 w-px lg:block"
              style={{
                background: `linear-gradient(180deg, ${theme.primaryColor}55, transparent)`,
              }}
            />
          </header>

          {sections.length > 0 && (
            <div className="space-y-6 lg:col-span-8 lg:space-y-8">
              {sections.map((item, index) => (
                <DetailRow
                  key={`company-detail-${index}`}
                  item={item}
                  index={index}
                  theme={theme}
                  ctaHref={item.href ? normalizeHref(item.href) : '/services'}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

function DetailRow({
  item,
  index,
  theme,
  ctaHref,
}: {
  item: DetailCard;
  index: number;
  theme: { primaryColor: string; secondaryColor: string };
  ctaHref: string;
}) {
  const { ref, isVisible } = useScrollAnimation<HTMLElement>({ threshold: 0.12 });
  const isReversed = index % 2 === 1;
  const indexLabel = String(index + 1).padStart(2, '0');

  const card = (
    <article
      ref={ref}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm transition-all duration-500 hover:shadow-lg md:min-h-[280px] md:flex-row',
        isReversed && 'md:flex-row-reverse',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      )}
    >
      <div
        className="pointer-events-none absolute left-0 top-0 z-10 hidden h-full w-1 md:block"
        style={{
          background: `linear-gradient(180deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
        }}
      />

      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-gray-100 md:aspect-auto md:w-[42%]">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.imageAlt || item.heading}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, 42vw"
          />
        ) : (
          <div
            className="flex h-full min-h-[200px] items-center justify-center md:min-h-full"
            style={{
              background: `linear-gradient(135deg, ${theme.primaryColor}12, ${theme.secondaryColor}10)`,
            }}
          >
            <span className="text-5xl opacity-40" aria-hidden>
              🏗️
            </span>
          </div>
        )}
        <div
          className="absolute inset-0 opacity-0 transition-opacity duration-400 group-hover:opacity-100"
          style={{
            background: `linear-gradient(135deg, ${theme.primaryColor}88, ${theme.secondaryColor}77)`,
          }}
        />
        <span
          className="absolute bottom-4 left-4 font-mono text-4xl font-light text-white/90 drop-shadow-sm md:text-5xl"
          aria-hidden
        >
          {indexLabel}
        </span>
      </div>

      <div className="relative flex flex-1 flex-col justify-center gap-4 p-6 sm:p-8 md:p-10">
        <span
          className="text-xs font-semibold uppercase tracking-[0.2em]"
          style={{ color: theme.primaryColor }}
        >
          {indexLabel}
        </span>

        {item.heading && (
          <h3
            className="text-xl font-semibold leading-snug text-gray-900 sm:text-2xl"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            {item.titleContent && typeof item.titleContent === 'object' ? (
              <TiptapRenderer content={item.titleContent} as="inline" />
            ) : (
              item.heading
            )}
          </h3>
        )}

        {item.description && (
          <div className="max-w-xl text-sm leading-relaxed text-gray-600 sm:text-base">
            {item.descriptionContent && typeof item.descriptionContent === 'object' ? (
              <TiptapRenderer content={item.descriptionContent} as="inline" />
            ) : (
              item.description
            )}
          </div>
        )}

        <span
          className="mt-2 inline-flex w-fit items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] transition-colors duration-300"
          style={{ color: theme.primaryColor }}
        >
          Explore
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </article>
  );

  return (
    <Link href={ctaHref} className="block">
      {card}
    </Link>
  );
}

export default CompanyDetailSection;
