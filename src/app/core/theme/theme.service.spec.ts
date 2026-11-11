import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { THEME_STORAGE_KEY, ThemeService } from './theme.service';

type ChangeListener = (event: MediaQueryListEvent) => void;

function mockSystemTheme(dark: boolean) {
  const listeners: ChangeListener[] = [];
  const media = {
    matches: dark,
    addEventListener: (_: string, listener: ChangeListener) => listeners.push(listener),
    removeEventListener: () => undefined,
  };
  window.matchMedia = (() => media) as unknown as typeof window.matchMedia;
  return {
    change: (matches: boolean) =>
      listeners.forEach((listener) => listener({ matches } as MediaQueryListEvent)),
  };
}

function createService(platform: 'browser' | 'server' = 'browser'): ThemeService {
  TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: platform }] });
  const service = TestBed.inject(ThemeService);
  TestBed.tick();
  return service;
}

const html = () => document.documentElement;

describe('ThemeService', () => {
  beforeEach(() => {
    localStorage.clear();
    html().classList.remove('dark');
  });

  it('follows the system preference by default', () => {
    mockSystemTheme(true);
    const service = createService();

    expect(service.preference()).toBe('system');
    expect(html().classList.contains('dark')).toBe(true);
  });

  it('reacts to system changes while in system mode', () => {
    const system = mockSystemTheme(false);
    const service = createService();

    system.change(true);
    TestBed.tick();

    expect(service.isDark()).toBe(true);
    expect(html().classList.contains('dark')).toBe(true);
  });

  it('applies and stores an explicit preference', () => {
    mockSystemTheme(true);
    const service = createService();

    service.setPreference('light');
    TestBed.tick();

    expect(html().classList.contains('dark')).toBe(false);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
  });

  it('restores the stored preference on start', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    mockSystemTheme(false);
    const service = createService();

    expect(service.preference()).toBe('dark');
    expect(html().classList.contains('dark')).toBe(true);
  });

  it('removes the stored value when going back to system', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    mockSystemTheme(false);
    const service = createService();

    service.setPreference('system');
    TestBed.tick();

    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
    expect(html().classList.contains('dark')).toBe(false);
  });

  it('ignores an unknown stored value', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'sepia');
    mockSystemTheme(false);

    expect(createService().preference()).toBe('system');
  });

  it('does not touch the document or storage on the server', () => {
    mockSystemTheme(true);
    const service = createService('server');

    service.setPreference('dark');
    TestBed.tick();

    expect(html().classList.contains('dark')).toBe(false);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
  });
});
