#!/usr/bin/env node

const { program } = require('commander');
const pkg = require('./package.json');
const { chain } = require('stream-chain');
const { parser } = require('stream-json');
const { pick } = require('stream-json/filters/Pick');
const { streamArray } = require('stream-json/streamers/StreamArray');
const fs = require('fs');
const {
  messagesOnly,
  hasText,
  fromUser,
  notForwardedOnly,
  pickTextEntities,
  authoredTextEntitiesOnly,
  countChars,
  createReducer,
  createSorter,
} = require('./stages');

program.name(pkg.name).description(pkg.description).version(pkg.version);

program
  .argument('<inputFile>', 'Telegram history exported as a JSON file')
  .option(
    '-u, --user <user-id>',
    'Telegram User ID (you can use userinfobot to get it)'
  )
  .action((filename, { user }) => {
    const reduce = createReducer();
    const sort = createSorter();

    const pipeline = chain([
      fs.createReadStream(filename),
      parser(),
      pick({ filter: /^.*messages/ }),
      streamArray(),
      (data) => data.value,
      messagesOnly,
      hasText,
      fromUser(user),
      notForwardedOnly,
      pickTextEntities,
      authoredTextEntitiesOnly,
      countChars,
      reduce,
      sort,
      (map) => {
        for (const [key, value] of map) {
          console.log(`'${key}': ${value}`);
        }
      },
    ]);

    pipeline.on('error', (err) => program.error(err.message));
  });

program.parse(process.argv);
