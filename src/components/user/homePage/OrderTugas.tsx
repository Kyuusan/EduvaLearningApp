"use client";

import React, { useEffect } from "react";
import {
  useMotionValue,
  Reorder,
  useDragControls,
  motion,
  animate,
  DragControls,
} from "framer-motion";
import { GripVertical } from "lucide-react";
import { useRouter } from "next/navigation";

export interface DragItem {
  id: number;
  tittle: string;
  desc: string;
  deadline: string;
  link?: string;
  courseId?: number; // Added for navigation
}

interface DragOrderListProps {
  items: DragItem[];
  onReorder?: (items: DragItem[]) => void;
}

export function ListTugas({ items, onReorder }: DragOrderListProps) {
  const [list, setList] = React.useState(items);

  useEffect(() => {
    setList(items);
  }, [items]);

  useEffect(() => {
    if (onReorder) onReorder(list);
  }, [list, onReorder]);

  return (
    <Reorder.Group
      axis="y"
      values={list}
      onReorder={setList}
      className="space-y-3 w-full"
    >
      {list.map((item) => (
        <DragOrderItem key={item.id} item={item} />
      ))}
    </Reorder.Group>
  );
}

function DragOrderItem({ item }: { item: DragItem }) {
  const router = useRouter();
  const y = useMotionValue(0);
  const boxShadow = useRaisedShadow(y);
  const dragControls = useDragControls();
  const [isDragging, setIsDragging] = React.useState(false);

  const handleClick = (e: React.MouseEvent) => {
    // Don't navigate if user is dragging
    if (isDragging) {
      return;
    }

    // Prevent navigation when clicking drag handle
    const target = e.target as HTMLElement;
    if (target.closest('[data-drag-handle]')) {
      return;
    }
    
    // Navigate to course detail page
    if (item.courseId) {
      console.log('Navigating to:', `/siswa/course/${item.courseId}`);
      router.push(`/user/course/${item.courseId}`);
    } else if (item.link) {
      console.log('Navigating to:', item.link);
      router.push(item.link);
    }
  };

  return (
    <Reorder.Item
      value={item}
      style={{ boxShadow, y }}
      dragListener={false}
      dragControls={dragControls}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => {
        // Reset dragging state after a small delay to prevent click event
        setTimeout(() => setIsDragging(false), 100);
      }}
      className="flex justify-between items-start p-4 
        bg-white dark:bg-gray-800/50
        border border-gray-200 dark:border-gray-700
        rounded-xl 
        hover:border-gray-300 dark:hover:border-gray-600
        transition-colors duration-200
        cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex flex-col space-y-1.5 flex-1 pr-3 pointer-events-none">
        <h2 className="text-base font-semibold text-gray-800 dark:text-white/90 line-clamp-1">
          {item.tittle}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {item.desc}
        </p>
        <span className="text-xs text-gray-500 dark:text-gray-500">
          {item.deadline}
        </span>
        <span className="mt-1 inline-block text-xs text-blue-600 dark:text-blue-400">
          Klik untuk lihat detail →
        </span>
      </div>
      <ReorderHandle dragControls={dragControls} />
    </Reorder.Item>
  );
}

function ReorderHandle({ dragControls }: { dragControls: DragControls }) {
  return (
    <motion.div
      data-drag-handle
      whileTap={{ scale: 0.95 }}
      onPointerDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        dragControls.start(e);
      }}
      onClick={(e) => {
        // Prevent click event from bubbling to parent
        e.stopPropagation();
      }}
      className="cursor-grab active:cursor-grabbing p-2 
        text-gray-400 dark:text-gray-500 
        hover:text-gray-600 dark:hover:text-gray-400
        hover:bg-gray-100 dark:hover:bg-gray-700/50
        rounded-lg transition-colors duration-150
        flex-shrink-0 pointer-events-auto"
    >
      <GripVertical className="w-5 h-5" />
    </motion.div>
  );
}

const inactiveShadow = "0px 0px 0px rgba(0,0,0,0)";

function useRaisedShadow(value: ReturnType<typeof useMotionValue>) {
  const boxShadow = useMotionValue(inactiveShadow);

  useEffect(() => {
    let isActive = false;
    const unsubscribe = value.on("change", (latest) => {
      const wasActive = isActive;
      if (latest !== 0) {
        isActive = true;
        if (isActive !== wasActive) {
          animate(boxShadow, "0px 8px 24px rgba(0,0,0,0.12)");
        }
      } else {
        isActive = false;
        if (isActive !== wasActive) {
          animate(boxShadow, inactiveShadow);
        }
      }
    });

    return unsubscribe;
  }, [value, boxShadow]);

  return boxShadow;
}