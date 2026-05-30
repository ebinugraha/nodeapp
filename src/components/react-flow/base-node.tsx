import { cn } from "@/lib/utils";
import { forwardRef, type HTMLAttributes } from "react";

interface BaseNodeProps extends HTMLAttributes<HTMLDivElement> {
  status?: string;
}

export const BaseNode = forwardRef<HTMLDivElement, BaseNodeProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative rounded-xl border border-border/70 bg-card text-card-foreground shadow-sm",
        "hover:border-primary/40 hover:shadow-md",
        "transition-all duration-200 cursor-pointer overflow-hidden",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2",
        className,
      )}
      tabIndex={0}
      {...props}
    >
      {props.children}

      {/* Subtle glow/shadow overlay on hover */}
      <div className="absolute inset-0 rounded-xl shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  ),
);
BaseNode.displayName = "BaseNode";

export const BaseNodeHeader = forwardRef<
  HTMLElement,
  HTMLAttributes<HTMLElement>
>(({ className, ...props }, ref) => (
  <header
    ref={ref}
    {...props}
    className={cn(
      "mx-0 my-0 -mb-1 flex flex-row items-center justify-between gap-2 px-4 py-3",
      className,
    )}
  />
));
BaseNodeHeader.displayName = "BaseNodeHeader";

export const BaseNodeHeaderTitle = forwardRef<
  HTMLHeadingElement,
  HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    data-slot="base-node-title"
    className={cn("user-select-none flex-1 font-semibold text-sm", className)}
    {...props}
  />
));
BaseNodeHeaderTitle.displayName = "BaseNodeHeaderTitle";

export const BaseNodeContent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="base-node-content"
    className={cn("flex flex-col gap-y-3 p-4", className)}
    {...props}
  />
));
BaseNodeContent.displayName = "BaseNodeContent";

export const BaseNodeFooter = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="base-node-footer"
    className={cn(
      "flex flex-col items-center gap-y-2 border-t border-border/50 bg-muted/20 px-4 pb-4 pt-3 rounded-b-xl",
      className,
    )}
    {...props}
  />
));
BaseNodeFooter.displayName = "BaseNodeFooter";
