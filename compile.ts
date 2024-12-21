import { run } from "shell-commands";

// deno requires local import paths to have the .ts extension
// tsc requires local import paths to have the .js extension
const main = async () => {
  await run(
    `find src -type f -name "*.ts" -exec sed -i '' 's/from "\\(\\.\\/.*\\)\\.ts";/from "\\1.js";/g' {} +`
  );
  try {
    await run("yarn tsc");
  } finally {
    await run(
      `find src -type f -name "*.ts" -exec sed -i '' 's/from "\\(\\.\\/.*\\)\\.js";/from "\\1.ts";/g' {} +`
    );
  }
};
main();
