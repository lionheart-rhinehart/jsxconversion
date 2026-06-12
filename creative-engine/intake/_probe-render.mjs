// Render-fidelity probe: load the tagged HTML headless, count broken media.
import puppeteer from 'puppeteer';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const file = process.argv[2];
const url = pathToFileURL(path.resolve(file)).href;
const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 1600 });
const failed = [];
page.on('requestfailed', (r) => failed.push(r.url().split('/').slice(-2).join('/')));
await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
await new Promise((r) => setTimeout(r, 1500));

const stats = await page.evaluate(() => {
  const imgs = [...document.querySelectorAll('img')];
  const vids = [...document.querySelectorAll('video')];
  const brokenImgs = imgs.filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.getAttribute('src'));
  const brokenVids = vids.filter((v) => v.readyState < 1).map((v) => v.getAttribute('src'));
  return {
    frames: document.querySelectorAll('.cr-frame').length,
    imgs: imgs.length, vids: vids.length,
    tagged: document.querySelectorAll('[data-edit-id]').length,
    brokenImgs, brokenVids,
  };
});
console.log('frames           :', stats.frames);
console.log('tagged elements  :', stats.tagged);
console.log('imgs / videos    :', stats.imgs, '/', stats.vids);
console.log('broken images    :', stats.brokenImgs.length, stats.brokenImgs.slice(0, 5));
console.log('broken videos    :', stats.brokenVids.length, stats.brokenVids.slice(0, 5));
console.log('failed requests  :', failed.length, failed.slice(0, 8));
await browser.close();
process.exit(stats.brokenImgs.length === 0 ? 0 : 2);
