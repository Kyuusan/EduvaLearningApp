"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { cn } from "../../../lib/utils";

const SketchAccordion = AccordionPrimitive.Root;

const SketchAccordionItem = React.forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn(
      "group relative mb-2 overflow-hidden rounded-lg border border-neutral-200 bg-white transition-all dark:border-neutral-800 dark:bg-gray-950",
      "before:absolute before:inset-0 before:z-0 before:bg-[url('/paper-texture.png')] before:opacity-50 before:content-['']",
      className,
    )}
    {...props}
  />
));
SketchAccordionItem.displayName = "SketchAccordionItem";

const SketchAccordionTrigger = React.forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(    
        "group/trigger flex flex-1 items-center justify-between py-4 pl-4 pr-2 text-sm font-medium transition-all [&[data-state=open]>svg]:rotate-180",
        "after:absolute after:left-0 after:top-0 after:h-full after:w-1 after:bg-blue-500 after:content-[''] ",
        "hover:bg-neutral-50 dark:hover:bg-neutral-900",
        className,
      )}
      {...props}
    >
      {children}
      <div className="relative mr-2 h-5 w-5 shrink-0 overflow-hidden rounded-full border border-neutral-200 dark:border-neutral-700 cursor-pointer">
        <svg
          className="absolute inset-0 h-4 w-4 translate-x-0.5 translate-y-0.5 stroke-[1.5] transition-transform duration-200 dark:stroke-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          style={{
            filter: "url(#pencil-stroke)",
          }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
SketchAccordionTrigger.displayName = "SketchAccordionTrigger";

const SketchAccordionContent = React.forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div
      className={cn(
        "relative px-4 pb-4 pt-0",
        "after:absolute after:left-0 after:top-0 after:h-full after:w-1 after:bg-blue-500 after:content-[''] ",
        className,
      )}
    >
      {children}
    </div>
  </AccordionPrimitive.Content>
));
SketchAccordionContent.displayName = "SketchAccordionContent";

// SVG Filter for pencil effect
const PencilFilter = () => (
  <svg width="0" height="0">
    <defs>
      <filter id="pencil-stroke">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.02"
          numOctaves="1"
          result="noise"
        />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.5" />
        <feGaussianBlur stdDeviation="0.2" />
      </filter>
    </defs>
  </svg>
);

export {
  SketchAccordion,
  SketchAccordionItem,
  SketchAccordionTrigger,
  SketchAccordionContent,
  PencilFilter,
};
