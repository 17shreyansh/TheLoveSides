import sheerCurtainsImg from '../assets/images/Curtains/Sheer Curtains/146f7dfb-dc33-4161-b4e8-6c8906094255.jfif';
import blackoutCurtainsImg from '../assets/images/Curtains/Blackout Curtains/9431aca6-6464-4fe0-aae4-624b8b649665.jfif';
import rollerBlindsImg from '../assets/images/Curtains/Roller Blinds/ea90f7f9-d0d7-4012-826f-5bf81f25bc3e.jfif';
import woodenBlindsImg from '../assets/images/Curtains/Wooden Blinds/10dcdf19-8e13-43d1-bb50-dec35863b41e.jfif';
import kitchenCurtainsImg from '../assets/images/Curtains/Kitchen Curtains/4890d500-0079-4955-90b2-0aa44d281d6d.jfif';
import officeCurtainsImg from '../assets/images/Curtains/Office Curtains/4b19be4d-aeb7-46c4-b6e5-dc9113cf36e7.jfif';

export const categories = [
  {
    id: 1,
    title: 'Sheer Curtains',
    image: sheerCurtainsImg,
  },
  {
    id: 2,
    title: 'Blackout Curtains',
    image: blackoutCurtainsImg,
  },
  {
    id: 3,
    title: 'Roller Blinds',
    image: rollerBlindsImg,
  },
  {
    id: 4,
    title: 'Wooden Blinds',
    image: woodenBlindsImg,
  }
];

import premiumLinenImg from '../assets/images/Curtains/Sheer Curtains/PremiumLinen.jpeg';
import velvetBlackoutImg from '../assets/images/Curtains/Blackout Curtains/VelvetBlackout.jpeg';
import naturalBambooImg from '../assets/images/Curtains/Wooden Blinds/NaturalBamboo.jpeg';
import sheerWhiteImg from '../assets/images/Curtains/Sheer Curtains/SheerWhite.jpeg';

export const products = [
  {
    id: 101,
    name: 'Premium Linen Drapes',
    price: 189,
    rating: 4.9,
    image: premiumLinenImg,
  },
  {
    id: 102,
    name: 'Velvet Blackout Panel',
    price: 229,
    rating: 5,
    image: velvetBlackoutImg,
  },
  {
    id: 103,
    name: 'Natural Bamboo Blinds',
    price: 159,
    rating: 4.8,
    image: naturalBambooImg,
  },
  {
    id: 104,
    name: 'Sheer White Elegance',
    price: 149,
    rating: 4.9,
    image: sheerWhiteImg,
  }
];

export const rooms = [
  {
    id: 1,
    title: 'Living Room',
    image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 2,
    title: 'Bedroom',
    image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 3,
    title: 'Kitchen',
    image: kitchenCurtainsImg,
  },
  {
    id: 4,
    title: 'Office',
    image: officeCurtainsImg,
  }
];

export const features = [
  {
    id: 1,
    icon: 'Ruler',
    title: 'Free Measurement',
    description: 'Professional on-site measurement service'
  },
  {
    id: 2,
    icon: 'Sparkles',
    title: 'Custom Fit',
    description: 'Tailored to your exact specifications'
  },
  {
    id: 3,
    icon: 'Award',
    title: 'Premium Quality',
    description: 'Finest materials and craftsmanship'
  },
  {
    id: 4,
    icon: 'CheckCircle',
    title: 'Expert Installation',
    description: 'Certified installers for perfect fitting'
  }
];

export const colors = [
  { id: 1, label: 'Ivory', hex: '#F5F1E8' },
  { id: 2, label: 'Beige', hex: '#D9CFC1' },
  { id: 3, label: 'Sage', hex: '#7C9885' },
  { id: 4, label: 'Charcoal', hex: '#2B3138' },
  { id: 5, label: 'Navy', hex: '#2E4570' },
  { id: 6, label: 'Blush', hex: '#DDBFC9' },
];

export const steps = [
  {
    id: 1,
    title: 'Book Consultation',
    description: 'Schedule a free home visit'
  },
  {
    id: 2,
    title: 'Measurement',
    description: 'Precise measurements taken'
  },
  {
    id: 3,
    title: 'Customize',
    description: 'Choose fabric, style & finish'
  },
  {
    id: 4,
    title: 'Installation',
    description: 'Professional fitting included'
  }
];

export const testimonials = [
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
];

export const stats = [
  { id: 1, value: 15000, label: 'Happy Customers' },
  { id: 2, value: 25000, label: 'Projects Completed' },
  { id: 3, value: 12, label: 'Years of Excellence' }
];

export const promoOffers = [
  "Free Delivery on Orders Above ₹2999",
  "Flat 20% Off on First Order | Use Code LOVE20",
  "Premium Custom Fitting Included on All Orders",
  "New Arrivals: Explore Our Summer Collection"
];

export const navLinks = [
  { title: 'Arrivals', href: '#' },
  { title: 'Best Seller', href: '#' },
  { title: 'Curtains', href: '#' },
  { title: 'Sofa Covers', href: '#' },
  { title: 'Marble', href: '#' },
  { title: 'Accessories', href: '#' },
  { title: 'Clothing', href: '#' },
];

export const footerLinks = [
  {
    title: 'Categories',
    links: ['Curtains', 'Blinds', 'Fabrics', 'Accessories']
  },
  {
    title: 'Support',
    links: ['Contact Us', 'Measurement Guide', 'Installation', 'Warranty']
  }
];

export const socialPosts = [
  sheerCurtainsImg,
  premiumLinenImg,
  'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=800&q=80',
  blackoutCurtainsImg,
  velvetBlackoutImg,
  'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80',
];
