import { randomUUID } from "node:crypto";
import { createServer } from "node:http";
import { createReadinessChecker } from "./readiness.mjs";

function writeJson(response, statusCode, body, headers = {}) {
  response.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    ...headers
  });
  response.end(JSON.stringify(body));
}

function correlationId(request) {
  const supplied = request.headers["x-correlation-id"];
  return typeof supplied === "string" && supplied.length > 0
    ? supplied
    : randomUUID();
}

export function createHttpServer({ readinessChecks = {} } = {}) {
  const checkReadiness = createReadinessChecker(readinessChecks);

  return createServer(async (request, response) => {
    const id = correlationId(request);
    response.setHeader("x-correlation-id", id);

    try {
      if (request.method === "GET" && request.url === "/health") {
        writeJson(response, 200, { status: "ok", correlation_id: id });
        return;
      }

      if (request.method === "GET" && request.url === "/ready") {
        const result = await checkReadiness();
        writeJson(
          response,
          result.ready ? 200 : 503,
          result.ready
            ? { status: "ready", checks: result.checks, correlation_id: id }
            : {
                error: {
                  code: "not_ready",
                  message: "Gateway dependencies are not ready.",
                  retryable: true,
                  correlation_id: id
                },
                checks: result.checks
              }
        );
        return;
      }

      writeJson(response, 404, {
        error: {
          code: "not_found",
          message: "Route not found.",
          retryable: false,
          correlation_id: id
        }
      });
    } catch {
      writeJson(response, 500, {
        error: {
          code: "internal_error",
          message: "Internal server error.",
          retryable: true,
          correlation_id: id
        }
      });
    }
  });
}
