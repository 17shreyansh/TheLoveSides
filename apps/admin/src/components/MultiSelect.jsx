import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Check } from 'lucide-react';

export function MultiSelect({ options, selectedIds, onChange, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (id) => {
    const newSelected = selectedIds.includes(id)
      ? selectedIds.filter(selectedId => selectedId !== id)
      : [...selectedIds, id];
    onChange(newSelected);
  };

  const selectedOptions = options.filter(opt => selectedIds.includes(opt._id));

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        className="min-h-[42px] w-full px-3 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer flex flex-wrap gap-2 items-center justify-between transition-colors focus-within:border-pink-primary focus-within:ring-1 focus-within:ring-pink-primary"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-1 flex-1">
          {selectedOptions.length === 0 ? (
            <span className="text-gray-400 text-sm">{placeholder}</span>
          ) : (
            selectedOptions.map(opt => (
              <span key={opt._id} className="inline-flex items-center gap-1 bg-ivory text-charcoal px-2 py-0.5 rounded text-xs border border-charcoal/10">
                {opt.name}
                <span 
                  className="hover:text-red-500 cursor-pointer p-0.5"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleOption(opt._id);
                  }}
                >
                  <X className="w-3 h-3" />
                </span>
              </span>
            ))
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {options.length === 0 ? (
            <div className="p-3 text-sm text-gray-500 text-center">No options available</div>
          ) : (
            options.map(opt => {
              const isSelected = selectedIds.includes(opt._id);
              return (
                <div 
                  key={opt._id}
                  className={`px-3 py-2 text-sm cursor-pointer flex items-center justify-between hover:bg-gray-50 transition-colors ${isSelected ? 'bg-pink-50/50 text-pink-primary font-medium' : 'text-charcoal'}`}
                  onClick={() => toggleOption(opt._id)}
                >
                  {opt.name}
                  {isSelected && <Check className="w-4 h-4 text-pink-primary" />}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
