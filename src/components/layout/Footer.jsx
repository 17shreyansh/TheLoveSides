import React from 'react';
import { Link } from 'react-router-dom';
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
            <Link to="/" className="mb-6 inline-block">
              <img src={LogoImage} alt="THELOVESIDES" className="h-10 md:h-12 object-contain brightness-0 invert" />
            </Link>
            <p className="text-ivory/60 text-sm leading-relaxed max-w-xs mb-6">
              Premium window treatments with expert installation since 2018.
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
              <a href="#" aria-label="YouTube" className="text-ivory/60 hover:text-pink-primary transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>
                </svg>
              </a>
              <a href="#" aria-label="Pinterest" className="text-ivory/60 hover:text-pink-primary transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0a12 12 0 0 0-4.37 23.17c-.07-.94-.14-2.38.03-3.4l1.1-4.66s-.28-.56-.28-1.4c0-1.3.75-2.28 1.68-2.28.8 0 1.18.6 1.18 1.3 0 .8-.5 2-.77 3.1-.22.94.47 1.7 1.4 1.7 1.68 0 2.97-1.77 2.97-4.32 0-2.26-1.62-3.84-3.95-3.84-2.7 0-4.3 2.03-4.3 4.14 0 .82.32 1.7.7 2.18.08.1.09.18.06.28l-.22.9c-.04.14-.13.17-.28.1-1.04-.48-1.7-2-1.7-3.23 0-2.63 1.9-5.05 5.5-5.05 2.9 0 5.16 2.07 5.16 4.84 0 2.88-1.8 5.2-4.33 5.2-.85 0-1.65-.44-1.92-.96l-.53 2c-.2.72-.7 1.63-1.05 2.18A12 12 0 1 0 12 0z"/>
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
