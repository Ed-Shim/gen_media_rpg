"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const AutoResizeTextarea = React.forwardRef(({ className, ...props }, ref) => {
  const textareaRef = React.useRef(null);
  
  const adjustHeight = React.useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';
      // Set the height to match content
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, []);

  React.useEffect(() => {
    adjustHeight();
    // Add resize event listener to handle window resizing
    window.addEventListener('resize', adjustHeight);
    return () => window.removeEventListener('resize', adjustHeight);
  }, [adjustHeight]);

  return (
    <textarea
      className={cn(
        "flex min-h-[60px] w-full rounded-md bg-transparent border-hidden px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      ref={(element) => {
        // Maintain both refs
        textareaRef.current = element;
        if (typeof ref === 'function') ref(element);
        else if (ref) ref.current = element;
      }}
      onChange={(e) => {
        adjustHeight();
        props.onChange?.(e);
      }}
      {...props}
    />
  );
});

AutoResizeTextarea.displayName = "AutoResizeTextarea";

export { AutoResizeTextarea };