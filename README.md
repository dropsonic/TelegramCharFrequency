# Telegram Char Frequency Analyzer

A helper tool that analyzes char frequency in Telegram chat history exported as JSON.

## Motivation

Char frequency analysis is typically used when developing new keyboard layouts for programmable keyboards, e.g., based on [QMK](https://qmk.fm/). Since a lot of mechanical keyboards, especially ergonomic keyboards like [ZSA Moonlander Mark I](https://www.zsa.io/moonlander/) or [Ergodox EZ](https://ergodox-ez.com/), have much fewer keys than a standard keyboard, some less-used keycodes are put into [layers](https://keebmaker.com/pages/layers). That's where char frequency analysis comes into play.

Since existing frequency statistic is based on language corpuses, like [the Corpus of Contemporary American English (COCA)](https://www.english-corpora.org/coca/), the texts are quite different from how we typically use our keyboards in online messengers or email. For example, using `')'` might be much more frequent in online messengers than using `'-'` or even `'.'` because of typing emoji codes.

## Exporting Data From Telegram

The official guide: [Chat Export Tool](https://telegram.org/blog/export-and-more). You can export the whole history or just the history for a particular chat.

When exporting, please select `Machine-readable JSON` in the `Location and format` section.

## Usage

```
Usage: telegramcharfrequency [options] <inputFile>

A console tool to count characters frequency in Telegram chat history exported as JSON

Arguments:
  inputFile                         Telegram history exported as a JSON file

Options:
  -V, --version                     output the version number
  -u, --user <user-id>              Telegram User ID (you can use userinfobot to get it)
  --skip-emojis                     Skips emojis when counting frequencies
  -c, --categories [categories...]  Specific character categories to count (see https://unicode.org/reports/tr18/#General_Category_Property for more details)
                                    (choices: "Letter", "Mark", "Number", "Symbol", "Punctuation", "Separator", "Other")
  --include-code-points             Includes Unicode code points into the output to better distinguish similar characters
  -h, --help                        display help for command
```

An example:

```
telegramcharfrequency "C:\Users\myuser\Downloads\Telegram Desktop\DataExport_2023-07-23\result.json -u user123456789 --skip-emojis --include-code-points -c Symbol Punctuation
```

## Implementation Details

The implementation uses [`stream-json`](https://www.npmjs.com/package/stream-json) to parse and process huge JSON files without excessive memory consumption since typical Telegram history can reach hundreds of megabytes.
