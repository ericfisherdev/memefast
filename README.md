<p align="center"><img src="assets/logo.svg" alt="MemeFast logo" width="160"></p>

# MemeFast

A fast, ad-free meme generator for the desktop. Pick an image, crop it, add top and bottom text in an Impact-style font, and drag the text anywhere you like.

## Features

- Open an image from disk, drag and drop it, or paste it from the clipboard
- Crop with free or locked aspect ratios (1:1, 4:3, 16:9, 3:4, 9:16)
- Top and bottom text with multi-line support (Enter adds a line break)
- Extra text boxes, each draggable to any position
- Per-text size, fill and outline colour, plus an ALL CAPS toggle
- Save as PNG or copy to the clipboard at the image's native resolution
- Fully offline: no ads, no accounts, no network requests

## Download

Installers for Linux (AppImage, deb), Windows and macOS are on the [Releases](https://github.com/ericfisherdev/memefast/releases) page. The builds are unsigned, so Windows SmartScreen and macOS Gatekeeper will warn on first launch.

## Development

Requires Node.js 22 or newer.

```sh
npm install
npm start        # run the app
npm test         # unit tests
npm run lint     # ESLint
npm run pack     # package an unpacked app into dist/
npm run dist     # build installers for the current OS into dist/
```

### Releasing

1. Bump `version` in `package.json` and commit it.
2. Tag the commit and push the tag: `git tag v0.2.0 && git push origin v0.2.0`.
3. The Release workflow builds Linux, Windows and macOS installers and attaches them to a draft GitHub release. Review the draft, then publish it.

The workflow fails if the tag does not match the `package.json` version.

## Fonts

Text renders in Impact when it is installed. Otherwise the app falls back to the bundled [Anton](https://fonts.google.com/specimen/Anton) font (SIL Open Font License 1.1, see `assets/fonts/ANTON-LICENSE.txt`).

## License

[MIT](LICENSE)
