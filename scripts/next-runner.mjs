/**
 * Wrapper around `next dev` / `next build` that temporarily renames
 * middleware.ts so Next.js 16 only sees proxy.ts for route protection
 * (Next.js 16 errors when both middleware.ts and proxy.ts exist.)
 */
import { spawn } from "child_process";
import { existsSync, renameSync } from "fs";
import { join } from "path";

const cmd = process.argv[2]; // "dev" | "build" | "start"
if (!cmd) { console.error("Usage: node scripts/next-runner.mjs <dev|build|start>"); process.exit(1); }

const root = process.cwd();
const mw  = join(root, "middleware.ts");
const bak = join(root, "middleware.ts.bak");

// Hide middleware.ts so Next.js only detects proxy.ts
let hidden = false;
if (existsSync(mw)) {
  renameSync(mw, bak);
  hidden = true;
}

function restore() {
  if (hidden && existsSync(bak)) {
    renameSync(bak, mw);
    hidden = false;
  }
}

// Invoke Next.js via node directly — avoids .cmd vs no-extension issues on Windows
const proc = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", cmd],
  { stdio: "inherit" }
);

proc.on("close", (code) => {
  restore();
  process.exit(code ?? 0);
});

// Ensure restoration on unexpected exits (Windows Ctrl+C, kill, etc.)
process.on("exit",   restore);
process.on("SIGINT",  () => { proc.kill("SIGINT");  });
process.on("SIGTERM", () => { proc.kill("SIGTERM"); });
