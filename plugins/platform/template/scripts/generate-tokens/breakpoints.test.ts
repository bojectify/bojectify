import { generateBreakpointTs } from './breakpoints.js';

describe('generateBreakpointTs', () => {
  it('sorts entries ascending by numeric value', () => {
    const widths = new Map([
      ['xs', 0],
      ['m', 768],
      ['s', 567],
    ]);
    const result = generateBreakpointTs(widths);

    const posXs = result.indexOf('XS:');
    const posS = result.indexOf('S:');
    const posM = result.indexOf('M:');
    expect(posXs).toBeLessThan(posS);
    expect(posS).toBeLessThan(posM);
  });

  it('includes the ObjectValues import line', () => {
    const result = generateBreakpointTs(new Map([['xs', 0]]));

    expect(result).toContain(
      "import { ObjectValues } from '@model/types/utility.types'"
    );
  });

  it('includes a BREAKPOINTS object with uppercase keys and lowercase string values', () => {
    const widths = new Map([
      ['xs', 0],
      ['m', 768],
      ['s', 567],
    ]);
    const result = generateBreakpointTs(widths);

    expect(result).toContain("XS: 'xs'");
    expect(result).toContain("S: 's'");
    expect(result).toContain("M: 'm'");
    expect(result).toContain('export const BREAKPOINTS =');
  });

  it('includes the Breakpoint type derived from BREAKPOINTS', () => {
    const result = generateBreakpointTs(new Map([['xs', 0]]));

    expect(result).toContain(
      'export type Breakpoint = ObjectValues<typeof BREAKPOINTS>'
    );
  });

  it('includes BREAKPOINT_WIDTHS with numeric values (no px)', () => {
    const widths = new Map([
      ['xs', 0],
      ['s', 567],
      ['m', 768],
    ]);
    const result = generateBreakpointTs(widths);

    expect(result).toContain('export const BREAKPOINT_WIDTHS =');
    expect(result).toContain('[BREAKPOINTS.XS]: 0');
    expect(result).toContain('[BREAKPOINTS.S]: 567');
    expect(result).toContain('[BREAKPOINTS.M]: 768');
    // Values must be numeric, not strings with px
    expect(result).not.toContain('px');
  });

  it('produces correctly ordered output for xs, s, m input', () => {
    const widths = new Map([
      ['xs', 0],
      ['m', 768],
      ['s', 567],
    ]);
    const result = generateBreakpointTs(widths);

    // Check BREAKPOINTS object lines appear in ascending order
    const lines = result.split('\n');
    const bpLines = lines.filter((l) => /^\s+(XS|S|M):/.test(l));
    expect(bpLines[0]).toContain('XS:');
    expect(bpLines[1]).toContain('S:');
    expect(bpLines[2]).toContain('M:');
  });
});
