import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-md bg-elevated px-3 text-sm text-fg shadow-[0_0_0_1px_var(--color-line)] placeholder:text-subtle",
        "transition-shadow duration-150 focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_var(--color-brand)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        "flex min-h-24 w-full rounded-md bg-elevated px-3 py-2 text-sm text-fg shadow-[0_0_0_1px_var(--color-line)] placeholder:text-subtle",
        "transition-shadow duration-150 focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_var(--color-brand)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";
