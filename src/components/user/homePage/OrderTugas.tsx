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

export interface DragItem {
  id: number;
  tittle: string;
  desc: string;
  deadline: string;
  link?: string;
}

interface DragOrderListProps {
  items: DragItem[];
  onReorder?: (items: DragItem[]) => void;
}

export function ListTugas({ items, onReorder }: DragOrderListProps) {
  const [list, setList] = React.useState(items);

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
  const y = useMotionValue(0);
  const boxShadow = useRaisedShadow(y);
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={item}
      style={{ boxShadow, y }}
      dragListener={false}
      dragControls={dragControls}
      className="flex justify-between items-start p-4 
        bg-white dark:bg-gray-800/50
        border border-gray-200 dark:border-gray-700
        rounded-xl 
        hover:border-gray-300 dark:hover:border-gray-600
        transition-colors duration-200"
    >
      <div className="flex flex-col space-y-1.5 flex-1 pr-3">
        <h2 className="text-base font-semibold text-gray-800 dark:text-white/90 line-clamp-1">
          {item.tittle}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {item.desc}
        </p>
        <span className="text-xs text-gray-500 dark:text-gray-500">
          {item.deadline}
        </span>
        {item.link && (
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-block text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline"
          >
            Lihat Detail →
          </a>
        )}
      </div>
      <ReorderHandle dragControls={dragControls} />
    </Reorder.Item>
  );
}

function ReorderHandle({ dragControls }: { dragControls: DragControls }) {
  return (
    <motion.div
      whileTap={{ scale: 0.95 }}
      onPointerDown={(e) => {
        e.preventDefault();
        dragControls.start(e);
      }}
      className="cursor-grab active:cursor-grabbing p-2 
        text-gray-400 dark:text-gray-500 
        hover:text-gray-600 dark:hover:text-gray-400
        hover:bg-gray-100 dark:hover:bg-gray-700/50
        rounded-lg transition-colors duration-150
        flex-shrink-0"
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