import fs from 'fs';
import path from 'path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { TrendCard } from '../types';

// Mirrors the "Deep Teal glass" tokens from the app's constants/theme.ts and
// the website's styles.css. Kept as a plain copy here rather than imported
// because this server is a separate TS project/build from the Expo app -
// if the brand palette changes, update all three.
const COLORS = {
  bg: '#152D35',
  textPrimary: '#EAF6F2',
  textSecondary: '#A9C4BE',
  accent: '#D4ECDD',
  category: {
    politics: '#FF7D96',
    finance: '#FFC24B',
    sport: '#4ADE80',
    entertainment: '#F472B6',
    tech: '#D4ECDD',
    world: '#5CC8FA',
  } as Record<string, string>,
  categoryGradient: {
    politics: ['rgba(255, 92, 122, 0.32)', 'rgba(21, 45, 53, 0)'],
    finance: ['rgba(255, 194, 75, 0.30)', 'rgba(21, 45, 53, 0)'],
    sport: ['rgba(74, 222, 128, 0.28)', 'rgba(21, 45, 53, 0)'],
    entertainment: ['rgba(244, 114, 182, 0.30)', 'rgba(21, 45, 53, 0)'],
    tech: ['rgba(212, 236, 221, 0.28)', 'rgba(21, 45, 53, 0)'],
    world: ['rgba(56, 189, 248, 0.30)', 'rgba(21, 45, 53, 0)'],
  } as Record<string, [string, string]>,
};

const WIDTH = 1080;
const HEIGHT = 1350; // Instagram's max-height 4:5 feed post - more real estate than a 1:1 square.

// satori takes plain object nodes (no JSX/React needed) shaped like
// { type, props: { style, children } } - this is a small hyperscript-style
// helper so the template below reads like markup.
type Node = { type: string; props: Record<string, any> };
function h(type: string, style: Record<string, any> = {}, children?: any): Node {
  return { type, props: { style, children } };
}

type FontWeight = 600 | 700 | 800;
let fontsPromise: Promise<{ name: string; data: Buffer; weight: FontWeight; style: 'normal' }[]> | null = null;

function loadFonts() {
  if (!fontsPromise) {
    fontsPromise = (async () => {
      const pkgDir = path.dirname(require.resolve('@expo-google-fonts/manrope/package.json'));
      const weights: [string, FontWeight][] = [
        ['600SemiBold/Manrope_600SemiBold.ttf', 600],
        ['700Bold/Manrope_700Bold.ttf', 700],
        ['800ExtraBold/Manrope_800ExtraBold.ttf', 800],
      ];
      return weights.map(([file, weight]) => ({
        name: 'Manrope',
        data: fs.readFileSync(path.join(pkgDir, file)),
        weight,
        style: 'normal' as const,
      }));
    })();
  }
  return fontsPromise;
}

function buildTemplate(card: TrendCard) {
  const categoryColor = COLORS.category[card.category] ?? COLORS.accent;
  const [gradFrom, gradTo] = COLORS.categoryGradient[card.category] ?? [COLORS.accent, COLORS.bg];

  return h('div', {
    width: WIDTH,
    height: HEIGHT,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: COLORS.bg,
    backgroundImage: `linear-gradient(180deg, ${gradFrom} 0%, ${gradTo} 55%)`,
    padding: '72px 64px',
    fontFamily: 'Manrope',
  }, [
    h('div', {
      display: 'flex',
      alignSelf: 'flex-start',
      padding: '10px 22px',
      borderRadius: 999,
      border: `2px solid ${categoryColor}`,
      color: categoryColor,
      fontSize: 30,
      fontWeight: 700,
      letterSpacing: 2,
    }, card.category.toUpperCase()),

    h('div', {
      display: 'flex',
      flexGrow: 1,
      flexDirection: 'column',
      justifyContent: 'center',
      gap: 36,
    }, [
      h('div', {
        display: 'flex',
        fontSize: 66,
        fontWeight: 800,
        color: COLORS.textPrimary,
        lineHeight: 1.2,
      }, card.title),
      h('div', {
        display: 'flex',
        fontSize: 38,
        fontWeight: 500,
        color: COLORS.textSecondary,
        lineHeight: 1.4,
      }, card.summary),
    ]),

    h('div', {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
    }, [
      h('div', {
        display: 'flex',
        width: 14,
        height: 14,
        borderRadius: 999,
        backgroundColor: COLORS.accent,
      }),
      h('div', {
        display: 'flex',
        fontSize: 34,
        fontWeight: 800,
        color: COLORS.accent,
        letterSpacing: 1,
      }, 'WHYRL'),
    ]),
  ]);
}

export async function renderCardImage(card: TrendCard): Promise<Buffer> {
  const fonts = await loadFonts();
  const svg = await satori(buildTemplate(card) as any, { width: WIDTH, height: HEIGHT, fonts });
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: WIDTH } });
  return resvg.render().asPng();
}
