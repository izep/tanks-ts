export class SoundManager {
    private ctx: AudioContext;
    private masterGain: GainNode;

    constructor() {
        // Handle browser compatibility
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        this.ctx = new AudioContextClass();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.3; // Low volume default
        this.masterGain.connect(this.ctx.destination);
    }

    private createOscillator(type: OscillatorType, freq: number, duration: number, gainVal: number = 0.5) {
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    // synthesized sound effects

    public playFire() {
        // pew pew - frequency sweep down
        // Triangle wave for full sound
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.2);

        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.2);

        // Add noise burst? (Need buffer for noise) - Keeping it simple for now
    }

    public playExplosion() {
        // Noise burst + low freq sine
        // Simply use low freq sawtooth for rumble
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(10, this.ctx.currentTime + 0.5);

        gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.5);
    }

    public playHit() {
        // High pitch ding
        this.createOscillator('sine', 800, 0.1, 0.2);
    }

    public playUI() {
        // Blip
        this.createOscillator('sine', 600, 0.05, 0.1);
    }

    public playSizzle() {
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        const bufferSize = Math.floor(this.ctx.sampleRate * 0.1); // 0.1 seconds
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.05, this.ctx.currentTime); // Very low volume for frequent play
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 3000; // Sizzle is high frequency

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        noise.start();
    }
}
