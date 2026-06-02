'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Page } from '@/app/lib/types';
import { TiptapRenderer } from '@/app/components/ui/TiptapRenderer';
import { getImageSrc, cn, SECTION_PY } from '@/app/lib/utils';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { hasFooterDescriptionContent } from '@/app/lib/siteContent';

type BlogSectionInput = NonNullable<Page['blogSection']> & {
  heading?: unknown;
  subtitle?: unknown;
};

function pickSectionField(
  section: BlogSectionInput | undefined,
  primary: 'title' | 'description'
): unknown {
  if (!section) return undefined;
  const alt = primary === 'title' ? section.heading : section.subtitle;
  const value = section[primary] ?? alt;
  if (value == null || value === '') return undefined;
  return value;
}

function resolvePostImageRaw(post: {
  featuredImage?: unknown;
  seo?: { ogImageUrl?: string };
}): string | undefined {
  const img = post?.featuredImage;
  if (typeof img === 'string' && img.trim()) return img;
  if (img && typeof img === 'object' && (img as { url?: string }).url) {
    return (img as { url: string }).url;
  }
  if (post?.seo?.ogImageUrl) return post.seo.ogImageUrl;
  return undefined;
}

function getPostImageSrc(post: {
  featuredImage?: unknown;
  seo?: { ogImageUrl?: string };
}): string {
  const raw = resolvePostImageRaw(post);
  return raw ? getImageSrc(raw) : '';
}

function getPostImageAlt(post: { featuredImage?: unknown; title?: string }): string {
  const img = post?.featuredImage;
  if (img && typeof img === 'object' && (img as { altText?: string }).altText) {
    return (img as { altText: string }).altText;
  }
  return post?.title || '';
}

function formatPostDate(iso: string | undefined, show: boolean): string | null {
  if (!show || !iso) return null;
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return null;
  }
}

interface BlogSectionProps {
  blogSection?: Page['blogSection'];
  className?: string;
}

type BlogPostItem = {
  _id: string;
  slug: string;
  title?: string;
  excerpt?: unknown;
  publishedAt?: string;
  createdAt?: string;
  author?: { name?: string };
  categories?: string[];
  featuredImage?: unknown;
  seo?: { ogImageUrl?: string };
};

export const BlogSection: React.FC<BlogSectionProps> = ({ blogSection, className }) => {
  const { blogPosts, loading, site, pages } = useWebBuilder();

  const sectionData = useMemo(() => {
    const fallback = pages.find((p) => p.pageType === 'blog-list')?.blogSection as
      | BlogSectionInput
      | undefined;
    const current = blogSection as BlogSectionInput | undefined;
    if (!current && !fallback) return undefined;

    return {
      enabled: current?.enabled ?? fallback?.enabled ?? true,
      postsToShow: current?.postsToShow ?? fallback?.postsToShow ?? 3,
      showExcerpt: current?.showExcerpt ?? fallback?.showExcerpt ?? true,
      showDate: current?.showDate ?? fallback?.showDate ?? true,
      title: pickSectionField(current, 'title') ?? pickSectionField(fallback, 'title'),
      description:
        pickSectionField(current, 'description') ??
        pickSectionField(fallback, 'description'),
    };
  }, [blogSection, pages]);

  const titleContent = sectionData?.title;
  const descriptionContent = sectionData?.description;
  const hasTitle = hasFooterDescriptionContent(titleContent);
  const hasDescription = hasFooterDescriptionContent(descriptionContent);

  const theme = useMemo(() => {
    const t = site?.theme;
    return {
      primaryColor: t?.primaryButtonColorLight || t?.darkPrimaryColor || '#7c4a35',
      secondaryColor: t?.darkSecondaryColor || t?.lightSecondaryColor || '#1E40AF',
    };
  }, [site?.theme]);

  if (!sectionData?.enabled) return null;

  const count = Math.min(Math.max(sectionData.postsToShow || 3, 1), 12);
  const displayPosts = blogPosts.slice(0, count);
  const showExcerpt = Boolean(sectionData.showExcerpt);
  const showDate = Boolean(sectionData.showDate);

  if (loading && blogPosts.length === 0) return null;

  if (displayPosts.length === 0 && !hasTitle && !hasDescription) {
    return null;
  }

  const [featured, ...morePosts] = displayPosts as BlogPostItem[];

  return (
    <section
      id="blog"
      className={cn('relative overflow-hidden bg-white', SECTION_PY, className)}
    >
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-0 top-1/3 h-96 w-96 rounded-full blur-3xl opacity-50"
          style={{
            background: `radial-gradient(circle, ${theme.secondaryColor}10, transparent 70%)`,
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center md:mb-16">
          <div className="mb-6 flex items-center justify-center gap-4 text-gray-600/80">
            <span className="text-xs font-medium uppercase tracking-[0.2em]">Latest Insights</span>
            <span
              className="h-px w-16 sm:w-24"
              style={{
                background: `linear-gradient(90deg, transparent, ${theme.primaryColor}, transparent)`,
              }}
            />
          </div>

          {hasTitle && (
            <h2
              className="mx-auto max-w-3xl text-3xl font-light tracking-tight text-gray-900 sm:text-4xl md:text-5xl"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              <TiptapRenderer content={titleContent} as="inline" />
            </h2>
          )}

          {hasDescription && (
            <div className="mx-auto mt-6 max-w-2xl text-base text-gray-600 sm:text-lg">
              <TiptapRenderer content={descriptionContent} as="inline" />
            </div>
          )}

          <div className="mt-8 flex justify-center">
            <Link
              href="/blog"
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
              View All Articles
            </Link>
          </div>
        </div>

        {displayPosts.length === 0 ? (
          <p className="text-center text-sm text-gray-500">
            No published posts yet. Add posts in the builder to show them here.
          </p>
        ) : (
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
            {featured && (
              <FeaturedPostCard
                post={featured}
                showExcerpt={showExcerpt}
                showDate={showDate}
                theme={theme}
                className="lg:col-span-7"
              />
            )}

            {morePosts.length > 0 && (
              <div className="lg:col-span-5">
                <p
                  className="mb-6 text-xs font-semibold uppercase tracking-[0.2em]"
                  style={{ color: theme.primaryColor }}
                >
                  More Articles
                </p>
                <ul className="space-y-4">
                  {morePosts.map((post) => (
                    <li key={post._id}>
                      <MorePostCard post={post} showDate={showDate} theme={theme} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

function PostMeta({
  post,
  showDate,
  theme,
  className,
}: {
  post: BlogPostItem;
  showDate: boolean;
  theme: { primaryColor: string; secondaryColor: string };
  className?: string;
}) {
  const dateLabel = formatPostDate(post.publishedAt || post.createdAt, showDate);
  const author = post.author?.name?.trim();
  const category = post.categories?.[0];

  return (
    <div className={cn('flex flex-wrap items-center gap-2 text-xs uppercase tracking-wider text-gray-500', className)}>
      {category && (
        <span
          className="rounded-full border px-2.5 py-0.5 font-medium"
          style={{ borderColor: `${theme.primaryColor}30`, color: theme.primaryColor }}
        >
          {category}
        </span>
      )}
      {author && <span>By {author}</span>}
      {dateLabel && <span>{dateLabel}</span>}
    </div>
  );
}

function FeaturedPostCard({
  post,
  showExcerpt,
  showDate,
  theme,
  className,
}: {
  post: BlogPostItem;
  showExcerpt: boolean;
  showDate: boolean;
  theme: { primaryColor: string; secondaryColor: string };
  className?: string;
}) {
  const imgSrc = getPostImageSrc(post);

  return (
    <article
      className={cn(
        'group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md',
        className
      )}
    >
      <Link href={`/blog/${post.slug}`} className="block no-underline">
        <div className="relative aspect-[16/10] overflow-hidden bg-gray-50">
          {imgSrc ? (
            <Image
              src={imgSrc}
              alt={getPostImageAlt(post)}
              fill
              sizes="(max-width: 1024px) 100vw, 58vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center text-4xl text-gray-300">📰</div>
          )}
        </div>

        <div className="space-y-3 p-6">
          <PostMeta post={post} showDate={showDate} theme={theme} />
          {post.title && (
            <h3
              className="text-2xl font-semibold text-gray-900 md:text-3xl"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              {post.title}
            </h3>
          )}
          {showExcerpt && Boolean(post.excerpt) && (
            <div className="line-clamp-3 text-sm leading-relaxed text-gray-600">
              <TiptapRenderer content={post.excerpt} as="inline" />
            </div>
          )}
          <span
            className="inline-block text-xs font-semibold uppercase tracking-[0.2em]"
            style={{ color: theme.primaryColor }}
          >
            Read Article →
          </span>
        </div>
      </Link>
    </article>
  );
}

function MorePostCard({
  post,
  showDate,
  theme,
}: {
  post: BlogPostItem;
  showDate: boolean;
  theme: { primaryColor: string; secondaryColor: string };
}) {
  const imgSrc = getPostImageSrc(post);

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex gap-4 overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md no-underline"
    >
      <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-50 sm:h-24 sm:w-28">
        {imgSrc ? (
          <Image
            src={imgSrc}
            alt={getPostImageAlt(post)}
            fill
            sizes="112px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-2xl text-gray-300">📰</div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <PostMeta post={post} showDate={showDate} theme={theme} className="mb-2" />
        {post.title && (
          <h4 className="text-base font-semibold text-gray-900 sm:text-lg" style={{ fontFamily: 'Georgia, serif' }}>
            {post.title}
          </h4>
        )}
        <span className="mt-2 inline-block text-xs font-semibold uppercase tracking-wider opacity-0 transition-opacity group-hover:opacity-100" style={{ color: theme.primaryColor }}>
          Read →
        </span>
      </div>
    </Link>
  );
}

export default BlogSection;
