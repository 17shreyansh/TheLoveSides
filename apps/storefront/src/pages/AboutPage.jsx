import React from 'react';
import { Shield, Leaf, Heart, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <div className="flex flex-col w-full min-h-screen bg-cream">
      {/* Hero Section */}
      <section className="relative pt-32 md:pt-40 pb-20 bg-ivory border-b border-gray-100 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-charcoal mb-6">Our Story</h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Crafting beautiful, bespoke curtains that transform houses into homes. We believe every window deserves to be dressed in elegance.
          </p>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="w-full lg:w-1/2">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl relative">
                <img 
                  src="https://images.unsplash.com/photo-1513694203232-719a280e022f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                  alt="Crafting curtains" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/10 ring-1 ring-inset ring-black/10 rounded-2xl"></div>
              </div>
            </div>
            <div className="w-full lg:w-1/2 space-y-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-serif text-charcoal mb-4">A Passion for Perfection</h2>
                <div className="w-20 h-1 bg-pink-primary mb-6"></div>
                <p className="text-gray-600 leading-relaxed text-lg mb-6">
                  At TheLoveSides, our journey began with a simple idea: that window treatments shouldn't just be functional, they should be a statement of style and personality.
                </p>
                <p className="text-gray-600 leading-relaxed text-lg">
                  For years, we've sourced the finest fabrics from around the globe, partnering with master artisans to deliver curtains that not only control light and provide privacy, but also elevate the aesthetic of any room.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
                <div>
                  <h3 className="text-xl font-serif text-charcoal mb-2">Our Mission</h3>
                  <p className="text-gray-500">To inspire and empower you to create living spaces you truly love, one window at a time.</p>
                </div>
                <div>
                  <h3 className="text-xl font-serif text-charcoal mb-2">Our Vision</h3>
                  <p className="text-gray-500">Becoming the most trusted name in premium, bespoke home furnishings globally.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-ivory">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif text-charcoal mb-4">What We Stand For</h2>
            <div className="w-20 h-1 bg-pink-primary mx-auto mb-6"></div>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Our core values guide every stitch, every interaction, and every decision we make as a brand.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Award, title: "Premium Quality", desc: "We never compromise on the quality of our fabrics or our craftsmanship." },
              { icon: Shield, title: "Trust & Transparency", desc: "Honest pricing, clear communication, and reliable delivery." },
              { icon: Leaf, title: "Sustainability", desc: "Committed to eco-friendly practices and ethically sourced materials." },
              { icon: Heart, title: "Customer First", desc: "Your satisfaction is at the heart of everything we do." },
            ].map((value, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:-translate-y-1 transition-transform duration-300">
                <div className="w-14 h-14 mx-auto bg-pink-50 text-pink-primary rounded-full flex items-center justify-center mb-6">
                  <value.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-serif text-charcoal mb-3">{value.title}</h3>
                <p className="text-gray-500">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-charcoal"></div>
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1598928636135-d146006ff4be?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center mix-blend-overlay" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-serif mb-6">Ready to Transform Your Space?</h2>
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Explore our exclusive collections and find the perfect match for your home today.
          </p>
          <Link to="/products" className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-charcoal bg-white rounded-full hover:bg-gray-100 transition-colors shadow-lg">
            Shop Collections
          </Link>
        </div>
      </section>
    </div>
  );
}
