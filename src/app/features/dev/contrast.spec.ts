import { composite, contrastRatio, mixColors, parseColor } from './contrast';

describe('contrast', () => {
  it('parses hex and rgba tokens', () => {
    expect(parseColor('#0B63B6')).toEqual({ r: 11, g: 99, b: 182, a: 1 });
    expect(parseColor('#fff')).toEqual({ r: 255, g: 255, b: 255, a: 1 });
    expect(parseColor('rgba(17, 28, 41, 0.45)')).toEqual({ r: 17, g: 28, b: 41, a: 0.45 });
    expect(parseColor('rgb(10 18 28 / 35%)')).toEqual({ r: 10, g: 18, b: 28, a: 0.35 });
  });

  it('rejects unsupported formats', () => {
    expect(() => parseColor('hsl(0 0% 0%)')).toThrow();
  });

  it('computes the WCAG ratio', () => {
    expect(contrastRatio(parseColor('#000'), parseColor('#fff'))).toBeCloseTo(21, 5);
    expect(contrastRatio(parseColor('#fff'), parseColor('#0B63B6'))).toBeCloseTo(6.04, 2);
  });

  it('reproduces the light worst case of design-system.md §6', () => {
    const base = mixColors(parseColor('#E6F0FB'), parseColor('#F6EEEC'), 0.06);
    const backdrop = composite(parseColor('rgba(11, 99, 182, 0.45)'), base);
    const glass = composite(parseColor('rgba(255, 255, 255, 0.5)'), backdrop);

    expect(contrastRatio(parseColor('#0E1B2A'), glass)).toBeCloseTo(11.85, 1);
    expect(contrastRatio(parseColor('#3E5367'), glass)).toBeCloseTo(5.43, 1);
    expect(contrastRatio(parseColor('#5A6B80'), glass)).toBeCloseTo(3.72, 1);
  });
});
