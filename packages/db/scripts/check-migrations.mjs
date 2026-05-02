import { existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const dir = resolve(process.cwd(), "../../supabase/migrations");
if (!existsSync(dir)) throw new Error(`Migration directory missing: ${dir}`);
const files = readdirSync(dir).filter((file) => file.endsWith(".sql")).sort();
if (files.length === 0) throw new Error("No SQL migrations found");
console.info(`Found ${files.length} migration(s): ${files.join(", ")}`);
