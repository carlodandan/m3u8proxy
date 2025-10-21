// netlify/functions/proxy.js
import { isValidHostName } from "../../lib/isValidHostName.js";
import { getProxyForUrl } from "proxy-from-env";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import withCORS from "../../lib/withCORS.js";
import parseURL from "../../lib/parseURL.js";
import proxyM3U8 from "../../lib/proxyM3U8.js";
import { proxyTs } from "../../lib/proxyTS.js";
import httpProxy from "http-proxy";

const proxyServer = httpProxy.createProxyServer({
  xfwd: true,
  secure: process.env.NODE_TLS_REJECT_UNAUTHORIZED !== "0",
});

export const handler = async (event, context) => {
  const req = {
    url: event.path,
    method: event.httpMethod,
    headers: event.headers,
  };

  const res = {
    statusCode: 200,
    headers: {},
    setHeader(key, value) {
      this.headers[key] = value;
    },
    removeHeader(key) {
      delete this.headers[key];
    },
    writeHead(statusCode, headers = {}) {
      this.statusCode = statusCode;
      Object.assign(this.headers, headers);
    },
    end(body = "") {
      this.body = body;
    },
  };

  // Handle CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (event.httpMethod === "OPTIONS") {
    res.writeHead(204);
    return formatResponse(res);
  }

  // Your existing proxy logic here (simplified version)
  try {
    await handleRequest(req, res);
    return formatResponse(res);
  } catch (error) {
    console.error("Error:", error);
    res.writeHead(500);
    res.end("Internal Server Error");
    return formatResponse(res);
  }
};

function formatResponse(res) {
  return {
    statusCode: res.statusCode,
    headers: res.headers,
    body: res.body || "",
  };
}

async function handleRequest(req, res) {
  // Add your existing request handling logic from getHandler.js here
  // This is a simplified version - you'll need to adapt your existing logic
  
  const location = parseURL(req.url.slice(1));
  
  if (!location) {
    if (req.url === "/") {
      // Serve your HTML page
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);
      const html = readFileSync(join(__dirname, "../../index.html"), "utf8");
      res.end(html);
      return;
    }
    res.writeHead(400);
    res.end("Invalid URL");
    return;
  }

  // Handle m3u8 and ts proxy routes
  if (req.url.startsWith("/m3u8-proxy")) {
    const urlParams = new URLSearchParams(req.url.split("?")[1]);
    const targetUrl = urlParams.get("url");
    const headers = JSON.parse(urlParams.get("headers") || "{}");
    return await proxyM3U8(targetUrl, headers, res);
  }

  if (req.url.startsWith("/ts-proxy")) {
    const urlParams = new URLSearchParams(req.url.split("?")[1]);
    const targetUrl = urlParams.get("url");
    const headers = JSON.parse(urlParams.get("headers") || "{}");
    return await proxyTs(targetUrl, headers, req, res);
  }

  // Regular proxy logic
  // You'll need to adapt your existing proxy logic here
  res.writeHead(200);
  res.end("Proxy functionality would go here");
}