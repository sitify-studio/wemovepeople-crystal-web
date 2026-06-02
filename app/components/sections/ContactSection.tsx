'use client';

import React, { useMemo, useState } from 'react';
import type { Page, BusinessHours } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { TiptapRenderer } from '@/app/components/ui/TiptapRenderer';
import { cn, SECTION_PY } from '@/app/lib/utils';
import { useScrollAnimation } from '@/app/hooks/useScrollAnimation';
import { ArrowRight } from 'lucide-react';
import { ContactSideForm } from '@/app/components/ui/ContactSideForm';

const DAY_LABELS: Record<string, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
};

interface ContactSectionProps {
  contactSection?: Page['contactSection'];
  className?: string;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  contactSection,
  className,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { site } = useWebBuilder();

  const theme = useMemo(() => {
    const t = site?.theme;
    return {
      primaryColor: t?.primaryButtonColorLight || t?.darkPrimaryColor || '#7c4a35',
      secondaryColor: t?.darkSecondaryColor || t?.lightSecondaryColor || '#1E40AF',
    };
  }, [site?.theme]);

  const { ref: titleRef, isVisible: titleVisible } =
    useScrollAnimation<HTMLHeadingElement>({ threshold: 0.2 });
  const { ref: descRef, isVisible: descVisible } =
    useScrollAnimation<HTMLParagraphElement>({ threshold: 0.2 });

  if (!contactSection?.enabled) return null;

  const business = site?.business;
  const address = business?.address;
  const businessHours = business?.businessHours;
  const showForm = contactSection.showForm !== false;
  const showMap = contactSection.showMap !== false;
  const showContactInfo = contactSection.showContactInfo !== false;

  const formatTime = (time: string) => {
    if (!time) return '';
    if (businessHours?.displayFormat === '12h') {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    }
    return time;
  };

  const formatDayHours = (dayHours: BusinessHours) => {
    if (!dayHours.isOpen) return 'Closed';
    if (dayHours.is24Hours) return '24h';
    if (dayHours.timeRanges?.length) {
      return dayHours.timeRanges
        .map((range) => `${formatTime(range.openTime)} - ${formatTime(range.closeTime)}`)
        .join(', ');
    }
    return '';
  };

  const addressLine = [address?.street, address?.city, address?.state, address?.zipCode]
    .filter(Boolean)
    .join(', ');

  const mapQuery = addressLine;

  return (
    <section
      id="contact"
      className={cn(
        'relative overflow-hidden bg-white',
        SECTION_PY,
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute right-1/4 top-0 h-80 w-80 rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle, ${theme.primaryColor}10, transparent 70%)`,
          }}
        />
        <div
          className="absolute bottom-0 left-0 h-72 w-72 rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle, ${theme.secondaryColor}08, transparent 70%)`,
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header + form CTA */}
        <div className="mb-16 flex flex-col items-center text-center md:mb-20">
          <div className="mb-6 flex items-center justify-center gap-4 text-gray-600/80">
            <span className="text-xs font-medium uppercase tracking-[0.2em]">Get In Touch</span>
            <span
              className="h-px w-16 sm:w-24"
              style={{
                background: `linear-gradient(90deg, transparent, ${theme.primaryColor}, transparent)`,
              }}
            />
          </div>

          {contactSection.title ? (
            <h2
              ref={titleRef}
              className={cn(
                'mx-auto max-w-3xl text-3xl font-light tracking-tight text-gray-900 transition-all duration-700 sm:text-4xl md:text-5xl',
                titleVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              )}
              style={{ fontFamily: 'Georgia, serif' }}
            >
              <TiptapRenderer content={contactSection.title} as="inline" />
            </h2>
          ) : (
            <h2
              ref={titleRef}
              className={cn(
                'mx-auto max-w-3xl text-3xl font-light tracking-tight text-gray-900 transition-all duration-700 sm:text-4xl md:text-5xl',
                titleVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              )}
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Any questions?
              <br />
              <span style={{ color: theme.primaryColor }}>Simply ask us.</span>
            </h2>
          )}

          {contactSection.description && (
            <p
              ref={descRef}
              className={cn(
                'mx-auto mt-6 max-w-2xl text-base text-gray-600 transition-all duration-700 delay-150 sm:text-lg',
                descVisible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
              )}
            >
              <TiptapRenderer content={contactSection.description} as="inline" />
            </p>
          )}

          {showForm && (
            <button
              type="button"
              onClick={() => setIsFormOpen(true)}
              className="group mt-10 flex w-full max-w-xs items-center justify-between rounded-full border-2 px-8 py-4 transition-all duration-300 hover:shadow-md sm:max-w-sm"
              style={{
                borderColor: theme.primaryColor,
                color: theme.primaryColor,
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
              <span className="text-xs font-semibold uppercase tracking-[0.25em]">Open Form</span>
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          )}
        </div>

        <ContactSideForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />

        {(showContactInfo || showMap) && (
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-stretch lg:gap-16">
            {showContactInfo && (
              <div className="space-y-10 lg:h-full">
                <div>
                  <h3
                    className="mb-6 text-2xl font-light text-gray-900 sm:text-3xl"
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    Where to find us
                  </h3>
                  <div
                    className="mb-6 h-px w-16"
                    style={{
                      background: `linear-gradient(90deg, ${theme.primaryColor}, transparent)`,
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
                  {(address?.street || address?.city) && (
                    <div className="space-y-4">
                      <span
                        className="block text-xs font-semibold uppercase tracking-[0.2em]"
                        style={{ color: theme.primaryColor }}
                      >
                        Head Office
                      </span>
                      <p className="text-sm leading-relaxed text-gray-600">
                        {address?.street && (
                          <>
                            {address.street}
                            <br />
                          </>
                        )}
                        {[address?.city, address?.state, address?.zipCode].filter(Boolean).join(', ')}
                      </p>
                      {mapQuery && (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] transition-all duration-300"
                          style={{
                            borderColor: theme.primaryColor,
                            color: theme.primaryColor,
                          }}
                        >
                          View Map
                          <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                        </a>
                      )}
                    </div>
                  )}

                  {business?.phone && (
                    <div className="space-y-2">
                      <span
                        className="block text-xs font-semibold uppercase tracking-[0.2em]"
                        style={{ color: theme.primaryColor }}
                      >
                        Phone
                      </span>
                      <a
                        href={`tel:${business.phone.replace(/\s/g, '')}`}
                        className="text-sm text-gray-700 hover:text-gray-900"
                      >
                        {business.phone}
                      </a>
                    </div>
                  )}

                  {business?.email && (
                    <div className="space-y-2">
                      <span
                        className="block text-xs font-semibold uppercase tracking-[0.2em]"
                        style={{ color: theme.primaryColor }}
                      >
                        Email
                      </span>
                      <a
                        href={`mailto:${business.email}`}
                        className="text-sm text-gray-700 hover:text-gray-900"
                      >
                        {business.email}
                      </a>
                    </div>
                  )}

                  {businessHours?.isEnabled && (
                    <div className="space-y-4 sm:col-span-2">
                      <span
                        className="block text-xs font-semibold uppercase tracking-[0.2em]"
                        style={{ color: theme.primaryColor }}
                      >
                        Business Hours
                      </span>
                      <div className="space-y-2 rounded-2xl border border-gray-200 bg-gray-50/80 p-4">
                        {businessHours.hours.map((day) => (
                          <div
                            key={day.day}
                            className="flex justify-between gap-4 text-sm text-gray-600"
                          >
                            <span className="font-medium text-gray-800">{DAY_LABELS[day.day]}</span>
                            <span>{formatDayHours(day)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {showMap && (
              <div className="relative min-h-[280px] w-full overflow-hidden rounded-2xl border border-gray-200 shadow-lg lg:min-h-0 lg:h-full">
                {site?.business?.coordinates?.latitude != null &&
                site?.business?.coordinates?.longitude != null ? (
                  <iframe
                    title="Office Location"
                    width="100%"
                    height="100%"
                    className="absolute inset-0 h-full w-full border-0 grayscale contrast-[1.05] opacity-90 transition-all duration-700 hover:grayscale-0"
                    src={`https://maps.google.com/maps?q=${site.business.coordinates.latitude},${site.business.coordinates.longitude}&z=15&output=embed`}
                    allowFullScreen
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full min-h-[280px] items-center justify-center bg-gray-100 text-sm text-gray-400">
                    Map coordinates not configured
                  </div>
                )}
                <div
                  className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset"
                  style={{ boxShadow: `inset 0 0 0 1px ${theme.primaryColor}15` }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default ContactSection;
