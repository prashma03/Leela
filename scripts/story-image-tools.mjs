import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const root = process.cwd();
const storyFile = join(root, "app", "stories.ts");
const placeholderDir = join(root, "public", "images", "stories", "placeholders");
const manifestFile = join(root, "docs", "story-image-manifest.csv");
const curatedIds = new Set(["butter", "kaliya", "govardhan", "flute", "sudama", "universe"]);
const palettes = {
  gold: ["#f4e3b7", "#c7893f", "#245f5b"],
  teal: ["#d7e8df", "#4f8d84", "#d2a34f"],
  blue: ["#dbe4eb", "#67839b", "#d2a34f"],
  rose: ["#f1d9d0", "#b76f69", "#2f6863"],
  sand: ["#eadcc5", "#ad8151", "#356d65"],
  violet: ["#e3dce8", "#776d89", "#d2a34f"],
};

function escapeXml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function field(line, name) {
  return line.match(new RegExp(`${name}:"((?:\\\\.|[^"\\\\])*)"`))?.[1]?.replaceAll('\\"', '"') ?? "";
}

function records(source) {
  return source.split(/\r?\n/).filter(line => line.startsWith("{id:")).map(line => ({
    line,
    id: field(line, "id"),
    title: field(line, "title"),
    subtitle: field(line, "subtitle"),
    tone: field(line, "tone"),
    image: field(line, "image"),
    alt: field(line, "imageAlt"),
  }));
}

function seedFor(value) {
  return [...value].reduce((sum, character, index) => sum + character.charCodeAt(0) * (index + 3), 0);
}

function sceneFor(title, subtitle) {
  const text = `${title} ${subtitle}`.toLowerCase();
  if (/butter|sweet/.test(text)) return ["butter pots", "inside a warm Gokul courtyard"];
  if (/flute|song/.test(text)) return ["a flute and listening birds", "beneath a kadamba tree"];
  if (/calf|cow/.test(text)) return ["a gentle calf", "along a green pasture path"];
  if (/storm|fire|govardhan/.test(text)) return ["sheltering clouds and hills", "outside Vrindavan"];
  if (/lamp|prayer|temple/.test(text)) return ["a glowing evening lamp", "near quiet temple steps"];
  if (/flower|garland/.test(text)) return ["lotus flowers and a garland", "in a flowering grove"];
  if (/friend|guest|elder|child/.test(text)) return ["friends gathered together", "in a village meeting place"];
  if (/river|water|kaliya|muddy/.test(text)) return ["the Yamuna and river reeds", "beside the riverbank"];
  if (/fruit|basket|meal/.test(text)) return ["a shared basket of food", "on a village market path"];
  if (/rope|promise|quarrel|tears/.test(text)) return ["two children making peace", "in a sunlit courtyard"];
  return ["a peacock feather and village path", "in gentle Vrindavan"];
}

function motifMarkup(scene, seed, accent, ink) {
  const x = 120 + seed % 320;
  if (scene.includes("flute")) return `<g stroke="${ink}" stroke-width="18" stroke-linecap="round"><path d="M150 540 L560 410"/><circle cx="${x}" cy="478" r="8" fill="${accent}"/><circle cx="${x + 82}" cy="452" r="8" fill="${accent}"/><circle cx="${x + 164}" cy="426" r="8" fill="${accent}"/></g>`;
  if (scene.includes("calf")) return `<g fill="${ink}"><ellipse cx="360" cy="510" rx="155" ry="88"/><circle cx="530" cy="455" r="62"/><path d="M505 410 470 345 535 390ZM555 414 602 352 578 431Z"/><rect x="250" y="568" width="30" height="115" rx="15"/><rect x="438" y="568" width="30" height="115" rx="15"/></g>`;
  if (scene.includes("lamp")) return `<g><path d="M220 590 Q360 720 500 590 Z" fill="${ink}"/><path d="M360 570 C285 490 330 380 390 330 C420 430 450 505 360 570Z" fill="${accent}"/><circle cx="360" cy="475" r="96" fill="none" stroke="${accent}" stroke-width="8" opacity=".45"/></g>`;
  if (scene.includes("flower")) return `<g fill="${accent}" transform="translate(360 500)">${Array.from({ length: 8 }, (_, i) => `<ellipse cx="0" cy="-115" rx="48" ry="120" transform="rotate(${i * 45})" opacity="${0.62 + (i % 3) * .12}"/>`).join("")}<circle r="66" fill="${ink}"/></g>`;
  if (scene.includes("basket") || scene.includes("food")) return `<g><path d="M190 500 Q360 760 530 500 Z" fill="${ink}"/><path d="M220 500 Q360 310 500 500" fill="none" stroke="${ink}" stroke-width="22"/><circle cx="290" cy="490" r="45" fill="${accent}"/><circle cx="380" cy="465" r="52" fill="${accent}"/><circle cx="460" cy="500" r="38" fill="${accent}"/></g>`;
  if (scene.includes("cloud")) return `<g><path d="M85 570 292 275 405 430 510 310 650 570Z" fill="${ink}"/><g fill="${accent}" opacity=".8"><circle cx="235" cy="260" r="70"/><circle cx="330" cy="235" r="92"/><circle cx="440" cy="270" r="72"/><rect x="210" y="270" width="260" height="75" rx="38"/></g></g>`;
  if (scene.includes("river")) return `<g><path d="M0 520 Q150 450 300 520 T720 520 V760 H0Z" fill="${ink}" opacity=".8"/><path d="M40 600 Q190 530 340 600 T680 600" fill="none" stroke="${accent}" stroke-width="14"/><path d="M130 510v-150m0 55-55-65m55 95 65-80M590 520V355m0 55-60-62m60 90 65-88" stroke="${ink}" stroke-width="15" stroke-linecap="round"/></g>`;
  if (scene.includes("friends") || scene.includes("children")) return `<g fill="${ink}"><circle cx="260" cy="425" r="58"/><circle cx="460" cy="425" r="58"/><path d="M170 650q15-165 90-165t90 165Z"/><path d="M370 650q15-165 90-165t90 165Z"/></g><path d="M295 505 Q360 555 425 505" fill="none" stroke="${accent}" stroke-width="18" stroke-linecap="round"/>`;
  if (scene.includes("butter")) return `<g><path d="M170 455 Q360 770 550 455 Z" fill="${ink}"/><ellipse cx="360" cy="455" rx="190" ry="70" fill="${accent}"/><path d="M280 420 Q360 300 440 420" fill="none" stroke="#fff7dc" stroke-width="38" stroke-linecap="round"/><circle cx="235" cy="570" r="18" fill="${accent}"/><circle cx="485" cy="585" r="14" fill="${accent}"/></g>`;
  return `<g transform="translate(360 500)"><path d="M0-210C-110-165-145-35-50 55 35-15 80-110 0-210Z" fill="${ink}"/><path d="M-30 30C-150 55-175 180-75 230 15 170 40 85-30 30Z" fill="${accent}"/><circle cx="-18" cy="-120" r="34" fill="${accent}"/><circle cx="-18" cy="-120" r="15" fill="${ink}"/></g>`;
}

function placeholderSvg(story) {
  const seed = seedFor(story.id);
  const [scene, setting] = sceneFor(story.title, story.subtitle);
  const [paper, accent, ink] = palettes[story.tone] || palettes.gold;
  const sunX = 100 + seed % 520;
  const hill = 120 + seed % 130;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 900" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(story.title)}</title><desc id="desc">Temporary original illustration of ${escapeXml(scene)} ${escapeXml(setting)}.</desc>
  <rect width="720" height="900" fill="${paper}"/><circle cx="${sunX}" cy="170" r="95" fill="${accent}" opacity=".34"/>
  <path d="M0 ${610 + seed % 50} Q${hill} ${430 + seed % 80} ${hill * 2} ${620 - seed % 40} T720 580 V900 H0Z" fill="${accent}" opacity=".3"/>
  <path d="M0 720 Q180 ${650 + seed % 55} 360 720 T720 700 V900 H0Z" fill="${ink}" opacity=".16"/>
  ${motifMarkup(scene, seed, accent, ink)}
  <rect x="42" y="42" width="636" height="816" rx="22" fill="none" stroke="${ink}" stroke-width="3" opacity=".22"/>
  <text x="52" y="790" fill="${ink}" font-family="Georgia,serif" font-size="34">${escapeXml(story.title.length > 32 ? story.title.slice(0, 30) + "…" : story.title)}</text>
  <text x="54" y="828" fill="${ink}" opacity=".72" font-family="Arial,sans-serif" font-size="16" letter-spacing="3">TEMPORARY LEELA ARTWORK</text>
</svg>\n`;
}

function generatedAlt(story) {
  const [scene, setting] = sceneFor(story.title, story.subtitle);
  return `Original temporary storybook illustration of ${scene} ${setting} for ${story.title}, ${story.subtitle.toLowerCase()}`;
}

function generate() {
  mkdirSync(placeholderDir, { recursive: true });
  let source = readFileSync(storyFile, "utf8");
  const before = records(source);
  for (const story of before) {
    if (curatedIds.has(story.id)) continue;
    writeFileSync(join(placeholderDir, `${story.id}.svg`), placeholderSvg(story));
  }
  source = source.split(/\r?\n/).map(line => {
    if (!line.startsWith("{id:")) return line;
    const story = before.find(item => item.id === field(line, "id"));
    if (!story || curatedIds.has(story.id)) return line;
    const replacement = `image:"/images/stories/placeholders/${story.id}.svg",imageAlt:"${generatedAlt(story)}"`;
    return line.replace(/image:"[^"]+",imageAlt:"[^"]+"/, replacement);
  }).join("\n");
  writeFileSync(storyFile, source);
  writeManifest(records(source));
}

function writeManifest(stories) {
  mkdirSync(dirname(manifestFile), { recursive: true });
  const rows = ["story_id,title,status,image_path"];
  for (const story of stories) {
    const status = curatedIds.has(story.id) ? "final-existing-artwork" : "temporary-needs-final-artwork";
    rows.push([story.id, story.title, status, story.image].map(value => `"${value.replaceAll('"', '""')}"`).join(","));
  }
  writeFileSync(manifestFile, rows.join("\n") + "\n");
}

function verify() {
  const stories = records(readFileSync(storyFile, "utf8"));
  const errors = [];
  const ids = new Set();
  const images = new Set();
  for (const story of stories) {
    if (!story.id || ids.has(story.id)) errors.push(`Duplicate or missing story id: ${story.id}`);
    if (!story.image || images.has(story.image)) errors.push(`Duplicate or missing image for ${story.id}: ${story.image}`);
    if (!story.alt || (!curatedIds.has(story.id) && !story.alt.toLowerCase().includes(story.title.toLowerCase()))) errors.push(`Missing story-specific alt text for ${story.id}`);
    ids.add(story.id); images.add(story.image);
    const diskPath = join(root, "public", ...story.image.split("/").filter(Boolean));
    if (!existsSync(diskPath)) errors.push(`Broken image path for ${story.id}: ${story.image}`);
  }
  if (!existsSync(join(root, "public", "images", "stories", "story-fallback.svg"))) errors.push("Missing intentional fallback image");
  if (errors.length) throw new Error(errors.join("\n"));
  console.log(`Verified ${stories.length} unique story IDs, image paths, alt texts, and local files.`);
}

if (process.argv.includes("--generate")) generate();
verify();
