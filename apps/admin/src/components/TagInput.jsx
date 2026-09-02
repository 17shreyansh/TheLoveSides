import React, { useState } from 'react';
import { X } from 'lucide-react';

export function TagInput({ tags, onChange, placeholder }) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = inputValue.trim();
      if (newTag && !tags.includes(newTag)) {
        onChange([...tags, newTag]);
      }
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  const removeTag = (indexToRemove) => {
    onChange(tags.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="flex flex-wrap items-center gap-2 p-1.5 border border-gray-300 rounded focus-within:border-pink-primary bg-white">
      {tags.map((tag, index) => (
        <span key={index} className="flex items-center gap-1 bg-ivory text-charcoal px-2 py-1 rounded-md text-sm border border-charcoal/10">
          {tag}
          <button type="button" onClick={() => removeTag(index)} className="text-charcoal/50 hover:text-red-500">
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[120px] px-2 py-1 text-sm bg-transparent outline-none"
      />
    </div>
  );
}
