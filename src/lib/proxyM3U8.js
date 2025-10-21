import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// Use Render's provided URL or fallback to localhost
const web_server_url = process.env.PUBLIC_URL || process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT || 10000}`;

export default async function proxyM3U8(url, headers, res) {
  // ... rest of your existing code ...
  
  // Make sure all URL replacements use the dynamic web_server_url
  const proxyUrl = `${web_server_url}${
    "/ts-proxy?url=" +
    encodeURIComponent(regex.exec(line)?.[0] ?? "") +
    "&headers=" +
    encodeURIComponent(JSON.stringify(headers))
  }`;
  
  // ... rest of your existing code ...
}