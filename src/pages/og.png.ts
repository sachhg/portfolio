/**
 * Build-time Open Graph card: 1200x630, paper ground, Newsreader ink.
 *
 * satori lays out flexbox into SVG, resvg rasterizes it to PNG. Runs once at
 * build, so nothing here reaches the client.
 */

import type { APIRoute } from 'astro'
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

/** Deterministic marks, so the card is stable across rebuilds. */
function contourMarks() {
  const dots: any[] = []
  const COLS = 9
  const ROWS = 3
  // Offsets chosen once, not random, so the OG card never churns.
  const jitter = [4, -6, 3, -2, 7, -5, 2, 6, -3, 5, -4, 1, -7, 3, 6, -2, 4, -5]

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const i = r * COLS + c
      dots.push({
        type: 'div',
        props: {
          style: {
            position: 'absolute',
            left: `${c * 46 + (jitter[i % jitter.length] ?? 0)}px`,
            top: `${r * 46 + (jitter[(i + 5) % jitter.length] ?? 0)}px`,
            width: '4px',
            height: '4px',
            borderRadius: '2px',
            background: MUTED,
            opacity: 0.4,
          },
        },
      })
    }
  }
  return dots
}

export const GET: APIRoute = async () => {
  // Resolved from the project root: import.meta.url would point into dist/
  // once this endpoint is bundled.
  const newsreader = await readFile(
    join(process.cwd(), 'src/assets/fonts/Newsreader-Static.ttf')
  )

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
          padding: '84px 90px',
          fontFamily: 'Newsreader',
          position: 'relative',
        },
        children: [
          // Contour motif, top right.
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                top: '70px',
                left: '760px',
                width: '420px',
                height: '150px',
                display: 'flex',
              },
              children: contourMarks(),
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
                    style: {
                      fontSize: '84px',
                      color: INK,
                      letterSpacing: '-1.5px',
                      lineHeight: 1.1,
                    },
                    children: site.name,
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '34px',
                      color: MUTED,
                      marginTop: '18px',
                      lineHeight: 1.4,
                    },
                    children: site.identity,
                  },
                },
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
                    style: {
                      width: '1020px',
                      height: '1px',
                      background: LINE,
                      display: 'flex',
                    },
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      marginTop: '22px',
                      fontSize: '25px',
                      color: ACCENT,
                    },
                    children: `github.com/${site.githubUser}`,
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Newsreader', data: newsreader, weight: 400, style: 'normal' },
      ],
    }
  )

  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } })
    .render()
    .asPng()

  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png' },
  })
}
