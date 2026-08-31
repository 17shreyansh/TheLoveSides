import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ChevronRight, 
  ChevronDown, 
  AlertCircle, 
  MapPin, 
  Mail, 
  Phone, 
  User, 
  MessageCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import RevealOnScroll from '../components/ui/RevealOnScroll';
import { 
  exchangeRefundPolicy, 
  privacyPolicy, 
  shippingPolicy 
} from '../data/policies';

const iconMap = {
  User,
  MapPin,
  Phone,
  Mail,
};

export default function PolicyPage({ policyData }) {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Auto-detect policy data if not explicitly passed as prop
  let policy = policyData;
  if (!policy) {
    const pathname = location.pathname.toLowerCase();
    if (pathname.includes('exchange') || pathname.includes('refund')) {
      policy = exchangeRefundPolicy;
    } else if (pathname.includes('privacy')) {
      policy = privacyPolicy;
    } else if (pathname.includes('shipping')) {
      policy = shippingPolicy;
    } else {
      policy = exchangeRefundPolicy;
    }
  }

  // Set default active section
  useEffect(() => {
    if (policy?.sections?.length > 0) {
      setActiveSection(policy.sections[0].id);
    }
    // Scroll to top on page navigation
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [policy]);

  // ScrollSpy via IntersectionObserver
  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = policy.sections
        .map((s) => document.getElementById(s.id))
        .filter(Boolean);

      const scrollPosition = window.scrollY + 180;

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const section = sectionElements[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(section.id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [policy]);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -130;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setActiveSection(id);
      setIsMobileNavOpen(false);
    }
  };

  const renderBlock = (block, blockIdx) => {
    switch (block.type) {
      case 'paragraph':
        return (
          <p key={blockIdx} className="text-gray-600 leading-relaxed mb-4 text-base">
            {block.text}
          </p>
        );

      case 'list':
        return (
          <ul key={blockIdx} className="space-y-2.5 my-4 pl-1">
            {block.items.map((item, itemIdx) => (
              <li key={itemIdx} className="flex items-start gap-2.5 text-gray-600 text-base leading-relaxed">
                <span className="text-amber font-bold shrink-0 select-none mt-0.5">—</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        );

      case 'callout':
        return (
          <div
            key={blockIdx}
            className="bg-amber/10 border-l-4 border-amber rounded-r-lg p-4 my-5 text-sm text-charcoal flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-amber shrink-0 mt-0.5" />
            <div className="leading-relaxed font-medium">{block.text}</div>
          </div>
        );

      case 'contactCard':
        return (
          <div
            key={blockIdx}
            className="bg-cream border border-charcoal/10 rounded-xl p-5 my-5 shadow-xs"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {block.items.map((item, itemIdx) => {
                const IconComponent = iconMap[item.icon] || Mail;
                return (
                  <div key={itemIdx} className="flex items-start gap-3 text-sm">
                    <div className="p-2 rounded-lg bg-amber/10 text-amber shrink-0 mt-0.5">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-medium text-charcoal/60 block text-xs tracking-wider uppercase">
                        {item.label}
                      </span>
                      <span className="text-charcoal font-medium break-words">
                        {item.value}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-cream min-h-screen">
      {/* 1. Policy Hero Header */}
      <div className="bg-cream pt-28 md:pt-36 pb-10 md:pb-14 border-b border-charcoal/10">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500 mb-4 font-sans">
            <Link to="/" className="hover:text-amber transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-400">Policies</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-charcoal font-medium">{policy.title}</span>
          </div>

          {/* Title */}
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-charcoal font-normal tracking-tight mb-2">
            {policy.title}
          </h1>

          {/* Last Updated Date (if available) */}
          {policy.lastUpdated && (
            <p className="text-xs md:text-sm text-gray-500 mb-3">
              Last Updated: {policy.lastUpdated}
            </p>
          )}

          {/* Intro description */}
          {policy.description && (
            <p className="text-sm md:text-base text-gray-600 max-w-2xl mt-2 leading-relaxed">
              {policy.description}
            </p>
          )}
        </div>
      </div>

      {/* 2. Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-8 md:py-12">
        {/* Mobile Jump to section dropdown (lg:hidden) */}
        <div className="lg:hidden mb-8">
          <button
            type="button"
            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            className="w-full bg-cream border border-charcoal/10 rounded-lg px-4 py-3.5 flex justify-between items-center text-sm font-medium text-charcoal shadow-xs hover:border-amber transition-colors"
          >
            <span>Jump to a section</span>
            <ChevronDown
              className={clsx(
                'w-4 h-4 text-gray-500 transition-transform duration-200',
                isMobileNavOpen && 'rotate-180 text-amber'
              )}
            />
          </button>

          <AnimatePresence>
            {isMobileNavOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden bg-white border border-charcoal/10 rounded-lg mt-2 shadow-md divide-y divide-charcoal/5"
              >
                {policy.sections.map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => scrollToSection(section.id)}
                    className={clsx(
                      'w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between',
                      activeSection === section.id
                        ? 'text-amber bg-amber/5 font-medium'
                        : 'text-gray-600 hover:text-amber hover:bg-gray-50'
                    )}
                  >
                    <span>{section.heading}</span>
                    {activeSection === section.id && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber" />
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Two-Column Layout */}
        <div className="flex flex-col lg:flex-row lg:gap-14">
          {/* Left Column: Sticky Table of Contents (Desktop only) */}
          <aside className="hidden lg:block lg:w-1/4 shrink-0">
            <div className="sticky top-36 p-4 rounded-xl bg-ivory/50 border border-charcoal/5">
              <h2 className="text-xs uppercase tracking-wider text-gray-400 mb-4 font-semibold">
                On this page
              </h2>
              <nav className="space-y-1 max-h-[calc(100vh-12rem)] overflow-y-auto pr-2 no-scrollbar">
                {policy.sections.map((section) => {
                  const isActive = activeSection === section.id;
                  return (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => scrollToSection(section.id)}
                      className={clsx(
                        'text-left text-sm py-1.5 pl-3 border-l-2 transition-all block w-full truncate leading-normal',
                        isActive
                          ? 'text-amber border-amber font-medium bg-amber/5 rounded-r'
                          : 'text-gray-600 border-transparent hover:text-amber hover:border-amber'
                      )}
                      title={section.heading}
                    >
                      {section.heading}
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Right Column: Policy Content */}
          <div className="w-full lg:w-3/4 max-w-3xl">
            {/* Introductory statement */}
            {policy.intro && (
              <div className="mb-8 pb-6 border-b border-charcoal/10">
                <p className="text-base md:text-lg text-charcoal/80 leading-relaxed font-sans">
                  {policy.intro}
                </p>
              </div>
            )}

            {/* Sections */}
            <div className="space-y-10">
              {policy.sections.map((section) => (
                <section
                  id={section.id}
                  key={section.id}
                  className="scroll-mt-32 pb-4"
                >
                  <RevealOnScroll className="w-full">
                    <h2 className="font-serif text-xl md:text-2xl text-charcoal mt-4 mb-4 font-normal">
                      {section.heading}
                    </h2>
                    <div className="space-y-3">
                      {section.blocks.map((block, blockIdx) =>
                        renderBlock(block, blockIdx)
                      )}
                    </div>
                  </RevealOnScroll>
                </section>
              ))}
            </div>

            {/* 3. Bottom "Need Help?" CTA band */}
            <div className="bg-navy-dark text-ivory rounded-2xl p-8 md:p-10 mt-16 text-center shadow-lg">
              <h3 className="font-serif text-2xl md:text-3xl text-ivory mb-2 font-normal">
                Still have questions?
              </h3>
              <p className="text-ivory/70 text-sm md:text-base max-w-md mx-auto mb-6">
                Our team is here to help with anything related to your order.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="mailto:lykwestore12@gmail.com"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-ivory text-hero-dark hover:bg-ivory/90 font-medium px-6 py-3 rounded-full transition-all duration-200 text-sm shadow-sm hover:scale-[1.02]"
                >
                  <Mail className="w-4 h-4 text-hero-dark" />
                  <span>Email Us</span>
                </a>
                <a
                  href="https://wa.me/916396762002"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-6 py-3 rounded-full transition-all duration-200 text-sm shadow-sm hover:scale-[1.02]"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Us</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
