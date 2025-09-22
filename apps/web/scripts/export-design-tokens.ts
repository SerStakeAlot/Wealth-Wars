import { writeFileSync, mkdirSync } from 'fs'
import path from 'path'
import tokens from '../src/pixel/design/tokens'

async function main() {
  const version = process.env.TOKENS_VERSION || '0.1.0'
  const payload = { version, generatedAt: new Date().toISOString(), ...tokens }
  const outDir = path.join(process.cwd(), 'public', 'config')
  mkdirSync(outDir, { recursive: true })
  const outPath = path.join(outDir, 'design-tokens.json')
  writeFileSync(outPath, JSON.stringify(payload, null, 2))
  console.log(`[tokens] wrote ${outPath}`)
}

main().catch(e => { console.error(e); process.exit(1) })