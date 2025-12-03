# Browser WebGPU Text Generation

A demo application showcasing **in-browser AI text generation** using WebGPU acceleration. This project runs a large language model (LLM) entirely in your browser with streaming output—no server required!

## Features

- 🚀 **WebGPU Acceleration** - Leverages your GPU for fast inference directly in the browser
- 📡 **Streaming Output** - See generated text appear token by token in real-time
- 🧠 **Hugging Face Transformers.js** - Uses the [granite-4.0-350m-ONNX](https://huggingface.co/onnx-community/granite-4.0-350m-ONNX) model
- ⚡ **Web Worker** - Model runs in a separate thread to keep the UI responsive
- 💾 **Browser Caching** - Model weights are cached locally after first download
- 🎨 **Modern UI** - Built with SolidJS and Tailwind CSS

## Requirements

- A browser with WebGPU support
- A compatible GPU

## Getting Started

Install dependencies:

```bash
bun install
```

Start the development server:

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:400) in your browser.

## How It Works

1. **Web Worker** (`src/worker.ts`) - Loads the ONNX model using Hugging Face's Transformers.js library with WebGPU backend
2. **Streaming** - Uses `TextStreamer` to send generated tokens back to the main thread in real-time
3. **UI** (`src/App.tsx`) - SolidJS component that manages the chat interface and displays progress/output

## Tech Stack

- [SolidJS](https://solidjs.com/) - Reactive UI framework
- [Vite](https://vitejs.dev/) - Build tool
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Hugging Face Transformers.js](https://huggingface.co/docs/transformers.js) - ML inference in the browser
- [WebGPU](https://www.w3.org/TR/webgpu/) - GPU acceleration API

## License

MIT
