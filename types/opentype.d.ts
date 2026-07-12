declare module "opentype.js" {
  export interface BoundingBox {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  }

  export interface Path {
    getBoundingBox(): BoundingBox;
    toPathData(precision?: number): string;
  }

  export interface Glyph {
    name?: string;
    index: number;
    unicode?: number;
    advanceWidth: number;
  }

  export interface Font {
    unitsPerEm: number;
    ascender: number;
    descender: number;
    getAdvanceWidth(text: string, fontSize: number): number;
    getPath(text: string, x: number, y: number, fontSize: number): Path;
    charToGlyph(character: string): Glyph;
    stringToGlyphs(text: string): Glyph[];
  }

  export function parse(data: ArrayBuffer | Buffer): Font;

  const opentype: {
    parse: typeof parse;
  };

  export default opentype;
}
