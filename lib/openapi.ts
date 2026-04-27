import { promises as fs } from "node:fs";
import path from "node:path";

type HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"];
type HttpMethod = (HTTP_METHODS)[number];
type JsonRecord = Record<string, unknown>;

type RouteOperation = {
  method: HttpMethod;
  override?: JsonRecord;
};

const OPENAPI_MARKER = "@openapi";

const isRecord = (value: unknown): value is JsonRecord => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const deepMerge = (base: JsonRecord, override: JsonRecord): JsonRecord => {
  const merged: JsonRecord = { ...base };

  for (const [key, value] of Object.entries(override)) {
    if (isRecord(value) && isRecord(merged[key])) {
      merged[key] = deepMerge(merged[key] as JsonRecord, value);
      continue;
    }

    merged[key] = value;
  }

  return merged;
};

const extractOpenApiOverride = (jsdocBlock?: string): JsonRecord | undefined => {
  if (!jsdocBlock) return undefined;

  const cleanedDoc = jsdocBlock
    .replace(/^\s*\/\*\*/, "")
    .replace(/\*\/\s*$/, "")
    .split("\n")
    .map((line) => line.replace(/^\s*\*\s?/, ""))
    .join("\n");

  const markerIndex = cleanedDoc.indexOf(OPENAPI_MARKER);
  if (markerIndex === -1) return undefined;

  const jsonText = cleanedDoc.slice(markerIndex + OPENAPI_MARKER.length).trim();
  if (!jsonText) return undefined;

  try {
    const parsed = JSON.parse(jsonText);
    return isRecord(parsed) ? parsed : undefined;
  } catch (error) {
    console.warn("Invalid @openapi JSON block ignored:", error);
    return undefined;
  }
};

const parseRouteOperations = (routeSource: string): RouteOperation[] => {
  const methodRegex =
    /(?:(\/\*\*[\s\S]*?\*\/)\s*)?export\s+(?:async\s+)?function\s+(GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD)\s*\(/g;

  const operations: RouteOperation[] = [];
  let match: RegExpExecArray | null;

  while ((match = methodRegex.exec(routeSource)) !== null) {
    const [, jsdocBlock, method] = match;

    operations.push({
      method: method as HttpMethod,
      override: extractOpenApiOverride(jsdocBlock),
    });
  }

  return operations;
};

const collectRouteFiles = async (dirPath: string): Promise<string[]> => {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const entryPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectRouteFiles(entryPath)));
      continue;
    }

    if (entry.isFile() && entry.name === "route.ts") {
      files.push(entryPath);
    }
  }

  return files;
};

const toApiPath = (routeFilePath: string, apiDir: string): string => {
  const relativePath = path.relative(apiDir, routeFilePath).replace(/\\/g, "/");
  const withoutRouteFile = relativePath.replace(/\/route\.ts$/, "").replace(/^route\.ts$/, "");

  return withoutRouteFile ? `/api/${withoutRouteFile}` : "/api";
};

const buildTagsFromPath = (apiPath: string): string[] => {
  const routeSegments = apiPath.split("/").filter(Boolean);
  const topLevelApiFolder = routeSegments[1];

  return [topLevelApiFolder ?? "api"];
};

const createDefaultOperation = (method: HttpMethod, apiPath: string): JsonRecord => {
  return {
    tags: buildTagsFromPath(apiPath),
    summary: `${method} ${apiPath}`,
    responses: {
      "200": {
        description: "OK",
        content: {
          "application/json": {
            schema: {
              type: "object",
            },
          },
        },
      },
    },
  };
};

const mergeOperation = (defaultOperation: JsonRecord, override?: JsonRecord): JsonRecord => {
  if (!override) return defaultOperation;

  const mergedOperation = deepMerge(defaultOperation, override);

  const defaultResponses = defaultOperation.responses;
  const overrideResponses = override.responses;

  if (isRecord(defaultResponses)) {
    mergedOperation.responses = isRecord(overrideResponses)
      ? deepMerge(defaultResponses, overrideResponses)
      : defaultResponses;
  }

  return mergedOperation;
};

export const generateOpenApiSpec = async () => {
  const apiDir = path.join(process.cwd(), "app", "api");
  const routeFiles = (await collectRouteFiles(apiDir)).sort();

  const paths: JsonRecord = {};

  for (const routeFilePath of routeFiles) {
    const routeSource = await fs.readFile(routeFilePath, "utf8");
    const operations = parseRouteOperations(routeSource);

    if (operations.length === 0) continue;

    const apiPath = toApiPath(routeFilePath, apiDir);
    const pathItem = (paths[apiPath] as JsonRecord | undefined) ?? {};

    for (const operation of operations) {
      const defaultOperation = createDefaultOperation(operation.method, apiPath);
      const finalOperation = mergeOperation(defaultOperation, operation.override);
      pathItem[operation.method.toLowerCase()] = finalOperation;
    }

    paths[apiPath] = pathItem;
  }

  return {
    openapi: "3.0.3",
    info: {
      title: "Server Manager API",
      version: "1.0.0",
      description: "OpenAPI specification generated automatically from App Router route handlers.",
    },
    servers: [
      {
        url: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000",
      },
    ],
    components: {
      securitySchemes: {
        sessionCookie: {
          type: "apiKey",
          in: "cookie",
          name: "next-auth.session-token",
        },
      },
    },
    security: [{ sessionCookie: [] }],
    paths,
  };
};
