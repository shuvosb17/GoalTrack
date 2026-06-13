import { cn } from "@/lib/utils";
import type { TablerIcon } from "@tabler/icons-react";

interface SectionHeadingProps {
  children: React.ReactNode;
  icon?: TablerIcon;
  className?: string;
}

export function SectionHeading({ children, icon: Icon, className }: SectionHeadingProps) {
  return (
    <h2
      className={cn(
        "section-heading mb-4 flex items-center gap-2 border-b border-white/[0.06] pb-2 text-sm font-medium text-muted-foreground",
        className
      )}
    >
      {Icon && <Icon className="h-4 w-4 shrink-0 opacity-70" stroke={1.5} />}
      {children}
    </h2>
  );
}
