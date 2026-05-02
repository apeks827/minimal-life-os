import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  theme: { extend: { fontFamily: { display: ["Georgia", "serif"], body: ["Verdana", "sans-serif"] } } },
  plugins: [],
} satisfies Config;
