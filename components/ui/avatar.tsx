import * as React from "react";

import { cn } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  initials?: string;
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, initials, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border/70 bg-muted text-xs font-semibold uppercase text-muted-foreground",
          className,
        )}
        {...props}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={initials ?? "Avatar"}
            className="h-full w-full object-cover"
          />
        ) : initials ? (
          initials
        ) : (
          children ?? "CM"
        )}
      </div>
    );
  },
);
Avatar.displayName = "Avatar";

export { Avatar };
