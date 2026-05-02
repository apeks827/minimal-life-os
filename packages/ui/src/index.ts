export const tokens = {
  colors: {
    ink: "#1f261f",
    moss: "#6f7f52",
    clay: "#c97855",
    oat: "#f4ead8",
    fog: "#e4dfd2",
    sky: "#9fb9c8",
  },
  radius: { sm: "12px", md: "20px", lg: "32px" },
  shadow: "0 24px 80px rgba(31, 38, 31, 0.16)",
} as const;

export function cardClassName(extra = ""): string {
  return ["rounded-[28px] border border-black/10 bg-white/70 p-5 shadow-sm backdrop-blur", extra]
    .filter(Boolean)
    .join(" ");
}
