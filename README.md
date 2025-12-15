# webpify

A simple CLI tool to convert images to WebP format using [sharp](https://sharp.pixelplumbing.com/).

## Features

- Convert PNG, JPEG, and other image formats to WebP
- Adjustable quality settings (1-100)
- Maintains original image dimensions and aspect ratio
- Custom output path support

## Installation

```bash
# Clone the repository
git clone https://github.com/JeppeSigaard/webpify.git
cd webpify

# Install dependencies
npm install

# Build and install to ~/.local/bin
npm run build:install
```

Make sure `~/.local/bin` is in your PATH:

```bash
export PATH="$PATH:$HOME/.local/bin"
```

## Usage

```bash
# Basic usage - outputs image.webp in the same directory
webpify image.png

# Set quality (1-100, default: 80)
webpify image.jpg -q 90

# Specify output path
webpify photo.png -o converted/photo.webp

# Show help
webpify --help
```

## Options

| Option      | Short | Description          | Default                              |
| ----------- | ----- | -------------------- | ------------------------------------ |
| `--quality` | `-q`  | WebP quality (1-100) | 80                                   |
| `--output`  | `-o`  | Output file path     | Same as input with `.webp` extension |
| `--help`    | `-h`  | Show help message    |                                      |
| `--version` | `-v`  | Show version         |                                      |

## Development

```bash
# Run directly without building
npm start -- image.png

# Build to dist/
npm run build

# Build and install
npm run build:install
```

## License

ISC
