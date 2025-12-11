import { build } from "esbuild";
import { mkdir, rm, copyFile, writeFile } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { readFile } from "fs/promises";

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const dist = join(root, "dist");

async function ensureCleanDist() {
  await rm(dist, { recursive: true, force: true });
  await mkdir(dist, { recursive: true });
}

async function copyManifest() {
  const source = join(root, "manifest.json");
  const dest = join(dist, "manifest.json");
  await copyFile(source, dest);
}

async function copyReadme() {
  const source = join(root, "README.md");
  try {
    await copyFile(source, join(dist, "README.md"));
  } catch {
    // optional
  }
}

async function buildBundle() {
  const define = {};
  if (process.env.OPENAI_API_KEY) {
    define["process.env.OPENAI_API_KEY"] = JSON.stringify(
      process.env.OPENAI_API_KEY,
    );
  }

  await build({
    entryPoints: {
      "content-script": join(root, "src/content-script.ts"),
      background: join(root, "src/background.ts"),
    },
    bundle: true,
    outdir: dist,
    target: ["chrome114"],
    format: "esm",
    sourcemap: true,
    minify: true,
    define,
  });
}

async function emitTooltipCss() {
  const cssPath = join(root, "src", "tooltip.css");
  try {
    const css = await readFile(cssPath, "utf8");
    await writeFile(join(dist, "tooltip.css"), css);
  } catch {
    // optional if CSS missing
  }
}

async function main() {
  await ensureCleanDist();
  await copyManifest();
  await copyReadme();
  await emitTooltipCss();
  await buildBundle();
  console.log("Build complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

