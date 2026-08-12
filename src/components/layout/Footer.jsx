import React from 'react';
import { footerLinks } from '../../data/homeData';
import NewsletterCTA from './NewsletterCTA';
import LogoImage from '../../assets/images/LogoProcessed.png';

export default function Footer() {
  return (
    <footer className="bg-hero-dark text-ivory pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-ivory/10">
          
          {/* Brand Col */}
          <div className="md:col-span-1 flex flex-col items-start">
            <a href="/" className="mb-6 inline-block">
              <img src={LogoImage} alt="THELOVESIDES" className="h-10 md:h-12 object-contain brightness-0 invert" />
            </a>
            <p className="text-ivory/60 text-sm leading-relaxed max-w-xs mb-6">
              Premium window treatments with expert installation since 2014.
            </p>
            <div className="flex items-center gap-4">
              <a 
                href="https://www.instagram.com/thelovesides?igsh=MWoxc2htMjlpZjMzag==" 
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram" 
                className="text-ivory/60 hover:text-pink-primary transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </a>
              <a href="#" aria-label="Facebook" className="text-ivory/60 hover:text-pink-primary transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Link Columns */}
          <div className="md:col-span-2 grid grid-cols-2 gap-8">
            {footerLinks.map((section) => (
              <div key={section.title}>
                <h4 className="font-serif text-lg mb-4 text-ivory">{section.title}</h4>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-ivory/70 hover:text-pink-primary text-sm block transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pink-primary rounded px-1 -ml-1">
                        {link}
                      </a>
                    </li>
                  ))}
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
