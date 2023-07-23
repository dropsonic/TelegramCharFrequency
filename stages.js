const { Transform } = require('stream');

const messagesOnly = (msg) => (msg.type === 'message' ? msg : null);

const hasText = (msg) =>
  msg.text_entities && msg.text_entities.length > 0 ? msg : null;

const fromUser = (userId) =>
  userId ? (msg) => (msg.from_id === userId ? msg : null) : (msg) => msg;

const notForwardedOnly = (msg) => (!msg.forwarded_from ? msg : null);

const pickTextEntities = (msg) => msg.text_entities;

const authoredTextEntitiesOnly = (textEntity) =>
  [
    'plain',
    'bold',
    'italic',
    'underline',
    'strikethrough',
    'spoiler',
    'phone',
    'email',
    'hashtag',
    'code',
    'pre',
  ].includes(textEntity.type)
    ? textEntity
    : null;

const countChars =
  (categories) =>
  ({ type, text }) => {
    const map = {};
    text = text?.normalize('NFC');

    let regexp;

    if (categories && categories.length > 0) {
      const pattern = `[^${categories
        .map((c) => `\\p{General_Category=${c}}`)
        .join('')}]`;
      regexp = new RegExp(pattern, 'gu');
      text = text.replace(regexp, '');
    }

    if (['code', 'pre'].includes(type) && (!regexp || !'`'.match(regexp))) {
      if (!map['`']) map['`'] = 0;

      if (type === 'code') {
        map['`'] += 1 * 2;
      } else if (type === 'pre') {
        map['`'] += 3 * 2;
      }
    }

    for (let char of text) {
      if (char === '\n') {
        char = '<new line>';
      } else if (char === ' ') {
        char = '<space>';
      } else if (char === ' ') {
        char = '<nbsp>';
      }

      if (!map[char]) {
        map[char] = 0;
      }

      map[char] += 1;
    }

    return map;
  };

const createReducer = (map = {}, options = {}) =>
  new Transform({
    objectMode: true,
    ...options,

    transform(chunk, encoding, callback) {
      for (let key in chunk) {
        if (!map[key]) {
          map[key] = 0;
        }

        map[key] += chunk[key];
      }

      return callback();
    },

    flush(callback) {
      callback(null, map);
    },
  });

const createSorter = (options = {}) =>
  new Transform({
    objectMode: true,
    ...options,

    transform(chunk, encoding, callback) {
      const entries = Object.entries(chunk);
      entries.sort((a, b) => b[1] - a[1]);
      const sorted = new Map(entries);

      return callback(null, sorted);
    },
  });

module.exports = {
  messagesOnly,
  hasText,
  fromUser,
  notForwardedOnly,
  pickTextEntities,
  authoredTextEntitiesOnly,
  countChars,
  createReducer,
  createSorter,
};
