import { run } from 'shell-commands';

const main = async () => {
  await run(`
    rm index.d.ts
    rm index.js
    rm models.d.ts
    rm models.js
    rm react.d.ts
    rm react.js
    rm event-emitter.d.ts
    rm event-emitter.js
  `);
};
main();
