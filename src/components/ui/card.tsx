import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-xl bg-surface p-4 shadow-[0_0_0_1px_var(--color-line)]",
        className,
      )}
      {...props}
    />
  );
}
