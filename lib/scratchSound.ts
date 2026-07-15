/** Short synthesized needle-skip burst for unloaded catalog titles. */
export function playNeedleScratch() {
  try {
    const context = new AudioContext();
    const length = Math.floor(context.sampleRate * 0.18);
    const buffer = context.createBuffer(1, length, context.sampleRate);
    const data = buffer.getChannelData(0);

    for (let index = 0; index < length; index += 1) {
      const decay = 1 - index / length;
      data[index] = (Math.random() * 2 - 1) * decay * decay;
    }

    const source = context.createBufferSource();
    const gain = context.createGain();
    const filter = context.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 900;
    gain.gain.value = 0.22;
    source.buffer = buffer;
    source.connect(filter).connect(gain).connect(context.destination);
    source.start();
    source.stop(context.currentTime + 0.2);
    window.setTimeout(() => void context.close(), 300);
  } catch {
    // Audio unavailable — visual rejection still plays
  }
}
