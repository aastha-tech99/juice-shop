/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { createRequire } from 'node:module'
import fs from 'node:fs/promises'
import { createWriteStream } from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { execSync } from 'node:child_process'
import { parseArgs } from 'node:util'
import { glob } from 'glob'

// archiver must be globally installed — Node.js does not search npm's global node_modules by default
// not great, but the alternative is to include archiver as a prod dependency as all the dev dependency are cleared by npm prune before packaging
function loadArchiver () {
  const require = createRequire(import.meta.url)
  try {
    return require('archiver')
  } catch {
    // archiver not found locally, try global node_modules
  }
  try {
    const globalRoot = execSync('npm root -g', { encoding: 'utf8' }).trim()
    if (!path.isAbsolute(globalRoot)) {
      throw new Error('npm root -g returned an unexpected non-absolute path')
    }
    const resolvedRoot = path.resolve(globalRoot)
    const archiverDir = path.join(resolvedRoot, 'archiver')
    if (!archiverDir.startsWith(resolvedRoot + path.sep)) {
      throw new Error('Invalid module path')
    }
    // Use createRequire from the archiver directory with a static string to avoid eval injection
    const archiverRequire = createRequire(path.join(archiverDir, 'package.json'))
    return archiverRequire('.')
  } catch {
    console.error('archiver is not installed. Run: npm install -g archiver')
    process.exit(1)
  }
}

const { TarArchive, ZipArchive } = loadArchiver()

const { values: args } = parseArgs({
  options: {
    'archive-format': { type: 'string' }
  }
})

const format = args['archive-format'] ?? process.env.PCKG_FORMAT

if (format !== 'tgz' && format !== 'zip') {
  console.error('Usage: node scripts/package.mjs --archive-format=tgz|zip  (or set PCKG_FORMAT env var)')
  process.exit(1)
}

const osName = process.env.PCKG_OS_NAME || ''
const cpuArch = process.env.PCKG_CPU_ARCH || ''
const nodeVer = process.env.PCKG_NODE_VERSION || process.env.nodejs_version || ''

// set os/engine/cpu flags in the package to match the build environment
const pkgPath = 'package.json'
const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf8'))
if (nodeVer) pkg.engines = { ...pkg.engines, node: nodeVer }
if (osName) pkg.os = [osName]
if (cpuArch) pkg.cpu = [cpuArch]
await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n')

// Build archive filename (mirrors compress:pckg naming)
const ext = format === 'tgz' ? '.tgz' : '.zip'
const archiveName = `${pkg.name}-${pkg.version}` +
  (nodeVer ? `_node${nodeVer}` : '') +
  (osName ? `_${osName}` : '') +
  (cpuArch ? `_${cpuArch}` : '') +
  ext
const archivePath = path.join('dist', archiveName)
const prefix = `juice-shop_${pkg.version}`

await fs.mkdir('dist', { recursive: true })

const files = await glob([
  '.well-known/**',
  'LICENSE',
  '*.md',
  'package.json',
  'ctf.key',
  'swagger.yml',
  'server.ts',
  'build/**',
  'bom.json',
  'bom.xml',
  'config/*.yml',
  'data/*.ts',
  'data/static/**',
  'encryptionkeys/**',
  'frontend/dist/frontend/**',
  'frontend/dist/bom/**',
  'frontend/src/**/*.ts',
  'ftp/**',
  'i18n/.gitkeep',
  'lib/**',
  'models/*.ts',
  'node_modules/**',
  'routes/*.ts',
  'uploads/complaints/.gitkeep',
  'views/**'
], { dot: true, ignore: ['build/reports/**'], nodir: true })

// Stream all matched files into the archive under the prefix directory
await new Promise((resolve, reject) => {
  const archive = format === 'tgz'
    ? new TarArchive({ gzip: true, gzipOptions: { level: 9 } })
    : new ZipArchive()

  const output = createWriteStream(archivePath)
  output.on('close', resolve)
  archive.on('error', reject)
  archive.pipe(output)

  const projectRoot = path.resolve('.')
  for (const file of files) {
    const segments = file.split(/[\\/]/)
    if (segments.includes('..') || segments.includes('.')) continue
    const safePath = segments.map(s => path.basename(s)).join(path.sep)
    const resolvedFile = projectRoot + path.sep + safePath
    archive.file(resolvedFile, { name: `${prefix}/${file}` })
  }

  archive.finalize()
})

console.log(`Created ${archivePath}`)

// Generate MD5 checksums
const distDir = path.resolve('dist')
for (const file of await fs.readdir('dist')) {
  if (file.endsWith('.md5')) continue
  const safeName = path.basename(file)
  if (!safeName || safeName === '.' || safeName === '..') continue
  const filePath = distDir + path.sep + safeName
  if (!(await fs.stat(filePath)).isFile()) continue
  const content = await fs.readFile(filePath)
  const hash = crypto.createHash('md5').update(content).digest('hex')
  const hashFile = filePath + '.md5'
  await fs.writeFile(hashFile, hash)
  console.log(`Checksum ${hash} written to ${hashFile}`)
}
