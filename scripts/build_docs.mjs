import { cpSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '..')
const docsDir = resolve(repoRoot, 'docs')
const imageSource = resolve(repoRoot, 'assets', 'images')
const imageTarget = resolve(docsDir, 'public', 'images')
const vitepressCli = resolve(repoRoot, 'node_modules', 'vitepress', 'bin', 'vitepress.js')

if (!existsSync(imageSource)) {
  throw new Error(`Static image source not found: ${imageSource}`)
}

if (!existsSync(vitepressCli)) {
  throw new Error(
    'VitePress is not installed. Run "npm ci" in the repository root first.'
  )
}

mkdirSync(resolve(docsDir, 'public'), { recursive: true })
cpSync(imageSource, imageTarget, { recursive: true })
console.log(`Copied static images to ${imageTarget}`)

const result = spawnSync(
  process.execPath,
  [vitepressCli, 'build'],
  {
    cwd: docsDir,
    env: {
      ...process.env,
      NODE_OPTIONS: '--max-old-space-size=8192',
    },
    stdio: 'inherit',
  },
)

if (result.error) {
  throw result.error
}

process.exit(result.status ?? 1)
