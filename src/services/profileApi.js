import { api } from "./api";

export const profileApi = {
  getProfile: () =>
    api("/member/profile"),

  updateProfile: (name) =>
    api("/member/profile", "PUT", {
      name: name.trim(),
    }),

  changePassword: (data) =>
    api("/member/change-password", "PUT", {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
      confirmPassword: data.confirmPassword,
    }),

  getDashboard: () =>
    api("/member/dashboard"),
};

export function formatProfileDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(date);
}

export function getInitials(name) {
  return (
    String(name || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join("") || "M"
  );
}