import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import NewsletterCTA from './NewsletterCTA';
import LogoImage from '../../assets/images/LogoProcessed.png';
import SocialIcon from '../ui/SocialIcon';

export default function Footer() {
  const { footerLinks, socialLinks } = useTheme();

  return (
    <footer className="bg-hero-dark text-ivory pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-ivory/10">
          
          {/* Brand Col */}
          <div className="md:col-span-1 flex flex-col items-start">
            <Link to="/" className="mb-6 inline-block">
              <img src={LogoImage} alt="THELOVESIDES" className="h-10 md:h-12 object-contain" />
            </Link>
            <p className="text-ivory/60 text-sm leading-relaxed max-w-xs mb-6">
              Premium window treatments with expert installation since 2018.
            </p>
            <div className="flex items-center gap-4">
              {(socialLinks || []).map((link, idx) => {
                if (!link.url) return null;
                return (
                  <a 
                    key={idx}
                    href={link.url} 
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.platform} 
                    className="text-ivory/60 hover:text-pink-primary transition-colors capitalize text-sm font-medium"
                  >
                    <SocialIcon platform={link.platform} className="w-5 h-5" />
                  </a>
                );
              })}
              {(!socialLinks || socialLinks.length === 0) && (
                <span className="text-ivory/40 text-sm">Follow us on social media</span>
              )}
            </div>
          </div>

          {/* Link Columns */}
          <div className="md:col-span-2 grid grid-cols-2 gap-8">
            {(footerLinks || []).map((section) => (
              <div key={section.title}>
                <h4 className="font-serif text-lg mb-4 text-ivory">{section.title}</h4>
                <ul className="space-y-2">
                  {section.links.map((link) => {
                    const isObj = typeof link === 'object' && link !== null;
                    const label = isObj ? link.name : link;
                    const href = isObj ? link.href : '#';
                    const isInternal = href.startsWith('/');

                    return (
                      <li key={label}>
                        {isInternal ? (
                          <Link
                            to={href}
                            className="text-ivory/70 hover:text-pink-primary text-sm block transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pink-primary rounded px-1 -ml-1"
                          >
                            {label}
                          </Link>
                        ) : (
                          <a
                            href={href}
                            className="text-ivory/70 hover:text-pink-primary text-sm block transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pink-primary rounded px-1 -ml-1"
                          >
                            {label}
                          </a>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>

          {/* Newsletter Col */}
          <div>
            <h4 className="font-serif text-lg mb-4 text-ivory">Stay Inspired</h4>
            <NewsletterCTA />
          </div>
          
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-ivory/40">
          <p>© 2026 THELOVESIDES. All rights reserved.</p>
          <p className="mt-2 md:mt-0">
            Developed by{' '}
            <a 
              href="https://www.affobe.com/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-ivory font-semibold tracking-widest hover:text-pink-primary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pink-primary rounded px-1 -ml-1"
            >
              AFFOBE
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
