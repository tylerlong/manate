import { run } from 'shell-commands';

const main = async () => {
  await run(`
    tsc
    cp lib/* .
    rm -rf lib
  `);
  await run('npm publish');
  await run(`
    rm index.d.ts
    rm index.js
    rm models.d.ts
    rm models.js
    rm react.d.ts
    rm react.js
  `);
};
main();
