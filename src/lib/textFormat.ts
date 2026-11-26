export const normalizeLegacySymbols = (text: string): string =>
  text
    .replace(/\uF0AE|\uF0E0/g, '→')
    .replace(/\uF0DF/g, '←')
    .replace(/\uF0A3/g, '≤')
    .replace(/\uF0B3/g, '≥')
    .replace(/\uF0B8/g, '÷')
    .replace(/\uF0B4/g, '×')
    .replace(/\uF0B9/g, '≠')

export const normalizeMathDelimiters = (text: string): string =>
  text
    .replace(/\\\((.+?)\\\)/gs, (_, expression: string) => `$${expression}$`)
    .replace(/\\\[(.+?)\\\]/gs, (_, expression: string) => `$$${expression}$$`)

// Answer choices are one line of text, so Markdown block syntax at the start must stay literal:
// a choice like "25." would otherwise render as an empty numbered-list item (reported: 2022S_FE_AM_12).
export const escapeBlockStart = (text: string): string =>
  text.replace(/^(\s*)(\d+)([.)])(?=\s|$)/, '$1$2\\$3').replace(/^(\s*)([-+*#>])(?=\s)/, '$1\\$2')
