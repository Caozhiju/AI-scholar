const fs = require("fs");
// Remove "import type { Stage }" from all phase files to fully eliminate circular dependency
for (const n of [1, 2, 3, 4]) {
  const p = `src/data/courses.phase${n}.ts`;
  let c = fs.readFileSync(p, "utf8");
  c = c.replace(/import type \{ Stage(, Course)?\} from "\.\/courses"\n\n?/, "");
  fs.writeFileSync(p, c, "utf8");
  console.log(`Phase ${n}: removed import type`);
}

// Verify
for (const n of [1, 2, 3, 4]) {
  const c = fs.readFileSync(`src/data/courses.phase${n}.ts`, "utf8");
  console.log(`Phase ${n} first line: ${c.split('\n')[0]}`);
}
