import React from 'react';
import Hero from '../components/home/Hero';
import NavbarRibbon from '../components/layout/NavbarRibbon';
import CategoryShowcase from '../components/home/CategoryShowcase';
import BestSellers from '../components/home/BestSellers';
import PromoBanner from '../components/home/PromoBanner';
import ShopByRoom from '../components/home/ShopByRoom';
import WhyChooseUs from '../components/home/WhyChooseUs';
import FeatureCollection from '../components/home/FeatureCollection';
import ShopByColor from '../components/home/ShopByColor';
import HowItWorks from '../components/home/HowItWorks';
import Testimonials from '../components/home/Testimonials';
import SocialFeed from '../components/home/SocialFeed';
import StatsCounter from '../components/home/StatsCounter';

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      <Hero />
      <NavbarRibbon isVisible={true} />
      <CategoryShowcase />
      <BestSellers />
      <PromoBanner />
      <ShopByRoom />
      <WhyChooseUs />
      <FeatureCollection />
      <ShopByColor />
      <HowItWorks />
      <Testimonials />
      <SocialFeed />
      <StatsCounter />
    </div>
  );
}
