import * as React from "react";
import InputMask from "react-input-mask";

import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  mask?: string;
}

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

    const combinedClassNames = cn(
      "focus-visible:ring-offset-2file:font-medium flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
      className,
    );

    if (props.mask) {
      return (
        <InputMask
          ref={ref}
          mask={props.mask}
          type="text"
          className={combinedClassNames}
          onKeyDown={handleKeyDown}
          {...props}
        />
      );
    }

    return (
      <input
        ref={ref}
        className={combinedClassNames}
        type={type}
        onKeyDown={handleKeyDown}
        {...props}
      />
    );
  },
);
NumberInput.displayName = "NumberInput";

export { NumberInput };
