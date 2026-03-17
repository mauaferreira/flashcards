class SpeechService {
    constructor() {
        this.synth = window.speechSynthesis;
        this.voices = [];
        this.preferredVoice = null;

        // Load voices when available
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = this.loadVoices.bind(this);
        }
        // Attempt immediate load
        this.loadVoices();
    }

    loadVoices() {
        this.voices = this.synth.getVoices();

        // Attempt to find US English voices (kid friendly ones if possible, else standard)
        const enVoices = this.voices.filter(v => v.lang.startsWith('en'));

        // Prefer Google US English, native US English, or any English voice
        this.preferredVoice =
            enVoices.find(v => v.name.includes('Google US English')) ||
            enVoices.find(v => v.lang === 'en-US') ||
            enVoices[0] ||
            null;
    }

    speak(text, rate = 1.0) {
        if (this.synth.speaking) {
            console.error('speechSynthesis.speaking');
            // this.synth.cancel(); // Uncomment if we want to immediately interrupt
        }
        if (text !== '') {
            const utterThis = new SpeechSynthesisUtterance(text);
            if (this.preferredVoice) {
                utterThis.voice = this.preferredVoice;
            }
            utterThis.pitch = 1.2; // Slightly higher pitch for kids
            utterThis.rate = rate; // Speed control

            this.synth.speak(utterThis);
        }
    }

    cancel() {
        this.synth.cancel();
    }
}

export const speechService = new SpeechService();
