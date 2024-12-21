import { run } from "shell-commands";

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
