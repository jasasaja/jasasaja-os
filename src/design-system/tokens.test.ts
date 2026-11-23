import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { MINIMUM_IMPORTANT_TEXT_PX, TYPOGRAPHY_CLASSES } from './tokens.ts';

describe('consolidated design system tokens', () => {
  it('defines explicit line-height utilities and excludes 12px/11px important text presets', () => {
    assert.ok(MINIMUM_IMPORTANT_TEXT_PX >= 13);

    for (const [role, cls] of Object.entries(TYPOGRAPHY_CLASSES)) {
      assert.ok(
        /leading-(tight|snug|normal|relaxed)/.test(cls),
        `${role} must explicitly specify a line-height class`,
      );
      assert.ok(!cls.includes('text-xs'), `${role} must not use 12px (text-xs)`);
      assert.ok(!cls.includes('text-[12px]'), `${role} must not use 12px`);
      assert.ok(!cls.includes('text-[11px]'), `${role} must not use 11px`);
    }
  });

  it('keeps single-source font fallbacks and line-height variables in src/index.css', () => {
    const cssPath = path.resolve(process.cwd(), 'src/index.css');
    const css = fs.readFileSync(cssPath, 'utf8');

    // Font fallbacks present
    assert.match(css, /--font-display:\s*"Plus Jakarta Sans"[^;]*system-ui,\s*sans-serif;/);
    assert.match(css, /--font-sans:\s*"DM Sans"[^;]*system-ui,\s*sans-serif;/);
    assert.match(css, /--font-mono:\s*"JetBrains Mono"[^;]*monospace;/);

    // Line-height tokens defined once (no duplicate definitions in @theme and :root)
    for (const token of ['--leading-tight', '--leading-snug', '--leading-normal', '--leading-relaxed']) {
      const matches = css.match(new RegExp(`${token}:`, 'g')) ?? [];
      assert.equal(matches.length, 1, `${token} should be defined exactly once in src/index.css`);
    }
  });
});
