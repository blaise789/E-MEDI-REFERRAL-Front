export function ReferralLogo({ className = "h-8 w-auto" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 220 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="MediRefer"
    >
      {/* Cross icon in a circle */}
      <circle cx="20" cy="20" r="18" className="fill-primary" />
      {/* Horizontal bar of cross */}
      <rect x="11" y="17.5" width="18" height="5" rx="2.5" className="fill-primary-foreground" />
      {/* Vertical bar of cross */}
      <rect x="17.5" y="11" width="5" height="18" rx="2.5" className="fill-primary-foreground" />

      {/* Brand name */}
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
        MediRefer
      </text>

      <text
        x="46"
        y="36"
        className="fill-muted-foreground"
        style={{
          fontFamily: "system-ui, sans-serif",
          fontSize: "7px",
          fontWeight: "600",
          letterSpacing: "0.1em",
        }}
      >
        REFERRAL MANAGEMENT SYSTEM
      </text>
    </svg>
  )
}

export function ReferralIcon({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="MediRefer Icon"
    >
      <circle cx="20" cy="20" r="18" className="fill-primary" />
      <rect x="11" y="17.5" width="18" height="5" rx="2.5" className="fill-primary-foreground" />
      <rect x="17.5" y="11" width="5" height="18" rx="2.5" className="fill-primary-foreground" />
    </svg>
  )
}
