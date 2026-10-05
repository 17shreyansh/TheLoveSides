import React from 'react';
import { Shield, Leaf, Heart, Award, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <div className="flex flex-col w-full min-h-screen bg-cream">
      {/* Hero Section */}
      <section className="relative pt-32 md:pt-40 pb-20 bg-ivory border-b border-gray-100 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-charcoal mb-6">About The Love Sides</h1>
          <p className="text-xl md:text-2xl text-pink-primary font-medium max-w-2xl mx-auto">
            Where Every Side Feels Like Home.
          </p>
        </div>
      </section>

      {/* Main Story Section */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="w-full lg:w-1/2">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl relative group">
                <img 
                  src="https://images.unsplash.com/photo-1513694203232-719a280e022f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                  alt="Beautiful Curtains" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                <div className="absolute inset-0 bg-black/10 ring-1 ring-inset ring-black/10 rounded-2xl"></div>
              </div>
            </div>
            
            <div className="w-full lg:w-1/2 space-y-8">
              <div className="prose prose-lg">
                <div className="flex items-center gap-3 mb-6">
                  <Sparkles className="w-6 h-6 text-pink-primary" />
                  <h2 className="text-3xl md:text-4xl font-serif text-charcoal m-0">Our Philosophy</h2>
                </div>
                
                <div className="w-20 h-1 bg-pink-primary mb-8"></div>
                
                <p className="text-gray-700 leading-relaxed text-lg mb-6">
                  At The Love Sides, we believe that every corner of your home deserves to be beautiful. The name <span className="font-medium text-charcoal">The Love Sides</span> comes from the feeling we want to create — a space so beautifully decorated that every side you look at becomes your favourite side.
                </p>
                
                <p className="text-gray-700 leading-relaxed text-lg mb-6">
                  Our curtains are designed to bring that feeling into your home. From elegant ruffles and soft, flowing fabrics to beautiful colours and thoughtful details, every piece is created to add warmth, character and a touch of luxury to your space.
                </p>
                
                <p className="text-gray-700 leading-relaxed text-lg mb-6">
                  Whether it's your bedroom, living room, window corner or a cosy little space, our curtains are made to blend beautifully and transform the way your space feels.
                </p>
                
                <p className="text-gray-700 leading-relaxed text-lg italic border-l-4 border-pink-primary pl-6 py-2 my-8 bg-pink-50/50 rounded-r-lg">
                  Because sometimes, it's not about changing the whole room — it's about adding the right detail that makes you fall in love with it all over again. ❤️
                </p>

                <p className="text-xl font-serif text-pink-primary font-medium mt-8 text-center sm:text-left">
                  The Love Sides — Love every side of your home.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values (Kept for layout completeness, complementing the new text) */}
      <section className="py-24 bg-ivory">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif text-charcoal mb-4">What We Stand For</h2>
            <div className="w-20 h-1 bg-pink-primary mx-auto mb-6"></div>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Our core values guide every stitch, every interaction, and every decision we make to ensure every side of your home is beautiful.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Award, title: "Premium Quality", desc: "We never compromise on the quality of our fabrics or our craftsmanship." },
              { icon: Shield, title: "Trust & Transparency", desc: "Honest pricing, clear communication, and reliable delivery." },
              { icon: Leaf, title: "Thoughtful Details", desc: "Every piece is created with elegant ruffles, soft fabrics, and beautiful colors." },
              { icon: Heart, title: "Customer First", desc: "Your satisfaction is at the heart of everything we do." },
            ].map((value, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:-translate-y-1 transition-transform duration-300 group">
                <div className="w-14 h-14 mx-auto bg-pink-50 text-pink-primary rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
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
            Find the right detail that makes you fall in love with your home all over again.
          </p>
          <Link to="/products" className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-charcoal bg-white rounded-full hover:bg-gray-100 transition-colors shadow-lg">
            Shop Collections
          </Link>
        </div>
      </section>
    </div>
  );
}
