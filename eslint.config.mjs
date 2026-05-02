import tseslint from "typescript-eslint";

export default [
  { ignores: ["**/dist/**", "**/.next/**", "**/node_modules/**", "**/.expo/**"] },
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    rules: { "no-console": ["warn", { allow: ["warn", "error", "info"] }] },
  },
];
