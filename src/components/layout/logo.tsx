import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
  className?: string;
}

const sizes = {
  sm: { mark: 32, text: "text-base" },
  md: { mark: 40, text: "text-lg" },
  lg: { mark: 48, text: "text-xl" },
};

export function Logo({ size = "md", showWordmark = true, className }: LogoProps) {
  const { mark, text } = sizes[size];

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <svg
        width={mark}
        height={mark}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="gt-mark" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop stopColor="#8B5CF6" />
            <stop offset="1" stopColor="#2563EB" />
          </linearGradient>
        </defs>
        <rect width="48" height="48" rx="12" fill="url(#gt-mark)" />
        <circle cx="24" cy="24" r="14" stroke="white" strokeWidth="2" opacity="0.35" />
        <circle cx="24" cy="24" r="9" stroke="white" strokeWidth="2" opacity="0.55" />
        <circle cx="24" cy="24" r="4" fill="white" />
        <path
          d="M14 31L19 26L24 29.5L34 19"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M34 19H29" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M34 19V24" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      {showWordmark && (
        <div>
          <p className={cn("font-bold tracking-tight leading-none", text)}>GoalTrack</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
            Learning Command Center
          </p>
        </div>
      )}
    </div>
  );
}
