import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X } from 'lucide-react';

export function SortableGridItem({ id, url, onRemove, isMain }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group rounded-xl border border-charcoal/10 bg-white overflow-hidden shadow-sm aspect-square">
      <img src={url} alt="Product Media" className="w-full h-full object-cover" />
      
      {isMain && (
        <div className="absolute top-2 left-2 bg-pink-primary text-white text-xs px-2 py-1 rounded-md shadow">
          Main
        </div>
      )}

      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <button 
          type="button" 
          className="p-2 bg-white text-charcoal rounded-full hover:bg-gray-100 cursor-grab active:cursor-grabbing shadow-sm"
          {...attributes} 
          {...listeners}
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <button 
          type="button" 
          onClick={() => onRemove(id)}
          className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-sm"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
