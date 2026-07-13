import { copyFile, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const dist = join(root, "dist");

// 主页公告来源：GitHub Discussions 的公告帖，构建时注入正文。
const ANNOUNCEMENT = { owner: "tangmubai", repo: "SJTU-AI-Course", number: 7 };
const ANNOUNCEMENT_SLOT = "<!-- announcement:slot -->";

const siteFiles = [
  "_headers",
  "_redirects",
  "index.html",
  "practice.html",
  "styles.css",
  "app.js",
  "discussion.js",
  "practice.js",
  "questions.js"
];

await mkdir(dist, { recursive: true });

for (const file of siteFiles) {
  await copyFile(join(root, file), join(dist, file));
}

for (const entry of await readdir(root, { withFileTypes: true })) {
  if (entry.isFile() && extname(entry.name).toLowerCase() === ".pdf") {
    await copyFile(join(root, entry.name), join(dist, entry.name));
  }
}

await injectAnnouncement();

console.log(`Built static site in ${dist}`);

async function injectAnnouncement() {
  let discussion;
  try {
    const query = `
      query($owner: String!, $repo: String!, $number: Int!) {
        repository(owner: $owner, name: $repo) {
          discussion(number: $number) { title bodyHTML url updatedAt }
        }
      }`;
    const out = execFileSync("gh", [
      "api", "graphql",
      "-f", `query=${query}`,
      "-f", `owner=${ANNOUNCEMENT.owner}`,
      "-f", `repo=${ANNOUNCEMENT.repo}`,
      "-F", `number=${ANNOUNCEMENT.number}`,
    ], { encoding: "utf8" });
    discussion = JSON.parse(out).data.repository.discussion;
  } catch (error) {
    console.warn(`警告：拉取公告（discussion #${ANNOUNCEMENT.number}）失败，主页将不显示公告。原因：${error.message?.split("\n")[0]}`);
    return;
  }

  const updated = new Date(discussion.updatedAt).toLocaleDateString("zh-CN", {
    year: "numeric", month: "long", day: "numeric", timeZone: "Asia/Shanghai",
  });
  const card = `
        <article class="home-announcement-card">
          <div class="home-announcement-head">
            <span class="announcement-badge">公告</span>
            <h3><a href="${discussion.url}" target="_blank" rel="noopener">${escapeHtml(discussion.title)}</a></h3>
            <span class="announcement-date">${updated} 更新</span>
          </div>
          <div class="home-announcement-body">${discussion.bodyHTML}</div>
        </article>`;

  const indexPath = join(dist, "index.html");
  const html = await readFile(indexPath, "utf8");
  if (!html.includes(ANNOUNCEMENT_SLOT)) {
    console.warn("警告：index.html 中未找到公告占位符，跳过注入。");
    return;
  }
  await writeFile(indexPath, html.replace(ANNOUNCEMENT_SLOT, card));
  console.log(`已注入主页公告：${discussion.title}`);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
