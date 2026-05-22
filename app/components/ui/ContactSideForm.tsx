'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import gsap from 'gsap';
import { useThemeFonts } from '@/app/hooks/useTheme';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';

interface ContactSideFormProps {
  isOpen: boolean;
  onClose: () => void;
}

function UnderlineField({
  label,
  children,
  labelFont,
}: {
  label: string;
  children: React.ReactNode;
  labelFont: string;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-xs text-gray-900" style={{ fontFamily: labelFont }}>
        {label}
      </label>
      {children}
    </div>
  );
}

export const ContactSideForm: React.FC<ContactSideFormProps> = ({ isOpen, onClose }) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const themeFonts = useThemeFonts();
  const { site } = useWebBuilder();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    time: '',
    source: '',
    acceptedTerms: false,
  });

  const accentRed =
    site?.theme?.primaryButtonColorLight ||
    site?.theme?.darkPrimaryColor ||
    '#c45c5c';
  const linePink = '#e8c8c8';
  const buttonPink = '#e5b8b8';
  const panelBg = '#f2f2f2';

  const headingFont = themeFonts.heading
    ? `${themeFonts.heading}, Georgia, serif`
    : 'Georgia, "Times New Roman", serif';
  const bodyFont = themeFonts.body
    ? `${themeFonts.body}, system-ui, sans-serif`
    : 'system-ui, -apple-system, sans-serif';

  const underlineClass =
    'w-full border-0 border-b bg-transparent py-1.5 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400';

  const underlineStyle: React.CSSProperties = {
    fontFamily: bodyFont,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: linePink,
  };

  const onFocusLine = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderBottomColor = accentRed;
  };
  const onBlurLine = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderBottomColor = linePink;
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const tl = gsap.timeline();
      tl.to(overlayRef.current, {
        opacity: 1,
        visibility: 'visible',
        duration: 0.5,
        ease: 'power2.out',
      }).to(
        formRef.current,
        { x: 0, duration: 0.8, ease: 'expo.out' },
        '-=0.3'
      );
    } else {
      const tl = gsap.timeline({
        onComplete: () => {
          document.body.style.overflow = '';
        },
      });
      tl.to(formRef.current, { x: '100%', duration: 0.6, ease: 'expo.in' }).to(
        overlayRef.current,
        { opacity: 0, visibility: 'hidden', duration: 0.4 },
        '-=0.2'
      );
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          siteId: site?._id,
          subject: `Request for Information - ${formData.name}`,
          message: `Phone: ${formData.phone}\nCallback Time: ${formData.time}\nSource: ${formData.source}`,
        }),
      });

      if (response.ok) {
        setSubmitMessage('Sent successfully');
        setTimeout(() => {
          onClose();
          setSubmitMessage('');
          setFormData({
            name: '',
            email: '',
            phone: '',
            time: '',
            source: '',
            acceptedTerms: false,
          });
        }, 2000);
      } else {
        setSubmitMessage('Failed to send');
      }
    } catch {
      setSubmitMessage('Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] overflow-hidden pointer-events-none">
      <div
        ref={overlayRef}
        onClick={onClose}
        className="absolute inset-0 bg-black/30 opacity-0 invisible pointer-events-auto cursor-pointer"
        aria-hidden
      />

      <div
        ref={formRef}
        className="pointer-events-auto absolute top-0 right-0 flex h-full w-full max-w-[440px] translate-x-full flex-col overflow-hidden shadow-[-12px_0_40px_rgba(0,0,0,0.06)]"
        style={{ backgroundColor: panelBg }}
      >
        <div className="flex shrink-0 justify-end px-5 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-700 transition-opacity hover:opacity-60"
            aria-label="Close form"
          >
            <X size={20} strokeWidth={1.25} />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col justify-center overflow-hidden px-6 pb-6 md:px-8">
          <div className="mx-auto w-full max-w-[360px]">
            <header className="mb-5 space-y-2">
              <h2
                className="text-[1.45rem] font-normal leading-[1.15] md:text-[1.6rem]"
                style={{ color: accentRed, fontFamily: headingFont }}
              >
                Would you like
                <br />
                more information?
              </h2>
              <p
                className="text-xs leading-snug text-gray-800"
                style={{ fontFamily: bodyFont }}
              >
                If you have any questions, tell us when it is better for us to call you.
              </p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-4">
              <UnderlineField label="Name and surname" labelFont={bodyFont}>
                <input
                  type="text"
                  required
                  className={underlineClass}
                  style={underlineStyle}
                  onFocus={onFocusLine}
                  onBlur={onBlurLine}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </UnderlineField>

              <UnderlineField label="Mail" labelFont={bodyFont}>
                <input
                  type="email"
                  required
                  className={underlineClass}
                  style={underlineStyle}
                  onFocus={onFocusLine}
                  onBlur={onBlurLine}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </UnderlineField>

              <div className="grid grid-cols-2 gap-4">
                <UnderlineField label="Telephone" labelFont={bodyFont}>
                  <input
                    type="tel"
                    className={underlineClass}
                    style={underlineStyle}
                    onFocus={onFocusLine}
                    onBlur={onBlurLine}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </UnderlineField>

                <UnderlineField label="Preferable time" labelFont={bodyFont}>
                  <input
                    type="text"
                    placeholder=""
                    className={underlineClass}
                    style={underlineStyle}
                    onFocus={onFocusLine}
                    onBlur={onBlurLine}
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  />
                </UnderlineField>
              </div>

              <UnderlineField label="Where did you find us" labelFont={bodyFont}>
                <input
                  type="text"
                  className={underlineClass}
                  style={underlineStyle}
                  onFocus={onFocusLine}
                  onBlur={onBlurLine}
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                />
              </UnderlineField>

              <label className="flex cursor-pointer items-center gap-2.5">
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 shrink-0 rounded-none border border-gray-400 accent-[#c45c5c]"
                  required
                  checked={formData.acceptedTerms}
                  onChange={(e) =>
                    setFormData({ ...formData, acceptedTerms: e.target.checked })
                  }
                />
                <span
                  className="text-[10px] font-medium uppercase leading-snug tracking-[0.06em] text-gray-900"
                  style={{ fontFamily: bodyFont }}
                >
                  I accept the{' '}
                  <Link
                    href="/privacy-policy"
                    className="underline underline-offset-2"
                    style={{ color: accentRed }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    privacy policy
                  </Link>
                </span>
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center py-3.5 text-xs font-bold uppercase tracking-[0.35em] text-white transition-all duration-300 hover:brightness-[1.03] active:scale-[0.995] disabled:opacity-55"
                style={{
                  backgroundColor: buttonPink,
                  fontFamily: bodyFont,
                }}
              >
                {isSubmitting ? 'Sending…' : submitMessage || 'Send'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSideForm;
