/**
 * VoxEleven Studio — ElevenLabs AI Narration & Audio Synthesizer
 * Full client-side implementation with ElevenLabs TTS API, Audio Visualizer,
 * Voice Management, and Seamless Fallback Demo Mode.
 */

// --- Model Descriptions Catalog ---
const MODEL_DETAILS = {
  eleven_multilingual_v2: {
    name: "Multilingual v2",
    badge: "Most Expressive",
    desc: "State-of-the-art model for 29 languages with unmatched emotional depth, tone nuance, and natural human cadence."
  },
  eleven_flash_v2_5: {
    name: "Flash v2.5",
    badge: "Ultra Fast ~75ms",
    desc: "Fastest multilingual model with sub-100ms latency across 32 languages. Ideal for interactive agents and live narration."
  },
  eleven_turbo_v2_5: {
    name: "Turbo v2.5",
    badge: "High Quality & Speed",
    desc: "Balanced cutting-edge model combining high audio fidelity with ultra-low latency across 32 languages."
  },
  eleven_flash_v2: {
    name: "Flash v2",
    badge: "Low Latency",
    desc: "High-speed voice generation optimized for real-time English and multilingual streams."
  },
  eleven_turbo_v2: {
    name: "Turbo v2",
    badge: "Classic Turbo",
    desc: "Low-latency English narration model with strong voice stability and clear articulation."
  },
  eleven_monolingual_v1: {
    name: "English v1",
    badge: "Classic English",
    desc: "Original foundational ElevenLabs English speech model with classic warm documentary timbre."
  }
};

// --- Sample Prompts ---
const SAMPLE_SCRIPTS = {
  epic: "In the twilight of the Orion Nebula, humanity did not stumble into the silence of the void; they awakened it. A billion autonomous relays ignited simultaneously, whispering coordinates across the darkness to civilizations yet unborn.",
  documentary: "Beneath the dense emerald canopy of the Monteverde cloud forest, dawn arrives not with light, but with an acoustic symphony. Each drop of mist resonates like crystal, awakening ancient ferns that have thrived here for ten thousand years.",
  tech: "Today, we are taking speech synthesis beyond previous human limits. Introducing instantaneous emotional adaptation, ultra-low latency, and lifelike nuance designed for the next era of ambient computing.",
  calm: "Take a deep breath in through your nose... feeling the cool air fill your lungs. Hold for a moment of quiet stillness... and now, gently release. Allow all tension from your day to dissolve away."
};

// --- App State ---
const state = {
  apiKey: localStorage.getItem('elevenlabs_api_key') || '',
  selectedModel: 'eleven_multilingual_v2',
  selectedVoice: '21m00Tcm4TlvDq8ikWAM', // Rachel
  currentBlobUrl: null,
  currentAudioBlob: null,
  isPlaying: false,
  isGenerating: false,
  audioDuration: 0,
  history: [],
  audioContext: null,
  analyser: null,
  sourceNode: null,
  animationFrameId: null,
  isSeeking: false,
  mockActive: false,
  webSpeechUtterance: null
};

// --- DOM Elements ---
const narrationText = document.getElementById('narrationText');
const charCount = document.getElementById('charCount');
const wordCount = document.getElementById('wordCount');
const pasteTextBtn = document.getElementById('pasteTextBtn');
const clearTextBtn = document.getElementById('clearTextBtn');

const modelSelect = document.getElementById('modelSelect');
const modelBadge = document.getElementById('modelBadge');
const modelDescription = document.getElementById('modelDescription');
const voiceSelect = document.getElementById('voiceSelect');
const voiceBadge = document.getElementById('voiceBadge');
const refreshVoicesBtn = document.getElementById('refreshVoicesBtn');

const stabilitySlider = document.getElementById('stabilitySlider');
const stabilityVal = document.getElementById('stabilityVal');
const similaritySlider = document.getElementById('similaritySlider');
const similarityVal = document.getElementById('similarityVal');
const styleSlider = document.getElementById('styleSlider');
const styleVal = document.getElementById('styleVal');
const speakerBoostToggle = document.getElementById('speakerBoostToggle');

const playNarrationBtn = document.getElementById('playNarrationBtn');
const playBtnIcon = document.getElementById('playBtnIcon');
const playBtnText = document.getElementById('playBtnText');
const stopAudioBtn = document.getElementById('stopAudioBtn');
const downloadAudioBtn = document.getElementById('downloadAudioBtn');
const mockModeToggle = document.getElementById('mockModeToggle');

const nativeAudioPlayer = document.getElementById('nativeAudioPlayer');
const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');
const currentTimeLabel = document.getElementById('currentTimeLabel');
const durationLabel = document.getElementById('durationLabel');
const speedBtn = document.getElementById('speedBtn');
const speedMenu = document.getElementById('speedMenu');
const volumeSlider = document.getElementById('volumeSlider');
const muteBtn = document.getElementById('muteBtn');
const volumeIcon = document.getElementById('volumeIcon');

const visualizerCanvas = document.getElementById('visualizerCanvas');
const visualizerOverlay = document.getElementById('visualizerOverlay');
const playbackDot = document.getElementById('playbackDot');
const playerStatus = document.getElementById('playerStatus');
const currentTrackMeta = document.getElementById('currentTrackMeta');

const apiKeyModalBtn = document.getElementById('apiKeyModalBtn');
const apiKeyModal = document.getElementById('apiKeyModal');
const closeApiKeyModalBtn = document.getElementById('closeApiKeyModalBtn');
const apiKeyInput = document.getElementById('apiKeyInput');
const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
const clearSavedKeyBtn = document.getElementById('clearSavedKeyBtn');
const toggleKeyVisibility = document.getElementById('toggleKeyVisibility');
const eyeIcon = document.getElementById('eyeIcon');
const apiKeyStatusText = document.getElementById('apiKeyStatusText');
const apiKeyIndicator = document.getElementById('apiKeyIndicator');

const historyList = document.getElementById('historyList');
const emptyHistory = document.getElementById('emptyHistory');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const toastContainer = document.getElementById('toastContainer');

// --- Initialization ---
function init() {
  updateApiKeyDisplay();
  setupTextStats();
  setupSamplePrompts();
  setupSliders();
  setupModelEvents();
  setupVoiceEvents();
  setupAudioEvents();
  setupScrubber();
  setupSpeedMenu();
  setupModal();
  setupCanvas();

  // Load default prompt if empty
  if (!narrationText.value.trim()) {
    narrationText.value = SAMPLE_SCRIPTS.epic;
    updateTextStats();
  }
}

// --- Text Stats Calculation ---
function setupTextStats() {
  narrationText.addEventListener('input', updateTextStats);
  
  pasteTextBtn.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      narrationText.value = text;
      updateTextStats();
      showToast('Text pasted from clipboard', 'info');
    } catch {
      showToast('Clipboard access was denied. Please paste manually.', 'warning');
    }
  });

  clearTextBtn.addEventListener('click', () => {
    narrationText.value = '';
    updateTextStats();
  });
}

function updateTextStats() {
  const text = narrationText.value;
  charCount.textContent = text.length.toLocaleString();
  const words = text.trim().split(/\s+/).filter(Boolean);
  wordCount.textContent = words.length.toLocaleString();
}

// --- Sample Prompts ---
function setupSamplePrompts() {
  document.querySelectorAll('.prompt-chips .chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const promptKey = chip.getAttribute('data-prompt');
      if (SAMPLE_SCRIPTS[promptKey]) {
        narrationText.value = SAMPLE_SCRIPTS[promptKey];
        updateTextStats();
        showToast(`Loaded ${chip.textContent.trim()} prompt`, 'info');
      }
    });
  });
}

// --- Slider Bindings ---
function setupSliders() {
  stabilitySlider.addEventListener('input', () => {
    stabilityVal.textContent = parseFloat(stabilitySlider.value).toFixed(2);
  });
  similaritySlider.addEventListener('input', () => {
    similarityVal.textContent = parseFloat(similaritySlider.value).toFixed(2);
  });
  styleSlider.addEventListener('input', () => {
    styleVal.textContent = parseFloat(styleSlider.value).toFixed(2);
  });
}

// --- Model & Voice Setup ---
function setupModelEvents() {
  modelSelect.addEventListener('change', (e) => {
    const val = e.target.value;
    state.selectedModel = val;
    const info = MODEL_DETAILS[val] || { name: val, badge: 'Custom', desc: '' };
    modelBadge.textContent = info.badge;
    modelDescription.textContent = info.desc;
  });
}

function setupVoiceEvents() {
  voiceSelect.addEventListener('change', (e) => {
    state.selectedVoice = e.target.value;
    const selectedText = voiceSelect.options[voiceSelect.selectedIndex].text;
    const voiceName = selectedText.split('—')[0].trim();
    voiceBadge.textContent = voiceName;
  });

  refreshVoicesBtn.addEventListener('click', fetchAccountVoices);
}

// Fetch live voices from user's ElevenLabs account
async function fetchAccountVoices() {
  if (!state.apiKey) {
    showToast('Add your ElevenLabs API key first to sync account voices', 'warning');
    openApiKeyModal();
    return;
  }

  refreshVoicesBtn.classList.add('loading');
  try {
    const res = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': state.apiKey
      }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch voices (${res.status})`);
    }

    const data = await res.json();
    if (data.voices && data.voices.length > 0) {
      voiceSelect.innerHTML = '';
      data.voices.forEach(voice => {
        const option = document.createElement('option');
        option.value = voice.voice_id;
        const category = voice.category ? ` [${voice.category}]` : '';
        const desc = voice.labels && voice.labels.accent ? ` (${voice.labels.accent})` : '';
        option.textContent = `${voice.name}${category}${desc}`;
        voiceSelect.appendChild(option);
      });
      state.selectedVoice = voiceSelect.value;
      voiceBadge.textContent = voiceSelect.options[0].text.split(' ')[0];
      showToast(`Synced ${data.voices.length} voices from ElevenLabs!`, 'success');
    }
  } catch (err) {
    console.error('Error fetching voices:', err);
    showToast(`Voice sync failed: ${err.message}`, 'error');
  } finally {
    refreshVoicesBtn.classList.remove('loading');
  }
}

// --- ElevenLabs API Speech Synthesis ---
playNarrationBtn.addEventListener('click', handlePlayClick);
stopAudioBtn.addEventListener('click', stopAudioPlayback);

async function handlePlayClick() {
  // If already playing native audio, toggle pause
  if (state.isPlaying && !state.mockActive) {
    nativeAudioPlayer.pause();
    return;
  }

  // If mock utterance is actively playing
  if (state.mockActive && window.speechSynthesis.speaking) {
    window.speechSynthesis.pause();
    state.isPlaying = false;
    updatePlayerStatusUI(false);
    return;
  }

  const text = narrationText.value.trim();
  if (!text) {
    showToast('Please enter text to narrate first!', 'warning');
    narrationText.focus();
    return;
  }

  // Check if we should call ElevenLabs API or use Demo mode
  if (state.apiKey) {
    await generateElevenLabsNarration(text);
  } else if (mockModeToggle.checked) {
    showToast('No API key provided. Using simulated demo speech.', 'info');
    runDemoNarration(text);
  } else {
    showToast('Please configure your ElevenLabs API Key to generate voice audio.', 'warning');
    openApiKeyModal();
  }
}

async function generateElevenLabsNarration(text) {
  setGeneratingUI(true);
  playerStatus.textContent = 'Contacting ElevenLabs API...';
  playbackDot.className = 'status-dot generating';

  const voiceId = state.selectedVoice;
  const modelId = state.selectedModel;
  const voiceName = voiceSelect.options[voiceSelect.selectedIndex].text.split('—')[0].trim();

  currentTrackMeta.textContent = `${voiceName} • ${MODEL_DETAILS[modelId]?.name || modelId}`;

  const payload = {
    text: text,
    model_id: modelId,
    voice_settings: {
      stability: parseFloat(stabilitySlider.value),
      similarity_boost: parseFloat(similaritySlider.value),
      style: parseFloat(styleSlider.value),
      use_speaker_boost: speakerBoostToggle.checked
    }
  };

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': state.apiKey,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      let errorDetail = `Status ${response.status}`;
      try {
        const errorJson = await response.json();
        if (errorJson.detail && errorJson.detail.message) {
          errorDetail = errorJson.detail.message;
        } else if (errorJson.message) {
          errorDetail = errorJson.message;
        }
      } catch (_) {}

      if (response.status === 401) {
        throw new Error('Invalid ElevenLabs API key. Please check your credentials in settings.');
      } else if (response.status === 429) {
        throw new Error('ElevenLabs quota limit reached or rate limited.');
      } else {
        throw new Error(errorDetail);
      }
    }

    const audioBlob = await response.blob();
    const blobUrl = URL.createObjectURL(audioBlob);

    state.currentAudioBlob = audioBlob;
    state.currentBlobUrl = blobUrl;
    state.mockActive = false;

    // Enable download button
    downloadAudioBtn.disabled = false;

    // Set audio source
    nativeAudioPlayer.src = blobUrl;
    initAudioContext();

    await nativeAudioPlayer.play();
    showToast('Narration generated successfully!', 'success');

    // Add item to history
    addToHistory({
      text: text,
      voice: voiceName,
      model: MODEL_DETAILS[modelId]?.name || modelId,
      blobUrl: blobUrl,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

  } catch (err) {
    console.error('Synthesis error:', err);
    showToast(`Error: ${err.message}`, 'error');
    
    // Offer demo mode fallback if API failed
    if (mockModeToggle.checked) {
      showToast('Switching to Demo Voice fallback so you can preview playback.', 'info');
      runDemoNarration(text);
    }
  } finally {
    setGeneratingUI(false);
  }
}

// --- Demo Mode Speech Simulation ---
function runDemoNarration(text) {
  if (!('speechSynthesis' in window)) {
    showToast('Speech synthesis not supported in this browser.', 'error');
    return;
  }

  window.speechSynthesis.cancel();
  state.mockActive = true;
  downloadAudioBtn.disabled = true;

  const utterance = new SpeechSynthesisUtterance(text);
  state.webSpeechUtterance = utterance;

  const voiceName = voiceSelect.options[voiceSelect.selectedIndex].text.split('—')[0].trim();
  currentTrackMeta.textContent = `[Demo] ${voiceName} • WebSpeech Emulation`;

  // Try to pick suitable voice
  const availableVoices = window.speechSynthesis.getVoices();
  if (availableVoices.length > 0) {
    const isFemale = voiceName.toLowerCase().includes('rachel') || voiceName.toLowerCase().includes('bella') || voiceName.toLowerCase().includes('elli');
    const matchedVoice = availableVoices.find(v => 
      isFemale ? (v.name.includes('Female') || v.name.includes('Zira') || v.name.includes('Samantha'))
               : (v.name.includes('Male') || v.name.includes('David') || v.name.includes('Alex'))
    ) || availableVoices[0];
    if (matchedVoice) utterance.voice = matchedVoice;
  }

  utterance.rate = nativeAudioPlayer.playbackRate || 1.0;
  
  utterance.onstart = () => {
    state.isPlaying = true;
    updatePlayerStatusUI(true);
    startMockVisualizer();
  };

  utterance.onend = () => {
    state.isPlaying = false;
    state.mockActive = false;
    updatePlayerStatusUI(false);
    stopVisualizerAnimation();
  };

  utterance.onerror = (e) => {
    state.isPlaying = false;
    state.mockActive = false;
    updatePlayerStatusUI(false);
    stopVisualizerAnimation();
    console.error('Speech synthesis error:', e);
  };

  window.speechSynthesis.speak(utterance);
}

// --- Native Audio Player Setup ---
function setupAudioEvents() {
  nativeAudioPlayer.addEventListener('loadedmetadata', () => {
    state.audioDuration = nativeAudioPlayer.duration;
    durationLabel.textContent = formatTime(nativeAudioPlayer.duration);
  });

  nativeAudioPlayer.addEventListener('timeupdate', () => {
    if (!state.isSeeking && nativeAudioPlayer.duration) {
      const progress = (nativeAudioPlayer.currentTime / nativeAudioPlayer.duration) * 100;
      progressBar.style.width = `${progress}%`;
      const progressHandle = document.getElementById('progressHandle');
      if (progressHandle) progressHandle.style.left = `${progress}%`;
      currentTimeLabel.textContent = formatTime(nativeAudioPlayer.currentTime);
    }
  });

  nativeAudioPlayer.addEventListener('play', () => {
    state.isPlaying = true;
    updatePlayerStatusUI(true);
    resumeAudioContext();
    startAudioVisualizer();
  });

  nativeAudioPlayer.addEventListener('pause', () => {
    state.isPlaying = false;
    updatePlayerStatusUI(false);
  });

  nativeAudioPlayer.addEventListener('ended', () => {
    state.isPlaying = false;
    updatePlayerStatusUI(false);
    progressBar.style.width = '0%';
    currentTimeLabel.textContent = '0:00';
  });

  // Volume & Mute
  volumeSlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    nativeAudioPlayer.volume = val;
    updateVolumeIcon(val);
  });

  muteBtn.addEventListener('click', () => {
    if (nativeAudioPlayer.volume > 0) {
      nativeAudioPlayer.dataset.lastVol = nativeAudioPlayer.volume;
      nativeAudioPlayer.volume = 0;
      volumeSlider.value = 0;
      updateVolumeIcon(0);
    } else {
      const restored = nativeAudioPlayer.dataset.lastVol || 1;
      nativeAudioPlayer.volume = restored;
      volumeSlider.value = restored;
      updateVolumeIcon(restored);
    }
  });

  // Download Audio File
  downloadAudioBtn.addEventListener('click', () => {
    if (!state.currentAudioBlob) return;
    const a = document.createElement('a');
    a.href = state.currentBlobUrl;
    const voiceName = voiceSelect.options[voiceSelect.selectedIndex].text.split('—')[0].trim().toLowerCase();
    a.download = `elevenlabs-${voiceName}-${Date.now()}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('Downloaded narration MP3', 'success');
  });
}

function updateVolumeIcon(val) {
  if (val === 0) {
    volumeIcon.className = 'fa-solid fa-volume-xmark';
  } else if (val < 0.5) {
    volumeIcon.className = 'fa-solid fa-volume-low';
  } else {
    volumeIcon.className = 'fa-solid fa-volume-high';
  }
}

function stopAudioPlayback() {
  if (state.mockActive) {
    window.speechSynthesis.cancel();
    state.mockActive = false;
  } else {
    nativeAudioPlayer.pause();
    nativeAudioPlayer.currentTime = 0;
  }
  state.isPlaying = false;
  updatePlayerStatusUI(false);
  stopVisualizerAnimation();
  progressBar.style.width = '0%';
  currentTimeLabel.textContent = '0:00';
}

function updatePlayerStatusUI(playing) {
  if (playing) {
    playBtnIcon.className = 'fa-solid fa-pause';
    playBtnText.textContent = 'Pause Narration';
    playbackDot.className = 'status-dot active';
    playerStatus.textContent = 'Narrating live...';
    stopAudioBtn.disabled = false;
    visualizerOverlay.classList.add('hidden');
  } else {
    playBtnIcon.className = 'fa-solid fa-play';
    playBtnText.textContent = 'Play Narration';
    playbackDot.className = 'status-dot';
    playerStatus.textContent = 'Playback paused';
    if (!nativeAudioPlayer.currentTime || nativeAudioPlayer.currentTime === 0) {
      playerStatus.textContent = 'Ready for narration';
      stopAudioBtn.disabled = true;
      visualizerOverlay.classList.remove('hidden');
    }
  }
}

function setGeneratingUI(isGen) {
  state.isGenerating = isGen;
  if (isGen) {
    playNarrationBtn.classList.add('loading');
    playNarrationBtn.disabled = true;
    playBtnText.textContent = 'Synthesizing...';
  } else {
    playNarrationBtn.classList.remove('loading');
    playNarrationBtn.disabled = false;
  }
}

// --- Scrubber Progress Bar ---
function setupScrubber() {
  let isDragging = false;

  const seek = (e) => {
    const rect = progressContainer.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    progressBar.style.width = `${pos * 100}%`;
    const progressHandle = document.getElementById('progressHandle');
    if (progressHandle) progressHandle.style.left = `${pos * 100}%`;

    if (nativeAudioPlayer.duration) {
      nativeAudioPlayer.currentTime = pos * nativeAudioPlayer.duration;
      currentTimeLabel.textContent = formatTime(nativeAudioPlayer.currentTime);
    }
  };

  progressContainer.addEventListener('mousedown', (e) => {
    isDragging = true;
    state.isSeeking = true;
    seek(e);
  });

  window.addEventListener('mousemove', (e) => {
    if (isDragging) seek(e);
  });

  window.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      state.isSeeking = false;
    }
  });
}

// --- Speed Menu Controls ---
function setupSpeedMenu() {
  speedBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    speedMenu.classList.toggle('show');
  });

  document.addEventListener('click', () => {
    speedMenu.classList.remove('show');
  });

  speedMenu.querySelectorAll('span').forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      const speed = parseFloat(item.getAttribute('data-speed'));
      nativeAudioPlayer.playbackRate = speed;
      speedBtn.textContent = `${speed}x`;

      speedMenu.querySelectorAll('span').forEach(s => s.classList.remove('active'));
      item.classList.add('active');
      speedMenu.classList.remove('show');
    });
  });
}

// --- Canvas Web Audio Visualizer ---
function setupCanvas() {
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
  const rect = visualizerCanvas.parentElement.getBoundingClientRect();
  visualizerCanvas.width = rect.width * window.devicePixelRatio;
  visualizerCanvas.height = rect.height * window.devicePixelRatio;
}

function initAudioContext() {
  if (!state.audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    state.audioContext = new AudioContextClass();
    state.analyser = state.audioContext.createAnalyser();
    state.analyser.fftSize = 128;

    try {
      if (!state.sourceNode) {
        state.sourceNode = state.audioContext.createMediaElementSource(nativeAudioPlayer);
        state.sourceNode.connect(state.analyser);
        state.analyser.connect(state.audioContext.destination);
      }
    } catch (e) {
      console.warn('MediaElementSource already connected or cross-origin:', e);
    }
  }
}

function resumeAudioContext() {
  if (state.audioContext && state.audioContext.state === 'suspended') {
    state.audioContext.resume();
  }
}

function startAudioVisualizer() {
  if (!state.analyser) return;
  const bufferLength = state.analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  const ctx = visualizerCanvas.getContext('2d');

  function render() {
    if (!state.isPlaying) return;
    state.animationFrameId = requestAnimationFrame(render);

    state.analyser.getByteFrequencyData(dataArray);

    const width = visualizerCanvas.width;
    const height = visualizerCanvas.height;

    ctx.clearRect(0, 0, width, height);

    const barCount = bufferLength / 1.5;
    const barWidth = (width / barCount) * 0.7;
    let x = 0;

    for (let i = 0; i < barCount; i++) {
      const val = dataArray[i] / 255;
      const barHeight = val * (height * 0.85);

      // Create glowing gradient
      const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
      gradient.addColorStop(0, '#6366f1');
      gradient.addColorStop(0.5, '#a855f7');
      gradient.addColorStop(1, '#06b6d4');

      ctx.fillStyle = gradient;
      ctx.shadowBlur = 12;
      ctx.shadowColor = 'rgba(99, 102, 241, 0.4)';

      // Draw rounded top bar
      ctx.beginPath();
      const cornerRadius = 3;
      const topY = height - barHeight;
      ctx.roundRect(x, topY, barWidth, barHeight, [cornerRadius, cornerRadius, 0, 0]);
      ctx.fill();

      x += (width / barCount);
    }
  }

  cancelAnimationFrame(state.animationFrameId);
  render();
}

function startMockVisualizer() {
  const ctx = visualizerCanvas.getContext('2d');
  let phase = 0;

  function renderMock() {
    if (!state.isPlaying) return;
    state.animationFrameId = requestAnimationFrame(renderMock);

    const width = visualizerCanvas.width;
    const height = visualizerCanvas.height;
    ctx.clearRect(0, 0, width, height);

    const barCount = 42;
    const barWidth = (width / barCount) * 0.7;
    let x = 0;
    phase += 0.08;

    for (let i = 0; i < barCount; i++) {
      const sinVal = Math.sin(phase + i * 0.3) * 0.5 + 0.5;
      const noise = Math.random() * 0.2;
      const barHeight = Math.max(6, (sinVal * 0.7 + noise) * (height * 0.8));

      const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
      gradient.addColorStop(0, '#6366f1');
      gradient.addColorStop(0.5, '#ec4899');
      gradient.addColorStop(1, '#06b6d4');

      ctx.fillStyle = gradient;
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'rgba(168, 85, 247, 0.4)';

      ctx.beginPath();
      ctx.roundRect(x, height - barHeight, barWidth, barHeight, [3, 3, 0, 0]);
      ctx.fill();

      x += (width / barCount);
    }
  }

  cancelAnimationFrame(state.animationFrameId);
  renderMock();
}

function stopVisualizerAnimation() {
  if (state.animationFrameId) {
    cancelAnimationFrame(state.animationFrameId);
  }
  const ctx = visualizerCanvas.getContext('2d');
  ctx.clearRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);
}

// --- History Tracking ---
function addToHistory(item) {
  state.history.unshift(item);
  renderHistory();
}

function renderHistory() {
  if (state.history.length === 0) {
    emptyHistory.style.display = 'flex';
    return;
  }
  emptyHistory.style.display = 'none';

  // Remove existing items except empty prompt
  const existing = historyList.querySelectorAll('.history-item');
  existing.forEach(e => e.remove());

  state.history.forEach((clip, index) => {
    const el = document.createElement('div');
    el.className = 'history-item';
    el.innerHTML = `
      <div class="history-item-top">
        <span class="history-snippet">${escapeHtml(clip.text)}</span>
        <button class="action-icon-btn small play-clip-btn" title="Replay">
          <i class="fa-solid fa-play"></i>
        </button>
      </div>
      <div class="history-item-bottom">
        <div class="history-badges">
          <span class="history-badge">${clip.voice}</span>
          <span class="history-badge">${clip.model}</span>
        </div>
        <span>${clip.timestamp}</span>
      </div>
    `;

    el.querySelector('.play-clip-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      playHistoryClip(clip);
    });

    el.addEventListener('click', () => {
      narrationText.value = clip.text;
      updateTextStats();
      playHistoryClip(clip);
    });

    historyList.appendChild(el);
  });
}

function playHistoryClip(clip) {
  if (clip.blobUrl) {
    nativeAudioPlayer.src = clip.blobUrl;
    state.currentBlobUrl = clip.blobUrl;
    currentTrackMeta.textContent = `${clip.voice} • ${clip.model} (Replay)`;
    initAudioContext();
    nativeAudioPlayer.play();
    downloadAudioBtn.disabled = false;
  }
}

clearHistoryBtn.addEventListener('click', () => {
  state.history = [];
  renderHistory();
  showToast('Session history cleared', 'info');
});

// --- API Key Modal & Persistence ---
function setupModal() {
  apiKeyModalBtn.addEventListener('click', openApiKeyModal);
  closeApiKeyModalBtn.addEventListener('click', closeApiKeyModal);

  apiKeyModal.addEventListener('click', (e) => {
    if (e.target === apiKeyModal) closeApiKeyModal();
  });

  toggleKeyVisibility.addEventListener('click', () => {
    if (apiKeyInput.type === 'password') {
      apiKeyInput.type = 'text';
      eyeIcon.className = 'fa-regular fa-eye-slash';
    } else {
      apiKeyInput.type = 'password';
      eyeIcon.className = 'fa-regular fa-eye';
    }
  });

  saveApiKeyBtn.addEventListener('click', () => {
    const key = apiKeyInput.value.trim();
    if (key) {
      state.apiKey = key;
      localStorage.setItem('elevenlabs_api_key', key);
      updateApiKeyDisplay();
      closeApiKeyModal();
      showToast('ElevenLabs API Key saved securely in browser!', 'success');
      // Proactively sync voices
      fetchAccountVoices();
    } else {
      showToast('Please enter an API key', 'warning');
    }
  });

  clearSavedKeyBtn.addEventListener('click', () => {
    state.apiKey = '';
    localStorage.removeItem('elevenlabs_api_key');
    apiKeyInput.value = '';
    updateApiKeyDisplay();
    closeApiKeyModal();
    showToast('Saved API Key removed.', 'info');
  });
}

function openApiKeyModal() {
  apiKeyInput.value = state.apiKey || '';
  apiKeyModal.classList.add('show');
}

function closeApiKeyModal() {
  apiKeyModal.classList.remove('show');
}

function updateApiKeyDisplay() {
  if (state.apiKey) {
    const masked = state.apiKey.slice(0, 4) + '...' + state.apiKey.slice(-4);
    apiKeyStatusText.textContent = `Key: ${masked}`;
    apiKeyIndicator.className = 'status-indicator connected';
  } else {
    apiKeyStatusText.textContent = 'API Key: Not Set';
    apiKeyIndicator.className = 'status-indicator';
  }
}

// --- Utilities ---
function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function escapeHtml(str) {
  return str.replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag] || tag));
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const iconMap = {
    success: 'fa-circle-check',
    info: 'fa-circle-info',
    warning: 'fa-triangle-exclamation',
    error: 'fa-circle-xmark'
  };

  toast.innerHTML = `
    <i class="fa-solid ${iconMap[type] || 'fa-bell'} toast-icon"></i>
    <span>${escapeHtml(message)}</span>
  `;

  toastContainer.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

// Kickoff application
window.addEventListener('DOMContentLoaded', init);
