/**
 * Fetches and self-hosts the two typefaces this site uses.
 *
 *   Newsreader   (OFL)  — display + body. Variable, latin subset only.
 *   Commit Mono  (MIT)  — metadata voice. Variable.
 *
 * Web fonts land in public/fonts/. A static Newsreader TTF also lands in
 * src/assets/fonts/ because satori (OG image generation) cannot read woff2.
 *
 * Run with `npm run fonts`. Output is committed, so this is a one-shot
 * provenance record rather than a build step.
 */

import { mkdir, rm, stat, writeFile } from 'node:fs/promises'
import { execFile } from 'node:child_process'
import { join } from 'node:path'
import { promisify } from 'node:util'

const run = promisify(execFile)

const ROOT = new URL('..', import.meta.url).pathname
const WEB_DIR = join(ROOT, 'public/fonts')
const TTF_DIR = join(ROOT, 'src/assets/fonts')

// A modern UA makes Google Fonts serve variable woff2 rather than legacy formats.
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

const GF_CSS =
  'https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&display=swap'

const COMMIT_MONO =
  'https://raw.githubusercontent.com/eigilnikolajsen/commit-mono/master/src/fonts/fontlab/CommitMonoV143-VF.woff2'

// google/fonts ships Newsreader only as a variable TTF; satori renders its
// default instance, which is the regular cut the OG image wants.
const NEWSREADER_TTF =
  'https://raw.githubusercontent.com/google/fonts/main/ofl/newsreader/Newsreader%5Bopsz,wght%5D.ttf'

// Upstream license texts, kept next to the fonts we redistribute.
const LICENSES = [
  ['Newsreader-OFL.txt', 'https://raw.githubusercontent.com/google/fonts/main/ofl/newsreader/OFL.txt'],
  ['CommitMono-LICENSE.txt', 'https://raw.githubusercontent.com/eigilnikolajsen/commit-mono/master/LICENSE'],
]

async function get(url, asText = false) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${url}`)
  return asText ? res.text() : Buffer.from(await res.arrayBuffer())
}

async function save(dir, name, buf) {
  await writeFile(join(dir, name), buf)
  console.log(`  ${name}  ${(buf.length / 1024).toFixed(1)} KB`)
}

/**
 * Google's css2 response is grouped into `/* subset *\/` comments followed by
 * an @font-face. Pull only the latin block for each style — the site is
 * English-only, so vietnamese/latin-ext are dead weight.
 */
function latinSrc(css, style) {
  const blocks = css.split('/*').map((b) => '/*' + b)
  const hit = blocks.find(
    (b) =>
      b.startsWith('/* latin *') &&
      b.includes(`font-style: ${style}`)
  )
  if (!hit) throw new Error(`no latin @font-face for font-style: ${style}`)
  const url = hit.match(/url\((https:[^)]+)\)/)
  if (!url) throw new Error(`no url() in latin ${style} block`)
  return url[1]
}

async function main() {
  await mkdir(WEB_DIR, { recursive: true })
  await mkdir(TTF_DIR, { recursive: true })

  console.log('Newsreader (latin variable woff2):')
  const css = await get(GF_CSS, true)
  for (const [style, file] of [
    ['normal', 'newsreader-latin-var.woff2'],
    ['italic', 'newsreader-latin-var-italic.woff2'],
  ]) {
    await save(WEB_DIR, file, await get(latinSrc(css, style)))
  }

  console.log('Commit Mono (variable woff2):')
  await save(WEB_DIR, 'commit-mono-var.woff2', await get(COMMIT_MONO))

  console.log('Newsreader (variable TTF, for satori):')
  await save(TTF_DIR, 'Newsreader-Regular.ttf', await get(NEWSREADER_TTF))

  await subsetAll()
  await instanceStatic()

  console.log('Licenses:')
  for (const [name, url] of LICENSES) {
    await save(WEB_DIR, name, await get(url))
  }
}

/**
 * Trim the web fonts to what the site actually renders.
 *
 * Glyph subsetting alone barely dents Newsreader — its weight is variation
 * data, not outlines — so the axis ranges are narrowed too: the site uses
 * weights 350–600 and type from 11px to 38px (~8–29pt optical). Commit Mono is
 * the opposite case: a huge glyph set, so the unicode pass does the work.
 *
 * Needs fontTools + brotli (`pip install fonttools brotli`). Skipped without
 * them; the committed fonts already carry these savings.
 */
const UNICODES = [
  'U+0020-007E', // basic latin
  'U+00A0-00FF', // latin-1 supplement
  'U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC',
  'U+2000-206F', // general punctuation: quotes, dashes, ellipsis
  'U+20AC,U+2122',
  'U+2190-2193,U+2197', // arrows used in links and back-links
  'U+2212,U+2215,U+FEFF,U+FFFD',
].join(',')

const LAYOUT = 'kern,liga,clig,calt,ccmp,locl,mark,mkmk'

async function subsetAll() {
  console.log('Subsetting:')
  for (const [file, axes] of [
    ['newsreader-latin-var.woff2', ['wght=300:700', 'opsz=8:48']],
    ['newsreader-latin-var-italic.woff2', ['wght=300:700', 'opsz=8:48']],
    ['commit-mono-var.woff2', []],
  ]) {
    const path = join(WEB_DIR, file)
    const tmp = join(WEB_DIR, `~${file}`)
    try {
      const before = (await stat(path)).size
      let input = path

      if (axes.length) {
        await run('python3', [
          '-m', 'fontTools.varLib.instancer', path, ...axes, '-o', tmp,
        ])
        input = tmp
      }

      await run('python3', [
        '-m', 'fontTools.subset', input,
        `--output-file=${path}`,
        '--flavor=woff2',
        `--unicodes=${UNICODES}`,
        `--layout-features=${LAYOUT}`,
        '--no-hinting',
      ])

      await rm(tmp, { force: true })
      const after = (await stat(path)).size
      console.log(
        `  ${file}  ${(before / 1024).toFixed(0)} → ${(after / 1024).toFixed(0)} KB`
      )
    } catch (err) {
      await rm(tmp, { force: true })
      console.warn(`  ${file} skipped — ${err.message.split('\n')[0]}`)
    }
  }
}

/**
 * satori cannot parse variable fonts, so pin both axes into a static cut.
 * Needs fontTools (`pip install fonttools`). The output is committed, so a
 * checkout without fontTools still builds — this only refreshes it.
 */
async function instanceStatic() {
  const src = join(TTF_DIR, 'Newsreader-Regular.ttf')
  const out = join(TTF_DIR, 'Newsreader-Static.ttf')

  console.log('Newsreader (static instance, for satori):')
  try {
    await run('python3', [
      '-m', 'fontTools.varLib.instancer',
      src, 'wght=400', 'opsz=48', '-o', out,
    ])
    console.log('  Newsreader-Static.ttf')
  } catch {
    console.warn(
      '  skipped — fontTools not available. The committed static TTF still applies.'
    )
  }
}

main().catch((err) => {
  console.error(`\nfont fetch failed: ${err.message}`)
  process.exit(1)
})
