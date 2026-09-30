import React, { useEffect, useRef } from 'react';
import { Heart, MessageCircle, Play } from 'lucide-react';
import RevealOnScroll from '../ui/RevealOnScroll';
import { useTheme } from '../../context/ThemeContext';

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

/**
 * Normalizes an Instagram URL to a clean permalink suitable for embedding.
 * Strips query params and ensures a trailing slash.
 */
function normalizeInstagramUrl(url) {
  if (!url) return null;
  try {
    const parsed = new URL(url.trim());
    if (!parsed.hostname.includes('instagram.com')) return null;
    
    // Extract strictly the type (p, reel, tv) and the ID, discarding /embed/ or extra paths
    const match = parsed.pathname.match(/\/(p|reel|tv)\/([a-zA-Z0-9_-]+)/);
    if (!match) return null;
    
    return `https://www.instagram.com/${match[1]}/${match[2]}/`;
  } catch {
    return null;
  }
}

export default function SocialFeed() {
  const { socialFeed = [], socialLinks = [] } = useTheme();
  const containerRef = useRef(null);

  const instagramLinkObj = socialLinks.find(link => link.platform?.toLowerCase() === 'instagram');
  const instagramUrl = instagramLinkObj?.url || "https://www.instagram.com/thelovesides/";
  const instagramUsername = instagramUrl.replace(/\/$/, '').split('/').pop() || 'thelovesides';

  // Load Instagram embed.js and process embeds when feed changes
  useEffect(() => {
    const hasEmbeds = socialFeed.some(item => {
      const type = item.type || (item.embedUrl ? 'instagram' : 'media');
      return type === 'instagram';
    });

    if (!hasEmbeds) return;

    const processInsta = () => {
      if (window.instgrm && window.instgrm.Embeds) {
        window.instgrm.Embeds.process();
      }
    };

    if (window.instgrm && window.instgrm.Embeds) {
      // Delay slightly to ensure React has committed the DOM
      setTimeout(processInsta, 100);
    } else {
      let script = document.querySelector('script[src*="instagram.com/embed.js"]');
      if (!script) {
        script = document.createElement('script');
        script.src = 'https://www.instagram.com/embed.js';
        script.async = true;
        document.body.appendChild(script);
      }
      script.addEventListener('load', processInsta);
    }
  }, [socialFeed]);

  if (!socialFeed || socialFeed.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-cream/20 relative overflow-hidden" id="social-feed">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-ivory/50 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-ivory/50 rounded-full blur-3xl opacity-60"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10">
        
        <RevealOnScroll>
          <div className="flex flex-col items-center justify-center text-center mb-10 md:mb-16">
            <h2 className="text-sm font-sans tracking-[0.2em] md:tracking-[0.3em] text-gray-400 uppercase mb-3">
              Join Our Community
            </h2>
            <a 
              href={instagramUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-charcoal hover:text-pink-primary transition-all duration-300 transform hover:scale-105 group"
            >
              <div className="bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 p-[2px] rounded-full">
                <div className="bg-white p-2 rounded-full">
                  <InstagramIcon className="w-5 h-5 md:w-6 md:h-6 text-charcoal" strokeWidth={1.5} />
                </div>
              </div>
              <span className="font-serif text-3xl md:text-4xl lg:text-5xl tracking-wide">@{instagramUsername}</span>
            </a>
          </div>
        </RevealOnScroll>

        {/* Masonry / Grid Layout for Mixed Media and Embeds */}
        <div 
          ref={containerRef}
          className="grid grid-flow-dense grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 auto-rows-max"
        >
          {socialFeed.map((item, idx) => {
            // Determine type correctly
            const type = item.type || (item.embedUrl ? 'instagram' : 'media');
            
            if (type === 'instagram') {
              const rawUrl = item.embedUrl || item.link || (typeof item === 'string' ? item : null);
              const permalink = normalizeInstagramUrl(rawUrl);
              if (!permalink) return null;

              // Embeds span 2 columns and take auto height
              return (
                <RevealOnScroll key={item._id || idx} delay={idx * 0.1} className="col-span-2 md:col-span-2 row-span-2 w-full flex justify-center items-center">
                  <div className="w-full max-w-[540px] bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 p-2 md:p-3 overflow-hidden">
                    <div
                      className="w-full flex justify-center"
                      dangerouslySetInnerHTML={{
                        __html: `
                          <blockquote
                            class="instagram-media"
                            data-instgrm-permalink="${permalink}?utm_source=ig_embed&utm_campaign=loading"
                            data-instgrm-version="14"
                            style="background:#FFF; border:0; margin:0; padding:0; width:100%;"
                          >
                            <div style="padding:16px;">
                              <a
                                href="${permalink}?utm_source=ig_embed&utm_campaign=loading"
                                style="background:#FFFFFF; line-height:0; padding:0 0; text-align:center; text-decoration:none; width:100%;"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <div style="display: flex; flex-direction: row; align-items: center;">
                                  <div style="background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 40px; margin-right: 14px; width: 40px;"></div>
                                  <div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center;">
                                    <div style="background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; margin-bottom: 6px; width: 100px;"></div>
                                    <div style="background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; width: 60px;"></div>
                                  </div>
                                </div>
                                <div style="padding: 19% 0;"></div>
                                <div style="display:block; height:50px; margin:0 auto 12px; width:50px;">
                                  <svg width="50px" height="50px" viewBox="0 0 60 60" version="1.1" xmlns="http://www.w3.org/2000/svg">
                                    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                      <g transform="translate(-511.000000, -20.000000)" fill="#000000">
                                        <g>
                                          <path d="M556.869,30.41 C554.814,30.41 553.148,32.076 553.148,34.131 C553.148,36.186 554.814,37.852 556.869,37.852 C558.924,37.852 560.59,36.186 560.59,34.131 C560.59,32.076 558.924,30.41 556.869,30.41 M541,60.657 C535.114,60.657 530.342,55.887 530.342,50 C530.342,44.114 535.114,39.342 541,39.342 C546.887,39.342 551.658,44.114 551.658,50 C551.658,55.887 546.887,60.657 541,60.657 M541,33.886 C532.1,33.886 524.886,41.1 524.886,50 C524.886,58.899 532.1,66.113 541,66.113 C549.9,66.113 557.115,58.899 557.115,50 C557.115,41.1 549.9,33.886 541,33.886 M565.378,62.101 C565.244,65.022 564.756,66.606 564.346,67.663 C563.803,69.06 563.154,70.057 562.106,71.106 C561.058,72.155 560.06,72.803 558.662,73.347 C557.607,73.757 556.021,74.244 553.102,74.378 C549.944,74.521 548.997,74.552 541,74.552 C533.003,74.552 532.056,74.521 528.898,74.378 C525.979,74.244 524.393,73.757 523.338,73.347 C521.94,72.803 520.942,72.155 519.894,71.106 C518.846,70.057 518.197,69.06 517.654,67.663 C517.244,66.606 516.755,65.022 516.623,62.101 C516.479,58.943 516.448,57.996 516.448,50 C516.448,42.003 516.479,41.056 516.623,37.899 C516.755,34.978 517.244,33.391 517.654,32.338 C518.197,30.938 518.846,29.942 519.894,28.894 C520.942,27.846 521.94,27.196 523.338,26.654 C524.393,26.244 525.979,25.756 528.898,25.623 C532.057,25.479 533.004,25.448 541,25.448 C548.997,25.448 549.943,25.479 553.102,25.623 C556.021,25.756 557.607,26.244 558.662,26.654 C560.06,27.196 561.058,27.846 562.106,28.894 C563.154,29.942 563.803,30.938 564.346,32.338 C564.756,33.391 565.244,34.978 565.378,37.899 C565.522,41.056 565.552,42.003 565.552,50 C565.552,57.996 565.522,58.943 565.378,62.101 M570.82,37.631 C570.674,34.438 570.167,32.258 569.425,30.349 C568.659,28.377 567.633,26.702 565.965,25.035 C564.297,23.368 562.623,22.342 560.652,21.575 C558.743,20.834 556.562,20.326 553.369,20.18 C550.169,20.033 549.148,20 541,20 C532.853,20 531.831,20.033 528.631,20.18 C525.438,20.326 523.257,20.834 521.349,21.575 C519.376,22.342 517.703,23.368 516.035,25.035 C514.368,26.702 513.342,28.377 512.574,30.349 C511.834,32.258 511.326,34.438 511.181,37.631 C511.035,40.831 511,41.851 511,50 C511,58.147 511.035,59.17 511.181,62.369 C511.326,65.562 511.834,67.743 512.574,69.651 C513.342,71.625 514.368,73.296 516.035,74.965 C517.703,76.634 519.376,77.658 521.349,78.425 C523.257,79.167 525.438,79.673 528.631,79.82 C531.831,79.965 532.853,80.001 541,80.001 C549.148,80.001 550.169,79.965 553.369,79.82 C556.562,79.673 558.743,79.167 560.652,78.425 C562.623,77.658 564.297,76.634 565.965,74.965 C567.633,73.296 568.659,71.625 569.425,69.651 C570.167,67.743 570.674,65.562 570.82,62.369 C570.966,59.17 571,58.147 571,50 C571,41.851 570.966,40.831 570.82,37.631"></path>
                                        </g>
                                      </g>
                                    </g>
                                  </svg>
                                </div>
                                <div style="padding-top: 8px;">
                                  <div style="color:#3897f0; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:550; line-height:18px;">
                                    View this post on Instagram
                                  </div>
                                </div>
                              </a>
                            </div>
                          </blockquote>
                        `
                      }}
                    />
                  </div>
                </RevealOnScroll>
              );
            } else {
              // For Media Uploads, restore the original hover layout logic
              const imgUrl = item.mediaUrl || item.image;
              const postLink = item.link || null; // optional link if user had old data
              const isVideo = imgUrl && imgUrl.match(/\.(mp4|webm|mov)$/i);

              let spanClasses = "";
              let hasPlayIcon = isVideo;
              let pos = idx % 6;

              if (pos === 0) {
                spanClasses = "row-span-2 col-span-1"; // Col 1 (Tall)
              } else if (pos === 1) {
                spanClasses = "row-span-1 col-span-1"; // Col 2 Top
              } else if (pos === 2) {
                spanClasses = "row-span-1 col-span-1"; // Col 3 Top
              } else if (pos === 3) {
                spanClasses = "row-span-2 col-span-1"; // Col 4 (Tall)
              } else if (pos === 4) {
                spanClasses = "row-span-1 col-span-1"; // Col 2 Bottom
              } else if (pos === 5) {
                spanClasses = "row-span-1 col-span-1"; // Col 3 Bottom
              }

              return (
                <RevealOnScroll 
                  key={item._id || idx} 
                  delay={idx * 0.1} 
                  className={`group relative rounded-2xl overflow-hidden cursor-pointer ${spanClasses} h-[150px] sm:h-[200px] md:h-[250px] shadow-sm hover:shadow-2xl transition-all duration-500 bg-white ${spanClasses.includes('row-span-2') ? '!h-full min-h-[310px] sm:min-h-[416px] md:min-h-[520px]' : ''}`}
                >
                  {postLink ? (
                    <a href={postLink} target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-30">
                      <span className="sr-only">View Media</span>
                    </a>
                  ) : null}

                  {imgUrl ? (
                    isVideo ? (
                      <video 
                        src={imgUrl} 
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        autoPlay
                        loop
                        muted
                        playsInline
                      />
                    ) : (
                      <img 
                        src={imgUrl} 
                        alt={`Social post ${idx + 1}`} 
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    )
                  ) : (
                    <div className="absolute inset-0 w-full h-full bg-gray-50 flex flex-col items-center justify-center p-4 text-center border border-dashed border-gray-200">
                      <span className="text-xs text-gray-400 font-medium mb-1">Media Required</span>
                    </div>
                  )}
                  
                  {hasPlayIcon && (
                    <div className="absolute top-4 right-4 text-white bg-black/30 backdrop-blur-md rounded-full p-2 shadow-lg z-10 transition-transform duration-300 group-hover:scale-110">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  )}

                  {/* Gradient Overlay for Readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>

                  {/* Hover Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col items-center justify-end gap-3 text-white opacity-0 group-hover:opacity-100 transition-all duration-500 z-20 translate-y-4 group-hover:translate-y-0">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Heart className="w-5 h-5 fill-current hover:text-pink-400 transition-colors" />
                        <span className="font-semibold text-sm">{(2.1 + idx * 0.4).toFixed(1)}k</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 fill-current hover:text-blue-400 transition-colors" />
                        <span className="font-semibold text-sm">{103 + idx * 24}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Insta icon in corner */}
                  <div className="absolute top-4 left-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20 delay-100">
                    <InstagramIcon className="w-6 h-6 drop-shadow-md" strokeWidth={2} />
                  </div>
                </RevealOnScroll>
              );
            }
          })}
        </div>

        <RevealOnScroll delay={0.2}>
          <div className="mt-12 flex justify-center">
            <a 
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 px-8 py-3.5 bg-charcoal text-white rounded-full font-medium hover:bg-black transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1"
            >
              <span>Follow Us</span>
              <InstagramIcon className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
            </a>
          </div>
        </RevealOnScroll>

      </div>
    </section>
  );
}
