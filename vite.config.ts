import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
    // Suppress Chrome DevTools "/.well-known/appspecific/..." probe requests
    // that React Router SSR would otherwise throw "No route matches URL" for.
    {
      name: "ignore-well-known",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url?.startsWith("/.well-known/")) {
            res.writeHead(204).end();
            return;
          }
          next();
        });
      },
    },
  ],
});
