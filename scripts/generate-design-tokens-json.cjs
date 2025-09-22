#!/usr/bin/env node
/**
 * Generates a design-tokens.json file from the canonical TypeScript tokens module.
 * Output: apps/web/public/config/design-tokens.json
 */
const { writeFileSync, mkdirSync } = require('fs')
const { createHash } = require('crypto')
const path = require('path')

async function main() {
  // Require TS file through ts-node-like transpile? Instead, do a naive parse using dynamic import via esbuild-register fallback.
  // Simpler: use dynamic import of compiled JS by leveraging ts-node replacement not needed; we can replicate tokens inline by requiring the ts file through ts-node/register if present.
  // For now, read the source and eval minimal export using Node's loader fallback.
  // Simplicity approach: require the compiled transpiled output by a lightweight transpile with esbuild.
  let tokens
  try {
    // Attempt to load via esbuild-register if available in devDependencies
    let unregister
    try {
      const { register } = require('esbuild-register/dist/node')
      unregister = register({ target: 'es2020' })
    } catch {}
    const mod = require(path.join(process.cwd(), 'apps/web/src/pixel/design/tokens.ts'))
    tokens = mod.tokens || mod.default
    if (unregister) unregister()
  } catch (e) {
    console.error('Failed to load tokens.ts. Install esbuild-register or convert tokens to .js. Error:', e)
    process.exit(1)
  }
  if (!tokens) {
    console.error('Tokens export not found.')
    process.exit(1)
  }
  const version = process.env.TOKENS_VERSION || '0.1.0'
  const payload = { version, generatedAt: new Date().toISOString(), ...tokens }
  const json = JSON.stringify(payload, null, 2)
  const hash = createHash('sha256').update(json).digest('hex').slice(0, 12)
  const outDir = path.join(process.cwd(), 'apps/web/public/config')
  mkdirSync(outDir, { recursive: true })
  const outPath = path.join(outDir, 'design-tokens.json')
  writeFileSync(outPath, json)
  console.log(`Design tokens written to ${outPath} (sha256:${hash}) version=${version}`)
}

main().catch(e => { console.error(e); process.exit(1) })