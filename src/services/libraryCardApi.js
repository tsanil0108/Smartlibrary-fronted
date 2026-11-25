import { api } from "./api";

export const libraryCardApi = {
  getMyCard: () =>
    api("/member/library-card"),

  regenerateCard: () =>
    api("/member/library-card/regenerate", "POST"),
};

export function formatCardDate(value) {
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

export function getRemainingDays(value) {
  if (!value) return null;

  const parts = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const getPart = (type) =>
    parts.find((part) => part.type === type)?.value;

  const today = Date.UTC(
    Number(getPart("year")),
    Number(getPart("month")) - 1,
    Number(getPart("day"))
  );

  const endDate = Date.parse(
    String(value).slice(0, 10) + "T00:00:00Z"
  );

  if (Number.isNaN(endDate)) {
    return null;
  }

  return Math.max(
    0,
    Math.round((endDate - today) / 86400000)
  );
}

export function getQrImage(value) {
  if (!value || typeof value !== "string") {
    return null;
  }

  if (value.startsWith("data:image/png;base64,")) {
    return value;
  }

  if (/^[A-Za-z0-9+/=\s]+$/.test(value)) {
    return `data:image/png;base64,${value.replace(/\s/g, "")}`;
  }

  return null;
}