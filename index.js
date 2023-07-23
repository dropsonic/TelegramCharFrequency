#!/usr/bin/env node

const { program, Option } = require('commander');
const pkg = require('./package.json');
const { chain } = require('stream-chain');
const { parser } = require('stream-json');
const { pick } = require('stream-json/filters/Pick');
const { streamArray } = require('stream-json/streamers/StreamArray');
const fs = require('fs');
const emj = require('unicode-emoji-toolkit');
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
  .option('--skip-emojis', 'Skips emojis when counting frequencies')
  .addOption(
    new Option(
      '-c, --categories [categories...]',
      'Specific character categories to count (see https://unicode.org/reports/tr18/#General_Category_Property for more details)'
    ).choices([
      'Letter',
      'Mark',
      'Number',
      'Symbol',
      'Punctuation',
      'Separator',
      'Other',
    ])
  )
  .option(
    '--include-code-points',
    'Includes Unicode code points into the output to better distinguish similar characters'
  )
  .action((filename, { user, skipEmojis, categories, includeCodePoints }) => {
    user = user?.trim();
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
      countChars(categories),
      reduce,
      sort,
      (map) => {
        for (const [key, value] of map) {
          if (!skipEmojis || !emj.hasOnlyEmojis(key)) {
            console.log(
              includeCodePoints
                ? `'${key}' (0x${key.codePointAt(0).toString(16)}): ${value}`
                : `'${key}': ${value}`
            );
          }
        }
      },
    ]);

    pipeline.on('error', (err) => program.error(err.message));
  });

program.parse(process.argv);
