/**
 * Voice Recorder Module
 * Uses MediaRecorder API for recording voice notes with visual feedback.
 */

/**
 * Convert a blob to base64 string
 * @param {Blob} blob
 * @returns {Promise<string>}
 */
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = function () {
      resolve(reader.result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Create a voice recorder component
 * @param {Function} onRecordingComplete - Callback receiving base64 audio data
 * @returns {HTMLElement} The recorder DOM element
 */
export function createVoiceRecorder(onRecordingComplete) {
  const container = document.createElement('div');
  container.className = 'voice-recorder';

  let mediaRecorder = null;
  let audioChunks = [];
  let isRecording = false;
  let audioBlob = null;
  let audioUrl = null;

  // Check for API support
  const isSupported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

  if (!isSupported) {
    container.innerHTML = '<p class="voice-recorder__unsupported">Voice recording is not available in this browser.</p>';
    return container;
  }

  // Record button
  const recordBtn = document.createElement('button');
  recordBtn.type = 'button';
  recordBtn.className = 'voice-recorder__record-btn';
  recordBtn.setAttribute('aria-label', 'Start recording');
  recordBtn.innerHTML = '<span class="voice-recorder__record-dot"></span>';

  // Stop button
  const stopBtn = document.createElement('button');
  stopBtn.type = 'button';
  stopBtn.className = 'voice-recorder__stop-btn';
  stopBtn.textContent = 'Stop';
  stopBtn.setAttribute('aria-label', 'Stop recording');
  stopBtn.style.display = 'none';

  // Status text
  const status = document.createElement('span');
  status.className = 'voice-recorder__status';
  status.textContent = 'Tap to record';

  // Playback controls
  const playbackContainer = document.createElement('div');
  playbackContainer.className = 'voice-recorder__playback';
  playbackContainer.style.display = 'none';

  const playBtn = document.createElement('button');
  playBtn.type = 'button';
  playBtn.className = 'voice-recorder__play-btn';
  playBtn.textContent = 'Play';
  playBtn.setAttribute('aria-label', 'Play recording');

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'voice-recorder__delete-btn';
  deleteBtn.textContent = 'Delete';
  deleteBtn.setAttribute('aria-label', 'Delete recording');

  playbackContainer.appendChild(playBtn);
  playbackContainer.appendChild(deleteBtn);

  let audioElement = null;

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunks = [];
      mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = function (e) {
        if (e.data.size > 0) {
          audioChunks.push(e.data);
        }
      };

      mediaRecorder.onstop = async function () {
        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());

        audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        audioUrl = URL.createObjectURL(audioBlob);

        // Convert to base64 for storage
        const base64 = await blobToBase64(audioBlob);
        if (onRecordingComplete) onRecordingComplete(base64);

        // Show playback controls
        playbackContainer.style.display = 'flex';
        status.textContent = 'Recording saved';
        recordBtn.style.display = 'none';
      };

      mediaRecorder.start();
      isRecording = true;
      recordBtn.classList.add('voice-recorder__record-btn--recording');
      recordBtn.style.display = 'none';
      stopBtn.style.display = 'inline-flex';
      status.textContent = 'Recording...';
    } catch (err) {
      status.textContent = 'Microphone access denied';
      console.warn('Microphone access denied:', err.message);
    }
  }

  function stopRecording() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      isRecording = false;
      recordBtn.classList.remove('voice-recorder__record-btn--recording');
      stopBtn.style.display = 'none';
    }
  }

  recordBtn.addEventListener('click', function () {
    if (!isRecording) {
      startRecording();
    }
  });

  stopBtn.addEventListener('click', function () {
    stopRecording();
  });

  playBtn.addEventListener('click', function () {
    if (audioUrl) {
      if (audioElement) {
        audioElement.pause();
        audioElement = null;
        playBtn.textContent = 'Play';
        return;
      }
      audioElement = new Audio(audioUrl);
      audioElement.play();
      playBtn.textContent = 'Pause';
      audioElement.onended = function () {
        playBtn.textContent = 'Play';
        audioElement = null;
      };
    }
  });

  deleteBtn.addEventListener('click', function () {
    if (audioElement) {
      audioElement.pause();
      audioElement = null;
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    audioBlob = null;
    audioUrl = null;
    audioChunks = [];
    playbackContainer.style.display = 'none';
    recordBtn.style.display = '';
    status.textContent = 'Tap to record';
    playBtn.textContent = 'Play';
    if (onRecordingComplete) onRecordingComplete(null);
  });

  const controls = document.createElement('div');
  controls.className = 'voice-recorder__controls';
  controls.appendChild(recordBtn);
  controls.appendChild(stopBtn);

  container.appendChild(controls);
  container.appendChild(status);
  container.appendChild(playbackContainer);

  // Public method to set existing recording
  container.setRecording = function (base64Data) {
    if (base64Data) {
      audioUrl = base64Data;
      playbackContainer.style.display = 'flex';
      recordBtn.style.display = 'none';
      status.textContent = 'Recording saved';
    }
  };

  return container;
}

export default { createVoiceRecorder };
