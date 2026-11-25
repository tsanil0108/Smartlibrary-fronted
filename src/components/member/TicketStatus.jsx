import React from "react";

import {
  Clock,
  LoaderCircle,
  CheckCircle2,
  LockKeyhole,
  CircleHelp,
} from "lucide-react";

import "../../styles/member/TicketStatus.css";

const statusConfig = {
  OPEN: {
    label: "Open",
    icon: Clock,
    color: "ts-open",
  },

  IN_PROGRESS: {
    label: "In progress",
    icon: LoaderCircle,
    color: "ts-progress",
  },

  RESOLVED: {
    label: "Resolved",
    icon: CheckCircle2,
    color: "ts-resolved",
  },

  CLOSED: {
    label: "Closed",
    icon: LockKeyhole,
    color: "ts-closed",
  },
};

export default function TicketStatus({ status }) {
  const config = statusConfig[status] || {
    label: status || "Unknown",
    icon: CircleHelp,
    color: "ts-closed",
  };

  const Icon = config.icon;

  return (
    <span className={`ts-badge ${config.color}`}>
      <Icon size={14} />
      {config.label}
    </span>
  );
}

export function TicketPriority({ priority }) {
  const value = priority || "MEDIUM";

  return (
    <span
      className={`ts-priority ts-${value.toLowerCase()}`}
    >
      <span className="ts-dot" />

      {value.charAt(0) +
        value.slice(1).toLowerCase()}
    </span>
  );
}