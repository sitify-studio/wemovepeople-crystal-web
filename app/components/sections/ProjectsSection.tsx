'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Page, Project } from '@/app/lib/types';
import { TiptapRenderer } from '@/app/components/ui/TiptapRenderer';
import { cn, getImageSrc } from '@/app/lib/utils';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { useScrollAnimation } from '@/app/hooks/useScrollAnimation';
import { tiptapToText } from '@/app/lib/seo';

interface ProjectsSectionProps {
  projectSection?: Page['projectSection'];
  projectsSection?: Page['projectsSection'];
  className?: string;
  showViewAllLink?: boolean;
  projectsLimit?: number;
}

type ManualProject = NonNullable<NonNullable<Page['projectsSection']>['projects']>[number];
type DisplayItem = Project | ManualProject;

type ProjectSectionInput = Page['projectSection'] & {
  heading?: unknown;
  subtitle?: unknown;
};

function pickSectionField(
  section: ProjectSectionInput | undefined,
  primary: 'title' | 'description'
): unknown {
  if (!section) return undefined;
  const alt = primary === 'title' ? section.heading : section.subtitle;
  const value = section[primary] ?? alt;
  if (value == null || value === '') return undefined;
  return value;
}

function hasTiptapContent(content: unknown): boolean {
  if (content == null || content === '') return false;
  if (typeof content === 'object') return Boolean(tiptapToText(content));
  return Boolean(String(content).trim());
}

function isProjectEntity(p: DisplayItem): p is Project {
  return typeof (p as Project)._id === 'string' && typeof (p as Project).slug === 'string';
}

function projectHref(p: DisplayItem): string {
  if (isProjectEntity(p)) return `/project-detail/${p.slug}`;
  const href = (p as ManualProject).href;
  return typeof href === 'string' && href.length > 0 ? href : '';
}

function projectTitle(p: DisplayItem): React.ReactNode {
  if (isProjectEntity(p)) return p.title;
  const t = (p as ManualProject).title;
  if (typeof t === 'string') return t;
  if (t) return <TiptapRenderer content={t} as="inline" />;
  return null;
}

function projectDescription(p: DisplayItem): React.ReactNode {
  if (isProjectEntity(p)) return p.shortDescription || p.description;
  return (p as ManualProject).description;
}

function projectImageUrl(p: DisplayItem): string | null {
  if (isProjectEntity(p)) return getImageSrc(p.featuredImage?.url || p.featuredImage);
  const img = (p as ManualProject).image;
  return img?.url ? getImageSrc(img.url) : null;
}

function projectYear(p: DisplayItem): string | null {
  if (!isProjectEntity(p)) return null;
  const raw = p.date || p.publishedAt;
  if (!raw) return null;
  try {
    return String(new Date(raw).getFullYear());
  } catch {
    return null;
  }
}

function normalizeHref(href: string): string {
  const t = href.trim();
  if (t.startsWith('http') || t.startsWith('mailto:') || t.startsWith('tel:')) return t;
  return t.startsWith('/') ? t : `/${t}`;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  projectSection,
  projectsSection,
  className,
  showViewAllLink = true,
  projectsLimit,
}) => {
  const { site, projects, pages } = useWebBuilder();

  const sectionData = useMemo(() => {
    const projectDetailPage = pages.find((p) => p.pageType === 'project-detail');
    const metaSource =
      (projectSection as ProjectSectionInput | undefined) ??
      (projectDetailPage?.projectSection as ProjectSectionInput | undefined);
    const listingSource = projectsSection ?? projectDetailPage?.projectsSection;

    return {
      enabled:
        metaSource?.enabled ??
        listingSource?.enabled ??
        true,
      title:
        pickSectionField(metaSource, 'title') ??
        pickSectionField(listingSource as ProjectSectionInput | undefined, 'title'),
      description:
        pickSectionField(metaSource, 'description') ??
        pickSectionField(listingSource as ProjectSectionInput | undefined, 'description'),
      projectIds: listingSource?.projectIds,
      manualProjects: listingSource?.projects ?? [],
    };
  }, [projectSection, projectsSection, pages]);

  const titleContent = sectionData.title;
  const descriptionContent = sectionData.description;
  const hasTitle = hasTiptapContent(titleContent);
  const hasDescription = hasTiptapContent(descriptionContent);

  const theme = useMemo(() => {
    const t = site?.theme;
    return {
      primaryColor: t?.primaryButtonColorLight || t?.darkPrimaryColor || '#7c4a35',
      secondaryColor: t?.darkSecondaryColor || t?.lightSecondaryColor || '#1E40AF',
    };
  }, [site?.theme]);

  const display = useMemo<DisplayItem[]>(() => {
    const manual = sectionData.manualProjects;
    const fromApi = (projects ?? []).filter((p) =>
      sectionData.projectIds?.length
        ? sectionData.projectIds.includes(p._id)
        : p.status === 'published'
    );

    const items = manual.length > 0 ? manual : fromApi;
    if (typeof projectsLimit === 'number' && projectsLimit > 0) {
      return items.slice(0, projectsLimit);
    }
    return items;
  }, [sectionData, projects, projectsLimit]);

  const { ref: titleRef, isVisible: titleVisible } =
    useScrollAnimation<HTMLHeadingElement>({ threshold: 0.2 });
  const { ref: descRef, isVisible: descVisible } =
    useScrollAnimation<HTMLDivElement>({ threshold: 0.2 });

  if (!sectionData.enabled) return null;
  if (display.length === 0 && !hasTitle && !hasDescription) return null;

  return (
    <section
      id="projects"
      className={cn('relative overflow-hidden bg-white py-16 sm:py-20 md:py-24 lg:py-28', className)}
    >
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div
          className="absolute top-1/4 right-0 h-80 w-80 rounded-full blur-3xl"
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
        {(hasTitle || hasDescription || showViewAllLink) && (
          <div className="mb-12 text-center md:mb-16">
            <div className="mb-6 flex items-center justify-center gap-4 text-gray-600/80">
              <span className="text-xs font-medium uppercase tracking-[0.2em]">Featured Works</span>
              <span
                className="h-px w-16 sm:w-24"
                style={{
                  background: `linear-gradient(90deg, transparent, ${theme.primaryColor}, transparent)`,
                }}
              />
            </div>

            {hasTitle && (
              <h2
                ref={titleRef}
                className={cn(
                  'royal-section-title mx-auto max-w-3xl transition-all duration-700',
                  titleVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                )}
                style={{ fontFamily: 'Georgia, serif', color: '#1a1a1a' }}
              >
                <TiptapRenderer content={titleContent} as="inline" />
              </h2>
            )}

            {hasDescription && (
              <div
                ref={descRef}
                className={cn(
                  'mx-auto mt-6 max-w-2xl text-base text-gray-600 transition-all duration-700 delay-150 sm:text-lg',
                  descVisible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
                )}
              >
                <TiptapRenderer content={descriptionContent} as="inline" />
              </div>
            )}

            {showViewAllLink && display.length > 0 && (
              <div className="mt-8 flex justify-center">
                <Link
                  href="/project-detail"
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
                  View All Projects
                </Link>
              </div>
            )}
          </div>
        )}

        {display.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {display.map((item, index) => {
              const imageUrl = projectImageUrl(item);
              const href = projectHref(item);
              const title = projectTitle(item);
              const desc = projectDescription(item);
              const year = projectYear(item);
              if (!imageUrl && !title) return null;

              const card = (
                <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-50">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={typeof title === 'string' ? title : 'Project'}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-4xl text-gray-300">
                        🏗️
                      </div>
                    )}
                    <div
                      className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      style={{
                        background: `linear-gradient(135deg, ${theme.primaryColor}99, ${theme.secondaryColor}88)`,
                      }}
                    >
                      <span className="rounded-full border border-white/50 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                        View Project
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col gap-2 p-5 md:p-6">
                    <div className="flex items-start justify-between gap-3">
                      <h3
                        className="text-lg font-semibold text-gray-900"
                        style={{ fontFamily: 'Georgia, serif' }}
                      >
                        {title}
                      </h3>
                      {year && (
                        <span
                          className="shrink-0 text-xs font-medium uppercase tracking-wider"
                          style={{ color: theme.primaryColor }}
                        >
                          {year}
                        </span>
                      )}
                    </div>
                    {desc && (
                      <div className="line-clamp-2 text-sm text-gray-600">
                        {typeof desc === 'string' ? desc : <TiptapRenderer content={desc} as="inline" />}
                      </div>
                    )}
                    <span
                      className="mt-auto pt-2 text-xs font-semibold uppercase tracking-[0.15em]"
                      style={{ color: theme.primaryColor }}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                </article>
              );

              return href ? (
                <Link key={index} href={normalizeHref(href)} className="block h-full">
                  {card}
                </Link>
              ) : (
                <div key={index} className="h-full">
                  {card}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-sm text-gray-500">
            No published projects yet. Add projects in the builder to show them here.
          </p>
        )}
      </div>
    </section>
  );
};

export default ProjectsSection;
