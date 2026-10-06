import React from 'react';
import Hero from '../components/home/Hero';
import img1 from '../assets/img1.PNG';
import img2 from '../assets/img2.PNG';
import img3 from '../assets/img3.PNG';
import img4 from '../assets/img4.PNG';

import CategoryShowcase from '../components/home/CategoryShowcase';
import CollectionShowcase from '../components/home/CollectionShowcase';
import BestSellers from '../components/home/BestSellers';
import ShopByRoom from '../components/home/ShopByRoom';
import WhyChooseUs from '../components/home/WhyChooseUs';
import FeaturedProducts from '../components/home/FeaturedProducts';
import ShopByColor from '../components/home/ShopByColor';
import HowItWorks from '../components/home/HowItWorks';
import Testimonials from '../components/home/Testimonials';
import SocialFeed from '../components/home/SocialFeed';
import StatsCounter from '../components/home/StatsCounter';
import SignatureSection from '../components/home/SignatureSection';
import { useTheme } from '../context/ThemeContext';

export default function Home() {
  const { homeSections, signatures, contactInfo } = useTheme();

  const phoneNumber = contactInfo?.phone ? contactInfo.phone.replace(/\D/g, '') : '919738409668';
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=Hi!%20I'd%20like%20to%20know%20more%20about%20your%20products.`;

  return (
    <div className="flex flex-col w-full">
      <Hero />

      <CategoryShowcase />
      <div className="w-full">
        <img src={img2} alt="Shop by Category Image" className="w-full h-auto object-cover" />
      </div>
      <div className="w-full">
        <img src={img3} alt="Additional Category Image" className="w-full h-auto object-cover" />
      </div>
      <CollectionShowcase />
      <div className="w-full">
        <img src={img1} alt="Explore Our Collection Image" className="w-full h-auto object-cover" />
      </div>
      {homeSections?.showBestSellers !== false && <BestSellers mode={homeSections?.bestSellersMode || 'manual'} />}
      <div className="w-full">
        <a 
          href={whatsappUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="block w-full hover:opacity-95 transition-opacity duration-300"
        >
          <img src={img4} alt="Banner" className="block w-full h-auto object-cover" />
        </a>
      </div>
      <ShopByRoom />
      <WhyChooseUs />
      {homeSections?.showFeatured !== false && <FeaturedProducts />}
      <ShopByColor />
      <HowItWorks />
      
      {/* Dynamic Signatures */}
      {(signatures || []).map(sig => (
        <SignatureSection key={sig._id} signature={sig} />
      ))}

      <Testimonials />
      <SocialFeed />
      <StatsCounter />
    </div>
  );
}
