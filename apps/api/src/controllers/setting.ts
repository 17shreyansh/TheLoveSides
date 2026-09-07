import type { Request, Response, NextFunction } from 'express';
import { Setting } from '../models/Setting.js';
import { sendSuccess } from '../utils/ApiResponse.js';

const DEFAULT_THEME_SETTINGS = [
  {
    key: 'theme.navbar.links',
    group: 'theme',
    isPublic: true,
    value: [
      { title: 'Shop All', href: '/products' },
      { title: 'New Arrivals', href: '/arrivals' },
      { title: 'Best Seller', href: '/best-sellers' },
      { title: 'Curtains', href: '/category/curtains' },
      { title: 'Sofa Covers', href: '/category/sofa-covers' },
      { title: 'Marble', href: '/category/marble' },
      { title: 'Accessories', href: '/category/accessories' },
      { title: 'Clothing', href: '/category/clothing' },
    ]
  },
  {
    key: 'theme.footer.links',
    group: 'theme',
    isPublic: true,
    value: [
      {
        title: 'Categories',
        links: [
          { name: 'Curtains', href: '/category/curtains' },
          { name: 'Sofa Covers', href: '/category/sofa-covers' },
          { name: 'Marble', href: '/category/marble' },
          { name: 'Accessories', href: '/category/accessories' },
        ]
      },
      {
        title: 'Policies',
        links: [
          { name: 'Exchange & Refund', href: '/policies/exchange-refund' },
          { name: 'Privacy Policy', href: '/policies/privacy' },
          { name: 'Shipping Policy', href: '/policies/shipping' },
        ]
      }
    ]
  },
  {
    key: 'theme.promo.offers',
    group: 'theme',
    isPublic: true,
    value: [
      "Free Delivery on Orders Above ₹1999",
      "Flat 20% Off on First Order | Use Code LOVE20",
      "Premium Custom Fitting Included on All Orders",
      "New Arrivals: Explore Our Summer Collection"
    ]
  },
  {
    key: 'theme.home.features',
    group: 'theme',
    isPublic: true,
    value: [
      {
        id: 1,
        icon: 'Award',
        title: 'Premium Quality Fabrics',
        description: 'High-quality fabrics with beautiful finishing and long-lasting durability.'
      },
      {
        id: 2,
        icon: 'Gem',
        title: 'Affordable Luxury',
        description: 'Premium-looking curtains at prices that offer great value.'
      },
      {
        id: 3,
        icon: 'ShoppingCart',
        title: 'Easy Ordering',
        description: 'Simple ordering process with support from selection to delivery.'
      },
      {
        id: 4,
        icon: 'Heart',
        title: 'Trusted by Customers',
        description: 'Real customer love, feedback and growing community'
      }
    ]
  },
  {
    key: 'theme.home.testimonials',
    group: 'theme',
    isPublic: true,
    value: [
      {
        id: 1,
        quote: "Exceptional quality and service. The linen curtains transformed our living room completely.",
        author: "Sarah Mitchell"
      },
      {
        id: 2,
        quote: "Professional installation and beautiful blackout curtains. Highly recommend!",
        author: "James Peterson"
      },
      {
        id: 3,
        quote: "The custom fitting service is worth every penny. Perfect measurements, perfect results.",
        author: "Emma Rodriguez"
      }
    ]
  },
  {
    key: 'theme.home.social_feed',
    group: 'theme',
    isPublic: true,
    value: [
      "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1598928506311-c55d4304dbbd?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    key: 'theme.home.hero',
    group: 'theme',
    isPublic: true,
    value: {
      title: 'Curtains & <br class="md:hidden" /> Quiet Luxury',
      subtitle: 'Home, Styled with Love',
      description: 'Shop our exclusive collection of premium curtains and blinds. Discover high-quality fabrics, custom sizing, and effortless style to elevate any room.',
      button1Text: 'Shop Curtains',
      button1Link: '/products',
      button2Text: 'Book Free Consultation',
      button2Link: '/contact'
    }
  },
  {
    key: 'theme.home.promo_banner',
    group: 'theme',
    isPublic: true,
    value: {
      title: 'Spring Sale Event',
      description: 'Refresh your home with up to <span class="text-charcoal font-bold">40% off</span> our premium bespoke curtains.',
      buttonText: 'Shop The Sale',
      buttonLink: '/products'
    }
  },
  {
    key: 'theme.home.stats',
    group: 'theme',
    isPublic: true,
    value: [
      { id: 1, value: 15000, label: 'Happy Customers' },
      { id: 2, value: 25000, label: 'Projects Completed' },
      { id: 3, value: 12, label: 'Years of Excellence' }
    ]
  }
];

export async function getPublicSettings(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    let settings = await Setting.find({ isPublic: true }).lean();

    // Auto-seed theme settings if none exist
    if (settings.length === 0) {
      const inserted = await Setting.insertMany(DEFAULT_THEME_SETTINGS);
      settings = inserted.map(doc => doc.toObject() as any);
    }

    sendSuccess({ res, data: settings });
  } catch (error) {
    next(error);
  }
}
