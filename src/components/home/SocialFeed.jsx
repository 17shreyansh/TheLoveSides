import React from 'react';
import { Heart, MessageCircle, Send, MoreHorizontal, Bookmark } from 'lucide-react';
import SectionHeading from '../ui/SectionHeading';
import RevealOnScroll from '../ui/RevealOnScroll';
import { socialPosts } from '../../data/homeData';
import logoImg from '../../assets/images/Logo.jpeg';

// Custom SVG for Instagram since lucide-react removed brand icons
const InstagramIcon = ({ className, strokeWidth = 1.5 }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth} 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const captions = [
  "Loving this new sheer curtain setup! ✨ Perfect for letting in that natural morning light. #interiordesign #curtains",
  "Transform your space into a sanctuary with our premium blackout drapes. 🌙 #homedecor #premium",
  "It's all in the details. Custom fitting makes all the difference! 🧵 #thelovesides #custommade",
  "Bringing that natural, elegant texture to the living space. 🌿 #home #nature"
];

export default function SocialFeed() {
  return (
    <section className="py-20 md:py-32 bg-cream/30 relative overflow-hidden" id="social-feed">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-ivory rounded-full blur-3xl opacity-60"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-ivory rounded-full blur-3xl opacity-60"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10">
        <RevealOnScroll>
          <div className="flex flex-col items-center justify-center text-center mb-16">
            <SectionHeading 
              title="Join Our Community" 
              subtitle="Follow @TheLoveSides for daily inspiration, new arrivals, and styling tips."
              className="!mb-6"
            />
            <a 
              href="#" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-navy-dark text-white font-sans font-medium hover:bg-navy hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
            >
              <InstagramIcon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" strokeWidth={2} />
              <span>Follow Us</span>
            </a>
          </div>
        </RevealOnScroll>

        <style>{`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>

        <div className="flex overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 pb-8 md:pb-12 snap-x snap-mandatory hide-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
          {socialPosts.slice(0, 4).map((img, idx) => (
            <RevealOnScroll key={idx} delay={idx * 0.1} className="flex-shrink-0 w-[85vw] sm:w-[60vw] md:w-auto snap-center">
              <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100 overflow-hidden flex flex-col group h-full">
                
                {/* Instagram Header */}
                <div className="flex items-center justify-between p-3 md:p-4 bg-white">
                  <div className="flex items-center gap-3">
                    {/* Instagram Story Ring Effect */}
                    <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 cursor-pointer">
                      <div className="w-full h-full rounded-full bg-white p-[2px] overflow-hidden">
                        <img src={logoImg} alt="TheLoveSides" className="w-full h-full rounded-full object-cover" />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-sans font-semibold text-sm text-charcoal leading-none cursor-pointer">thelovesides</span>
                    </div>
                  </div>
                  <MoreHorizontal className="w-5 h-5 text-gray-500 cursor-pointer" />
                </div>

                {/* Post Image */}
                <a href="#" className="relative aspect-square overflow-hidden block">
                  <img 
                    src={img} 
                    alt={`Social feed post ${idx + 1}`} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <InstagramIcon className="w-10 h-10 text-white drop-shadow-md transform scale-50 group-hover:scale-100 transition-transform duration-300" strokeWidth={1.5} />
                  </div>
                </a>

                {/* Instagram Footer */}
                <div className="p-3 md:p-4 bg-white flex flex-col flex-grow">
                  {/* Action Icons */}
                  <div className="flex justify-between items-center mb-2 text-charcoal">
                    <div className="flex gap-4">
                      <Heart className="w-6 h-6 hover:text-red-500 cursor-pointer transition-colors" />
                      <MessageCircle className="w-6 h-6 hover:text-gray-500 cursor-pointer transition-colors" />
                      <Send className="w-6 h-6 hover:text-gray-500 cursor-pointer transition-colors" />
                    </div>
                    <Bookmark className="w-6 h-6 hover:text-gray-500 cursor-pointer transition-colors" />
                  </div>
                  
                  {/* Likes */}
                  <div className="font-sans font-semibold text-sm text-charcoal mb-2 cursor-pointer">
                    {(1245 + idx * 87).toLocaleString()} likes
                  </div>

                  {/* Caption */}
                  <p className="text-sm font-sans text-gray-800 leading-snug line-clamp-2 mb-1">
                    <span className="font-bold mr-2 text-charcoal cursor-pointer">thelovesides</span>
                    {captions[idx]}
                  </p>

                  {/* Comments & Timestamp */}
                  <span className="text-gray-500 text-sm font-sans cursor-pointer mb-1 hover:underline">
                    View all {48 + idx * 12} comments
                  </span>
                  <span className="text-gray-400 text-[10px] font-sans tracking-wide uppercase mt-1">
                    {idx === 0 ? '5 HOURS AGO' : `${idx * 2} DAYS AGO`}
                  </span>
                </div>

              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
