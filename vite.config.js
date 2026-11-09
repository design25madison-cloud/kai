import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // Read from .env.local, which git ignores. No VITE_ prefix, so the key is never bundled into
  // the browser: the dev server adds it to requests it passes on to Unsplash.
  const env = loadEnv(mode, process.cwd(), "");
  const key = env.UNSPLASH_ACCESS_KEY;

  // /api/unsplash/... on this server → api.unsplash.com/... with the key attached.
  // This only exists while running locally. A hosted version needs a small server function to
  // do the same job (engineer work); until then it falls back to Wikimedia Commons.
  const unsplash = {
    "/api/unsplash": {
      target: "https://api.unsplash.com",
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api\/unsplash/, ""),
      headers: key ? { Authorization: `Client-ID ${key}`, "Accept-Version": "v1" } : {},
    },
  };

  return {
    plugins: [react()],
    base: "./",
    server: { proxy: unsplash },
    preview: { proxy: unsplash },
  };
});
