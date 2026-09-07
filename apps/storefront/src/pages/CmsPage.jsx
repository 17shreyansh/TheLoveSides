import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { api } from '../lib/api';
import RevealOnScroll from '../components/ui/RevealOnScroll';

export default function CmsPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/pages/${slug}`);
        setPage(data.data);
        setError(false);
        // Update document title and meta description dynamically
        if (data.data.seo?.metaTitle) {
          document.title = `${data.data.seo.metaTitle} | The Love Sides`;
        } else {
          document.title = `${data.data.title} | The Love Sides`;
        }
      } catch (err) {
        console.error('Failed to fetch CMS page:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-cream">
        <div className="animate-pulse space-y-4 w-full max-w-4xl px-6">
          <div className="h-8 bg-charcoal/10 rounded w-1/3 mx-auto"></div>
          <div className="h-4 bg-charcoal/5 rounded w-1/2 mx-auto"></div>
          <div className="space-y-2 mt-12">
            <div className="h-4 bg-charcoal/5 rounded w-full"></div>
            <div className="h-4 bg-charcoal/5 rounded w-full"></div>
            <div className="h-4 bg-charcoal/5 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-cream text-center px-6">
        <h1 className="text-4xl font-serif text-charcoal mb-4">Page Not Found</h1>
        <p className="text-gray-600 mb-8 max-w-md">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-charcoal text-white px-8 py-3 rounded-full hover:bg-black transition-colors"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="bg-cream min-h-screen pb-16">
      {/* Header Area */}
      <div className="pt-28 md:pt-36 pb-8 md:pb-12 border-b border-charcoal/10">
        <div className="max-w-4xl mx-auto px-6 md:px-10">
          <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500 mb-4 font-sans">
            <Link to="/" className="hover:text-brand transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-charcoal font-medium">{page.title}</span>
          </div>
          
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-charcoal font-normal tracking-tight mb-2">
            {page.title}
          </h1>
          
          {page.updatedAt && (
            <p className="text-xs text-gray-500 mt-4">
              Last updated: {new Date(page.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          )}
        </div>
      </div>

      {/* Content Area with Tailwind Typography (prose) */}
      <RevealOnScroll>
        <div className="max-w-4xl mx-auto px-6 md:px-10 py-12 md:py-16">
          <div 
            className="prose prose-sm md:prose-base lg:prose-lg prose-charcoal prose-headings:font-serif prose-headings:font-normal prose-a:text-brand hover:prose-a:text-brand-dark max-w-none"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </div>
      </RevealOnScroll>
    </div>
  );
}
