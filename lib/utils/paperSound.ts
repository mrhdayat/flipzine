// Subtle paper sound effects
// Volume: 0.03-0.06, only during flip motion

export class PaperSoundManager {
  private audioContext: AudioContext | null = null
  private gainNode: GainNode | null = null
  private isEnabled: boolean = true

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      this.gainNode = this.audioContext.createGain()
      this.gainNode.connect(this.audioContext.destination)
      this.gainNode.gain.value = 0.04 // Very subtle
    }
  }

  // Play paper touch sound
  playTouch(velocity: number) {
    if (!this.isEnabled || !this.audioContext || !this.gainNode) return

    const volume = Math.min(velocity * 0.04, 0.06)

    // Create oscillator for paper texture
    const oscillator = this.audioContext.createOscillator()
    const filter = this.audioContext.createBiquadFilter()
    const envelope = this.audioContext.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.value = 800 + Math.random() * 400 // Mid-high frequency

    filter.type = 'bandpass'
    filter.frequency.value = 1200
    filter.Q.value = 0.5

    envelope.gain.value = 0
    envelope.gain.setValueAtTime(0, this.audioContext.currentTime)
    envelope.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01)
    envelope.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.08)

    oscillator.connect(filter)
    filter.connect(envelope)
    envelope.connect(this.gainNode)

    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + 0.08)
  }

  // Play paper slide sound during flip
  playSlide(flipProgress: number, velocity: number) {
    if (!this.isEnabled || !this.audioContext || !this.gainNode) return

    // Only play during mid-flip (0.15 - 0.65)
    if (flipProgress < 0.15 || flipProgress > 0.65) return

    const volume = Math.min(velocity * 0.04, 0.05)

    const noise = this.audioContext.createBufferSource()
    const buffer = this.audioContext.createBuffer(1, 4410, this.audioContext.sampleRate)
    const data = buffer.getChannelData(0)

    // Generate white noise
    for (let i = 0; i < buffer.length; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.1
    }

    noise.buffer = buffer

    const filter = this.audioContext.createBiquadFilter()
    filter.type = 'highpass'
    filter.frequency.value = 2000

    const envelope = this.audioContext.createGain()
    envelope.gain.value = volume

    noise.connect(filter)
    filter.connect(envelope)
    envelope.connect(this.gainNode)

    noise.start()
    noise.stop(this.audioContext.currentTime + 0.05)
  }

  // Disable sound
  disable() {
    this.isEnabled = false
  }

  // Enable sound
  enable() {
    this.isEnabled = true
  }
}

export const paperSound = new PaperSoundManager()
