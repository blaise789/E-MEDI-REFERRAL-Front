export function InnSyncLogo({ className = "h-8 w-auto" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="INN-SYNC"
    >
      <circle cx="20" cy="20" r="18" className="fill-primary" />

      <rect x="14" y="11" width="3" height="18" rx="1.5" className="fill-primary-foreground" />

      <path
        d="M 22 13 Q 26 11, 26 15 Q 26 17, 24 18 Q 26 19, 26 21 Q 26 25, 22 27"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        className="text-primary-foreground"
      />

      <text
        x="46"
        y="27"
        className="fill-foreground"
        style={{
          fontFamily: "system-ui, sans-serif",
          fontSize: "22px",
          fontWeight: "700",
          letterSpacing: "-0.02em",
        }}
      >
        INN-SYNC
      </text>

      <text
        x="46"
        y="35"
        className="fill-muted-foreground"
        style={{
          fontFamily: "system-ui, sans-serif",
          fontSize: "7px",
          fontWeight: "600",
          letterSpacing: "0.1em",
        }}
      >
        HOTEL MANAGEMENT SYSTEM
      </text>
    </svg>
  )
}

export function InnSyncIcon({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="INN-SYNC Icon"
    >
      <circle cx="20" cy="20" r="18" className="fill-primary" />
      <rect x="14" y="11" width="3" height="18" rx="1.5" className="fill-primary-foreground" />
      <path
        d="M 22 13 Q 26 11, 26 15 Q 26 17, 24 18 Q 26 19, 26 21 Q 26 25, 22 27"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        className="text-primary-foreground"
      />
    </svg>
  )
}
