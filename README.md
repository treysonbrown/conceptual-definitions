# Conceptual Definitions Chrome Extension

Highlight Japanese text, hold **Shift**, and get a concise conceptual definition powered by OpenAI.

## Setup
- Copy `env.example` to `.env` and set `OPENAI_API_KEY`.
- Install deps: `npm install`.
- Build: `npm run build` (outputs to `dist/`).

## Load in Chrome
1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select the `dist` folder.

## Usage
- Highlight a word or phrase on any page.
- Hold **Shift** to request a conceptual definition.
- A tooltip appears bottom-right with loading state, then the definition, or an error if something went wrong. Click or press `Esc` to dismiss.

## Notes
- The API key is bundled into the background script at build time. Treat the unpacked build as sensitive and avoid sharing it.
- The prompt prioritizes the core meaning, English-only explanation, and a single short sentence.

