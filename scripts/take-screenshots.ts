/**
 * Screenshot capture script for Chrome Web Store submission.
 * Captures: dashboard (logged in), and extension button in action.
 *
 * Usage: npx tsx scripts/take-screenshots.ts
 */

import { chromium } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';

const BASE_URL = 'https://nudgesoon.com';
const EMAIL = 'demo@example.com';
const PASSWORD = 'demo1234';
const OUT_DIR = path.resolve(process.cwd(), 'public/images/screenshots');

// Extension styles (from styles.css) — inlined so we can inject into test pages
const EXTENSION_CSS = `
.nudge-chrome-ext-inline-btn {
  display: inline-flex !important;
  align-items: center !important;
  gap: 6px !important;
  background: white !important;
  border: 1px solid #e5e7eb !important;
  border-radius: 9999px !important;
  padding: 4px 10px !important;
  font-family: system-ui, -apple-system, sans-serif !important;
  font-size: 12px !important;
  font-weight: 500 !important;
  color: #111827 !important;
  cursor: pointer !important;
  text-decoration: none !important;
  margin-left: 8px !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
  vertical-align: middle !important;
  line-height: 1 !important;
}
.nudge-chrome-ext-icon {
  width: 14px !important;
  height: 14px !important;
  border-radius: 3px !important;
  display: block !important;
}
`;

async function run() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });

  // ── Screenshot 1: Dashboard ─────────────────────────────────────────────────
  console.log('📸  [1/3] Dashboard screenshot…');
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await ctx.newPage();

    // Sign in via the credentials form
    await page.goto(`${BASE_URL}/auth/signin`);
    await page.getByLabel('Email').fill(EMAIL);
    await page.getByLabel('Password').fill(PASSWORD);
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL(`${BASE_URL}/`);
    // Wait for the loading spinner to disappear
    await page.waitForSelector('.animate-spin', { state: 'hidden', timeout: 10000 }).catch(() => {});
    // Wait for at least one item card to appear
    await page.waitForSelector('[class*="card"], [class*="Card"]', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(1500);
    // Scroll down just past the "Add item" form, keeping the navbar in view
    await page.evaluate(() => window.scrollBy(0, 200));
    await page.waitForTimeout(500);

    const dashboardPath = path.join(OUT_DIR, '1-dashboard.png');
    await page.screenshot({ path: dashboardPath, fullPage: false });
    console.log(`   Saved → ${dashboardPath}`);
    await ctx.close();
  }

  // ── Screenshot 2: Extension button on a mock "account" page ────────────────
  console.log('📸  [2/3] Extension-button-in-action screenshot…');
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await ctx.newPage();

    // Build a realistic-looking insurance/account page with expiry dates
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>My Insurance Account</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #f8f9fa;
      color: #212529;
    }
    /* Minimal nav */
    nav {
      background: #1a56db;
      color: white;
      padding: 0 32px;
      height: 56px;
      display: flex;
      align-items: center;
      gap: 24px;
    }
    nav .logo { font-weight: 700; font-size: 18px; letter-spacing: -0.5px; }
    nav a { color: rgba(255,255,255,0.8); text-decoration: none; font-size: 14px; }

    main { max-width: 900px; margin: 40px auto; padding: 0 24px; }
    h1 { font-size: 26px; font-weight: 700; margin-bottom: 8px; }
    p.sub { color: #6b7280; margin-bottom: 32px; font-size: 15px; }

    .card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 24px 28px;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }
    .card-left { display: flex; align-items: center; gap: 16px; }
    .icon {
      width: 44px; height: 44px;
      background: #eff6ff;
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-size: 22px;
    }
    .card h3 { font-size: 15px; font-weight: 600; margin-bottom: 4px; }
    .meta { font-size: 13px; color: #6b7280; }
    .meta strong { color: #111827; }
    .badge {
      font-size: 12px; font-weight: 600;
      padding: 3px 10px;
      border-radius: 9999px;
    }
    .badge.green { background: #d1fae5; color: #065f46; }
    .badge.amber { background: #fef3c7; color: #92400e; }
    .badge.red   { background: #fee2e2; color: #991b1b; }
    ${EXTENSION_CSS}
  </style>
</head>
<body>
  <nav>
    <span class="logo">InsuranceHub</span>
    <a href="#">Home</a>
    <a href="#">My Policies</a>
    <a href="#">Claims</a>
    <a href="#">Support</a>
  </nav>

  <main>
    <h1>My Policies</h1>
    <p class="sub">Manage and renew your active insurance policies.</p>

    <div class="card">
      <div class="card-left">
        <div class="icon">🚗</div>
        <div>
          <h3>Comprehensive Car Insurance</h3>
          <div class="meta">Policy #AU-8821-C &nbsp;·&nbsp; Expires <strong>Jun 01, 2026</strong><a class="nudge-chrome-ext-inline-btn" href="#"><img class="nudge-chrome-ext-icon" src="https://nudgesoon.com/nudgesoon-icon.png" alt="NudgeSoon" /><span>Save to NudgeSoon</span></a></div>
        </div>
      </div>
      <span class="badge green">Active</span>
    </div>

    <div class="card">
      <div class="card-left">
        <div class="icon">🏠</div>
        <div>
          <h3>Home &amp; Contents Insurance</h3>
          <div class="meta">Policy #AU-4432-H &nbsp;·&nbsp; Expires <strong>Mar 15, 2026</strong><a class="nudge-chrome-ext-inline-btn" href="#"><img class="nudge-chrome-ext-icon" src="https://nudgesoon.com/nudgesoon-icon.png" alt="NudgeSoon" /><span>Save to NudgeSoon</span></a></div>
        </div>
      </div>
      <span class="badge amber">Renews soon</span>
    </div>

    <div class="card">
      <div class="card-left">
        <div class="icon">❤️</div>
        <div>
          <h3>Health Cover — Family Plan</h3>
          <div class="meta">Policy #AU-9901-H &nbsp;·&nbsp; Expires <strong>Jan 31, 2026</strong><a class="nudge-chrome-ext-inline-btn" href="#"><img class="nudge-chrome-ext-icon" src="https://nudgesoon.com/nudgesoon-icon.png" alt="NudgeSoon" /><span>Save to NudgeSoon</span></a></div>
        </div>
      </div>
      <span class="badge red">Expired</span>
    </div>
  </main>
</body>
</html>`;

    await page.setContent(html, { waitUntil: 'load' });
    await page.waitForTimeout(500);

    const btnPath = path.join(OUT_DIR, '2-extension-button.png');
    await page.screenshot({ path: btnPath, fullPage: false });
    console.log(`   Saved → ${btnPath}`);
    await ctx.close();
  }

  // ── Screenshot 3: Sign-in page ──────────────────────────────────────────────
  console.log('📸  [3/3] Sign-in page screenshot…');
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await ctx.newPage();
    await page.goto(`${BASE_URL}/auth/signin`);
    await page.waitForTimeout(1000);

    const signinPath = path.join(OUT_DIR, '3-signin.png');
    await page.screenshot({ path: signinPath, fullPage: false });
    console.log(`   Saved → ${signinPath}`);
    await ctx.close();
  }

  await browser.close();
  console.log('\n✅  All screenshots saved to', OUT_DIR);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
