import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Check } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableTag({ id, children, onRemove }) {
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
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <span 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className="inline-flex items-center gap-1 bg-ivory text-charcoal px-2 py-0.5 rounded text-xs border border-charcoal/10 cursor-grab active:cursor-grabbing"
    >
      {children}
      <span 
        className="hover:text-red-500 cursor-pointer p-0.5 z-10 relative"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
      >
        <X className="w-3 h-3" />
      </span>
    </span>
  );
}

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

  const selectedOptions = selectedIds
    .map(id => options.find(opt => opt._id === id))
    .filter(Boolean);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (active.id !== over?.id) {
      const oldIndex = selectedIds.indexOf(active.id);
      const newIndex = selectedIds.indexOf(over.id);
      
      onChange(arrayMove(selectedIds, oldIndex, newIndex));
    }
  };

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
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={selectedIds} strategy={horizontalListSortingStrategy}>
                {selectedOptions.map(opt => (
                  <SortableTag 
                    key={opt._id} 
                    id={opt._id}
                    onRemove={() => toggleOption(opt._id)}
                  >
                    {opt.name}
                  </SortableTag>
                ))}
              </SortableContext>
            </DndContext>
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
