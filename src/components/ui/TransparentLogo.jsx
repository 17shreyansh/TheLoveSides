import React, { useEffect, useState } from 'react';

export default function TransparentLogo({ src, className, alt, invert = false }) {
  const [dataUrl, setDataUrl] = useState(src);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.crossOrigin = "Anonymous";
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i+1];
        const b = data[i+2];
        
        if (invert) {
          // For dark backgrounds: convert black text to white text, and white bg to transparent
          const brightness = (r + g + b) / 3;
          const alpha = 255 - brightness; // Darker pixels become more opaque
          data[i] = 255;     // R -> White
          data[i+1] = 255;   // G -> White
          data[i+2] = 255;   // B -> White
          data[i+3] = alpha; // A
        } else {
          // For light backgrounds: keep colors, but make white/near-white transparent
          const distanceToWhite = Math.sqrt(
            Math.pow(255 - r, 2) + 
            Math.pow(255 - g, 2) + 
            Math.pow(255 - b, 2)
          );
          
          if (distanceToWhite < 80) {
            // Map distance 0 (pure white) to alpha 0
            // Map distance 80 to alpha 255 (fully opaque)
            data[i+3] = Math.floor((distanceToWhite / 80) * 255);
          }
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
      setDataUrl(canvas.toDataURL('image/png'));
    };
  }, [src, invert]);

  return <img src={dataUrl} className={className} alt={alt} />;
}
