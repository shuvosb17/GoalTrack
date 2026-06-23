const fs = require("fs");
const path = require("path");

const contentDir = path.join(__dirname, "../src/lib/pattern-notes/content");
const replacements = [
  ["\u00e2\u2020\u2019", "->"],
  ["\u00e2\u20ac\u201d", " - "],
  ["\u00e2\u02dc\u2019", "-"],
  ["\u00e2\u2030 ", "!= "],
  ["\u00e2\u2030\u00a4", "<="],
  ["\u00e2\u2030\u00a5", ">="],
];

for (const file of fs.readdirSync(contentDir)) {
  if (!file.endsWith(".ts")) continue;
  const fp = path.join(contentDir, file);
  let text = fs.readFileSync(fp, "utf8");
  let changed = false;
  for (const [from, to] of replacements) {
    if (text.includes(from)) {
      text = text.split(from).join(to);
      changed = true;
    }
  }
  if (changed) fs.writeFileSync(fp, text, "utf8");
}
console.log("Done");
