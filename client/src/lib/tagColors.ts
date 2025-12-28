import type { TagColor } from "@/types/tags";

const colorMap: Record<string, TagColor> = {
  logistics: { bg: "bg-blue-100 dark:bg-blue-900", text: "text-blue-800 dark:text-blue-100" },
  transport: { bg: "bg-green-100 dark:bg-green-900", text: "text-green-800 dark:text-green-100" },
  shipping: { bg: "bg-indigo-100 dark:bg-indigo-900", text: "text-indigo-800 dark:text-indigo-100" },
  freight: { bg: "bg-purple-100 dark:bg-purple-900", text: "text-purple-800 dark:text-purple-100" },
  cargo: { bg: "bg-sky-100 dark:bg-sky-900", text: "text-sky-800 dark:text-sky-100" },
  warehouse: { bg: "bg-orange-100 dark:bg-orange-900", text: "text-orange-800 dark:text-orange-100" },
  customs: { bg: "bg-red-100 dark:bg-red-900", text: "text-red-800 dark:text-red-100" },
  air: { bg: "bg-cyan-100 dark:bg-cyan-900", text: "text-cyan-800 dark:text-cyan-100" },
  rail: { bg: "bg-emerald-100 dark:bg-emerald-900", text: "text-emerald-800 dark:text-emerald-100" },
  development: { bg: "bg-violet-100 dark:bg-violet-900", text: "text-violet-800 dark:text-violet-100" },
  platform: { bg: "bg-fuchsia-100 dark:bg-fuchsia-900", text: "text-fuchsia-800 dark:text-fuchsia-100" },
  integration: { bg: "bg-rose-100 dark:bg-rose-900", text: "text-rose-800 dark:text-rose-100" },
  mail: { bg: "bg-yellow-100 dark:bg-yellow-900", text: "text-yellow-800 dark:text-yellow-100" },
  management: { bg: "bg-teal-100 dark:bg-teal-900", text: "text-teal-800 dark:text-teal-100" }
};

export const getTagColor = (tag: string): TagColor => {
  const defaultColor: TagColor = { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-800 dark:text-gray-100" };
  return colorMap[tag.toLowerCase()] || defaultColor;
};