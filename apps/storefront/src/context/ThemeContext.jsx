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
    promoBanner: {
      title: 'Spring Sale Event',
      description: 'Refresh your home with up to <span class="text-charcoal font-bold">40% off</span> our premium bespoke curtains.',
      buttonText: 'Shop The Sale',
      buttonLink: '/products'
    },
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
            button1Text: '', button1Link: '', button2Text: '', button2Link: ''
          },
          promoBanner: settingsMap['theme.home.promo_banner'] || {
            title: 'Spring Sale Event',
            description: 'Refresh your home with up to <span class="text-charcoal font-bold">40% off</span> our premium bespoke curtains.',
            buttonText: 'Shop The Sale',
            buttonLink: '/products'
          },
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
