import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';

const ThemeContext = createContext({});

export function ThemeProvider({ children }) {
  const [themeSettings, setThemeSettings] = useState({
    navbarLinks: [],
    footerLinks: [],
    promoOffers: [],
    features: [],
    testimonials: [],
    socialFeed: [],
    stats: [],
    hero: {
      title: '', subtitle: '', description: '',
      button1Text: '', button1Link: '', button2Text: '', button2Link: ''
    },
    promoBanners: [
      {
        id: '1',
        title: 'Spring Sale Event',
        description: 'Refresh your home with up to <span class="text-charcoal font-bold">40% off</span> our premium bespoke curtains.',
        buttonText: 'Shop The Sale',
        buttonLink: '/products',
        isActive: true
      }
    ],
    homeSections: {
      showFeatured: true, showBestSellers: true, bestSellersMode: 'manual'
    },
    signatures: [],
    socialLinks: [],
    contactInfo: { email: '', phone: '', address: '', hours: '' },
    loading: true
  });

  useEffect(() => {
    const fetchThemeSettings = async () => {
      try {
        const response = await api.get('/settings'); // our new public settings route
        
        const settingsMap = (response.data || []).reduce((acc, curr) => {
          acc[curr.key] = curr.value;
          return acc;
        }, {});

        setThemeSettings({
          navbarLinks: settingsMap['theme.navbar.links'] || [],
          footerLinks: settingsMap['theme.footer.links'] || [],
          promoOffers: settingsMap['theme.promo.offers'] || [],
          features: settingsMap['theme.home.features'] || [],
          testimonials: settingsMap['theme.home.testimonials'] || [],
          socialFeed: settingsMap['theme.home.social_feed'] || [],
          stats: settingsMap['theme.home.stats'] || [],
          hero: settingsMap['theme.home.hero'] || {
            title: '', subtitle: '', description: '',
            button1Text: '', button1Link: '', button2Text: '', button2Link: '',
            desktopImageUrl: '', mobileImageUrl: ''
          },
          promoBanners: settingsMap['theme.home.promo_banners'] || (settingsMap['theme.home.promo_banner'] ? [settingsMap['theme.home.promo_banner']] : [
            {
              id: '1',
              title: 'Spring Sale Event',
              description: 'Refresh your home with up to <span class="text-charcoal font-bold">40% off</span> our premium bespoke curtains.',
              buttonText: 'Shop The Sale',
              buttonLink: '/products',
              isActive: true
            }
          ]),
          homeSections: settingsMap['theme.home.sections'] || {
            showFeatured: true, showBestSellers: true, bestSellersMode: 'manual'
          },
          signatures: settingsMap['theme.home.signatures'] || [],
          socialLinks: settingsMap['theme.social.links'] || [],
          contactInfo: settingsMap['theme.contact.info'] || { email: '', phone: '', address: '', hours: '' },
          loading: false
        });
      } catch (error) {
        console.error('Failed to fetch theme settings', error);
        setThemeSettings(prev => ({ ...prev, loading: false }));
      }
    };

    fetchThemeSettings();
  }, []);

  return (
    <ThemeContext.Provider value={themeSettings}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
