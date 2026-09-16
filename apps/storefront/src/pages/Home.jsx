import React from 'react';
import Hero from '../components/home/Hero';

import CategoryShowcase from '../components/home/CategoryShowcase';
import BestSellers from '../components/home/BestSellers';
import PromoBanner from '../components/home/PromoBanner';
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
  const { homeSections, signatures } = useTheme();

  return (
    <div className="flex flex-col w-full">
      <Hero />

      <CategoryShowcase />
      {homeSections?.showBestSellers !== false && <BestSellers mode={homeSections?.bestSellersMode || 'manual'} />}
      <PromoBanner />
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
