/**
 * Build-time Open Graph cards, one per page.
 *
 * satori lays out flexbox into SVG, resvg rasterizes it to PNG. Runs at build
 * only, so none of this reaches the client. Same palette and typefaces as the
 * site, so a shared link looks like the page it points at.
 */

import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import { site } from '../data/site'

const PAPER = '#E8E0CA'
const INK = '#1C1B18'
const MUTED = '#666357'
const LINE = '#D3CEC3'
const ACCENT = '#2F4A8A'
const CONTOUR = '#3A4760'

let fonts: { name: string; data: Buffer; weight: 400 | 500; style: 'normal' }[] | null = null

async function loadFonts() {
  if (fonts) return fonts
  const root = process.cwd()
  fonts = [
    {
      name: 'Newsreader',
      data: await readFile(join(root, 'src/assets/fonts/Newsreader-Static.ttf')),
      weight: 400,
      style: 'normal',
    },
    {
      name: 'Commit Mono',
      data: await readFile(join(root, 'src/assets/fonts/CommitMono-Static.ttf')),
      weight: 500,
      style: 'normal',
    },
  ]
  return fonts
}

/** Deterministic contour-ish arcs, so a card never churns between builds. */
function marks() {
  const out: any[] = []
  // Concentric rounded rectangles read as nested isolines at this scale.
  for (let i = 0; i < 7; i++) {
    const s = 90 + i * 52
    out.push({
      type: 'div',
      props: {
        style: {
          position: 'absolute',
          right: `${-140 - i * 6}px`,
          top: `${315 - s / 2 + i * 4}px`,
          width: `${s * 1.5}px`,
          height: `${s}px`,
          borderRadius: `${s}px`,
          border: `1px solid ${i % 4 === 0 ? ACCENT : CONTOUR}`,
          opacity: i % 4 === 0 ? 0.28 : 0.16,
        },
      },
    })
  }
  return out
}

const text = (children: string, style: Record<string, unknown>) => ({
  type: 'div',
  props: { style: { display: 'flex', ...style }, children },
})

export interface Card {
  /** Mono eyebrow, e.g. WRITING or PROJECT. */
  eyebrow: string
  title: string
  /** One line under the title. Trimmed to fit. */
  subtitle?: string
}

export async function renderCard({ eyebrow, title, subtitle }: Card): Promise<Uint8Array> {
  // Clamp on a word boundary; cutting mid-word reads as a rendering bug.
  let sub = subtitle
  if (sub && sub.length > 116) {
    const cut = sub.slice(0, 116)
    sub = `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:.]$/, '')}…`
  }
  // Long titles need to step down or they overflow the card.
  const titleSize = title.length > 46 ? 62 : title.length > 30 ? 74 : 88

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: PAPER,
          padding: '76px 84px',
          fontFamily: 'Newsreader',
          position: 'relative',
          overflow: 'hidden',
        },
        children: [
          { type: 'div', props: { style: { display: 'flex' }, children: marks() } },
          {
            type: 'div',
            props: {
              style: { display: 'flex', flexDirection: 'column', maxWidth: '830px' },
              children: [
                text(eyebrow.toUpperCase(), {
                  fontFamily: 'Commit Mono',
                  fontSize: '22px',
                  letterSpacing: '3px',
                  color: MUTED,
                  marginBottom: '26px',
                }),
                text(title, {
                  fontSize: `${titleSize}px`,
                  color: INK,
                  letterSpacing: '-1.5px',
                  lineHeight: 1.1,
                }),
                ...(sub
                  ? [
                      text(sub, {
                        fontSize: '30px',
                        color: MUTED,
                        marginTop: '22px',
                        lineHeight: 1.35,
                      }),
                    ]
                  : []),
              ],
            },
          },
          {
            type: 'div',
            props: {
              style: { display: 'flex', flexDirection: 'column' },
              children: [
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', width: '1032px', height: '1px', background: LINE },
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      justifyContent: 'space-between',
                      width: '1032px',
                      marginTop: '20px',
                      fontFamily: 'Commit Mono',
                      fontSize: '22px',
                    },
                    children: [
                      text(site.name, { color: INK }),
                      text(`github.com/${site.githubUser}`, { color: ACCENT }),
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    { width: 1200, height: 630, fonts: await loadFonts() }
  )

  return new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng()
}
