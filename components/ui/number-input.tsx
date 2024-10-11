import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const NumberInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    const handleKeyDown = (event) => {
      const { key, target } = event;

      if (props.id === "year") {
        if (target.value > new Date().getFullYear()) {
          target.value = new Date().getFullYear().toString();
          event.preventDefault();
        }
      }

      // Allow: backspace, delete, tab, escape, enter, and arrow keys
      if (
        key === "Backspace" ||
        key === "Delete" ||
        key === "Tab" ||
        key === "Escape" ||
        key === "Enter" ||
        key === "ArrowUp" ||
        key === "ArrowDown" ||
        key === "ArrowLeft" ||
        key === "ArrowRight"
      ) {
        return; // Allow these keys
      }

      // Allow only numbers and the period (for decimal)
      if (!/^[0-9]$/.test(key) && key !== ".") {
        event.preventDefault(); // Prevent the default action if the key is not allowed
      }
    };
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={ref}
        onKeyDown={handleKeyDown}
        {...props}
      />
    );
  },
);
NumberInput.displayName = "NumberInput";

export { NumberInput };
