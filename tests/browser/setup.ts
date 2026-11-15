import type { FullConfig } from "@playwright/test"
import { createServer, preview } from "vite"

// Own the server in-process: Windows test teardown does not need taskkill or
// process-tree enumeration, and a test run cannot terminate an unrelated server.
export default async function setup(config: FullConfig) {
  if (config.metadata.preview === true) {
    const server = await preview({ preview: { host: "127.0.0.1", port: 5179, strictPort: true } })
    return () => server.close()
  }
  const server = await createServer({ server: { host: "127.0.0.1", port: 5178, strictPort: true } })
  await server.listen()
  return () => server.close()
}
