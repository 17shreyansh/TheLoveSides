import React from 'react';
import { footerLinks } from '../../data/homeData';
import NewsletterCTA from './NewsletterCTA';
import LogoImage from '../../assets/images/LogoTransparent.png';

export default function Footer() {
  return (
    <footer className="bg-navy-dark text-ivory pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-ivory/10">
          
          {/* Brand Col */}
          <div className="md:col-span-1 flex flex-col items-start">
            <a href="/" className="mb-6 inline-block">
              <img src={LogoImage} alt="THELOVESIDES" className="h-10 md:h-12 object-contain" />
            </a>
            <p className="text-ivory/60 text-sm leading-relaxed max-w-xs">
              Premium window treatments with expert installation since 2014.
            </p>
          </div>

          {/* Link Columns */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="font-serif text-lg mb-4 text-ivory">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-ivory/70 hover:text-amber text-sm block transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber rounded px-1 -ml-1">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter Col */}
          <div>
            <h4 className="font-serif text-lg mb-4 text-ivory">Stay Inspired</h4>
            <NewsletterCTA />
          </div>
          
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 text-center text-xs text-ivory/40">
          <p>© 2026 THELOVESIDES. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
