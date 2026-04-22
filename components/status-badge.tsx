import { cn } from "@/lib/utils"

type RoomStatus = "available" | "occupied" | "dirty" | "clean" | "maintenance"

interface StatusBadgeProps {
  status: RoomStatus
  className?: string
}

const statusConfig = {
  available: {
    label: "Available",
    className: "bg-available text-success-foreground",
  },
  occupied: {
    label: "Occupied",
    className: "bg-occupied text-destructive-foreground",
  },
  dirty: {
    label: "Dirty",
    className: "bg-dirty text-warning-foreground",
  },
  clean: {
    label: "Clean",
    className: "bg-clean text-success-foreground",
  },
  maintenance: {
    label: "Out of Service",
    className: "bg-maintenance text-primary-foreground",
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold",
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  )
}
