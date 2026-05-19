import { cn } from "@/lib/utils";
import { forwardRef, type HTMLAttributes } from "react";
import { NodeStatus } from "./node-status-indicator";
import { CheckIcon, Loader2Icon, XIcon } from "lucide-react";

interface BaseNodeProps extends HTMLAttributes<HTMLDivElement> {
  status?: NodeStatus;
}

export const BaseNode = forwardRef<HTMLDivElement, BaseNodeProps>(
  ({ className, status, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        // Base styling
        "relative rounded-xl border-2 border-border bg-card text-card-foreground shadow-sm",
        // Hover effects
        "hover:border-primary/40 hover:shadow-md hover:scale-[1.02]",
        "transition-all duration-200 cursor-pointer",
        // Focus styling
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2",
        className,
      )}
      tabIndex={0}
      {...props}
    >
      {props.children}

      {/* Status indicator badges */}
      <div className="absolute -top-2 -right-2">
        {status === "error" && (
          <div className="size-5 rounded-full bg-red-500 flex items-center justify-center shadow-sm border-2 border-background">
            <XIcon className="size-3 text-white" />
          </div>
        )}
        {status === "success" && (
          <div className="size-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm border-2 border-background">
            <CheckIcon className="size-3 text-white" />
          </div>
        )}
        {status === "loading" && (
          <div className="size-5 rounded-full bg-blue-500 flex items-center justify-center shadow-sm border-2 border-background">
            <Loader2Icon className="size-3 text-white animate-spin" />
          </div>
        )}
      </div>

      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 rounded-xl bg-linear-to-br from-primary/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  ),
);
BaseNode.displayName = "BaseNode";

/**
 * A container for a consistent header layout intended to be used inside the
 * `<BaseNode />` component.
 */
export const BaseNodeHeader = forwardRef<
  HTMLElement,
  HTMLAttributes<HTMLElement>
>(({ className, ...props }, ref) => (
  <header
    ref={ref}
    {...props}
    className={cn(
      "mx-0 my-0 -mb-1 flex flex-row items-center justify-between gap-2 px-4 py-3",
      // Remove or modify these classes if you modify the padding in the
      // `<BaseNode />` component.
      className,
    )}
  />
));
BaseNodeHeader.displayName = "BaseNodeHeader";

/**
 * The title text for the node. To maintain a native application feel, the title
 * text is not selectable.
 */
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