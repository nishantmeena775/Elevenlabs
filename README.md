# VoxEleven Studio — ElevenLabs AI Narration Platform

A modern, high-aesthetic web application for real-time speech narration using the **ElevenLabs API**, built with pure **HTML5, Vanilla CSS, and JavaScript**.

---

## 🌟 Key Features

1. **Text Narration Input**:
   - Resizable text area with character & word counters.
   - Quick **Sample Prompt** chips (*Sci-Fi Epic, Nature Documentary, Tech Launch, Meditation*).
   - Instant Clipboard **Paste** and **Clear** actions.

2. **ElevenLabs Model Selector**:
   - **Eleven Multilingual v2**: State of the art emotional expressiveness across 29 languages.
   - **Eleven Flash v2.5**: Sub-100ms ultra-low latency for interactive applications (32 languages).
   - **Eleven Turbo v2.5**: High quality with ultra-low latency (32 languages).
   - **Eleven Flash v2 & Turbo v2**: Real-time performance models.
   - **Eleven English v1**: Classic documentary narrator timbre.
   - Dynamic badge & model description updates on selection.

3. **Curated Voices & Live Account Sync**:
   - Pre-loaded with popular ElevenLabs voices (*Rachel, Adam, Bella, Antoni, Arnold, Elli, Josh, Domi, Sam, Daniel, Michael, Emily*).
   - **Sync Button**: One-click fetch (`GET /v1/voices`) to dynamically load your personal cloned and community voices from your ElevenLabs account!

4. **Fine-Tuning Controls (Collapsible Panel)**:
   - **Stability Slider** (0.00 – 1.00)
   - **Similarity / Clarity Boost Slider** (0.00 – 1.00)
   - **Style Exaggeration Slider** (0.00 – 1.00)
   - **Speaker Boost Toggle**

5. **Audio Player & Real-Time Waveform Visualizer**:
   - HTML5 Canvas frequency visualizer with vibrant violet-cyan glow gradients.
   - Play/Pause & Stop controls.
   - Interactive timeline scrubber (click or drag to seek).
   - Speed selector (`0.75x`, `1.0x`, `1.25x`, `1.5x`, `2.0x`).
   - Volume control and mute toggle.
   - **Save MP3** download button.

6. **Dual Mode (Direct API + Demo Fallback)**:
   - **Direct ElevenLabs Mode**: Enter your `xi-api-key` in the API Key settings modal. Your key is stored securely in your browser's `localStorage` and never leaves your machine.
   - **Demo Voice Fallback Mode**: If no API key is entered, the app automatically falls back to client-side speech synthesis and audio simulation so you can explore the UI, test text prompts, and view the animated visualizer immediately!

7. **Session History**:
   - Automatically logs generated narrations during your session for one-click replay.

---

## 🚀 Running the Project

The project is completely self-contained (no build step or bundler needed):

### Option 1: Using the running local server
The local server is already running at:
```
http://localhost:3000
```
Open this URL in Google Chrome, Microsoft Edge, Brave, or Firefox.

### Option 2: Direct File Open
You can also directly open `index.html` in your favorite web browser.

---

## 🔑 Adding your ElevenLabs API Key

1. Click the **API Key: Not Set** button in the top right header.
2. Paste your ElevenLabs API Key (`xi-api-key`) from your [ElevenLabs Dashboard](https://elevenlabs.io).
3. Click **Save Key**. The app will securely save it in your browser's `localStorage` and sync your custom voices.
