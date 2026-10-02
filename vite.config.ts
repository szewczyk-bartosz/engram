import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080,
    watch: {
      ignored: [
        "**/.direnv/**",
        "**/engrams/**",
        "**/engram-raw-for-testing/**",
      ],
      followSymlinks: false,
    },
    proxy: {
      "/api": "http://localhost:8001",
    },
  },
});
