const http = require("http");
const next = require("next");
const { loadEnvConfig } = require("@next/env");

const port = Number.parseInt(process.env.PORT ?? "3000", 10);
const hostname = process.env.HOSTNAME ?? "0.0.0.0";

loadEnvConfig(process.cwd());

const app = next({ dev: true, hostname, port });
const handle = app.getRequestHandler();

async function start() {
  try {
    await app.prepare();
    const server = http.createServer((req, res) => {
      handle(req, res).catch((error) => {
        console.error("[playwright] request handler error", error);
        res.statusCode = 500;
        res.end("Internal server error");
      });
    });

    server.listen(port, hostname, () => {
      console.log(`[playwright] next dev server listening on http://${hostname}:${port}`);
    });

    const shutdown = (signal) => {
      console.log(`[playwright] shutting down due to ${signal}`);
      server.close(() => {
        app.close().catch(() => undefined);
        process.exit(0);
      });
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    console.error("[playwright] failed to boot next dev server", error);
    process.exit(1);
  }
}

void start();
