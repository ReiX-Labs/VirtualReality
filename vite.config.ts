import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Repo name = "VirtualReality" -> GitHub Pages serves it at
// https://<user>.github.io/VirtualReality/
// In dev/preview we use "/" so the local server loads at the root.
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/VirtualReality/" : "/",
  plugins: [react()],
  build: {
    outDir: "dist",
    chunkSizeWarningLimit: 1400,
  },
}));
