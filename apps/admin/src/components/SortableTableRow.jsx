import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

export function SortableTableRow({ id, children, className }) {
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
    position: 'relative',
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <tr ref={setNodeRef} style={style} className={className}>
      <td className="p-4 w-10">
        <button type="button" className="cursor-grab text-gray-400 hover:text-gray-600" {...attributes} {...listeners}>
          <GripVertical className="w-5 h-5" />
        </button>
      </td>
      {children}
    </tr>
  );
}
