import express from "express";
import compression from "compression";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(compression());

// dist generata da vite build
const distDir = path.join(__dirname, "..", "dist");

// ✅ asset versionati: cache lunga
app.use(
    "/assets",
    express.static(path.join(distDir, "assets"), {
        setHeaders(res) {
            res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        },
    }),
);

// ✅ tutto il resto: cache corta (HTML)
app.use(
    express.static(distDir, {
        setHeaders(res, filePath) {
            if (filePath.endsWith(".html")) {
                res.setHeader("Cache-Control", "no-cache");
            }
        },
    }),
);

// fallback SPA (finché non hai SSR vero)
app.get("*", (_, res) => {
    res.sendFile(path.join(distDir, "index.html"));
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`FE server on :${port}`));