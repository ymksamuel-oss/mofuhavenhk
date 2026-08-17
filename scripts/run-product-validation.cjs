/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");

const root = process.cwd();
const buildRoot = path.join(root, ".validation-build");
const originalResolveFilename = Module._resolveFilename;

Module._resolveFilename = function resolveValidationAlias(
  request,
  parent,
  isMain,
  options,
) {
  if (request.startsWith("@/")) {
    const resolved = path.join(buildRoot, "src", request.slice(2));
    return originalResolveFilename.call(this, resolved, parent, isMain, options);
  }
  return originalResolveFilename.call(this, request, parent, isMain, options);
};

try {
  require(path.join(buildRoot, "scripts", "validate-products.js"));
  require(path.join(buildRoot, "scripts", "validate-product-filtering.js"));
} finally {
  fs.rmSync(buildRoot, { recursive: true, force: true });
}
