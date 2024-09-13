class MidiHandler {
  constructor() {
    this.midiAccess = null;
    this.inputs = [];
    this.handleMidiCallback = null;
  }

  async init() {
    try {
      this.midiAccess = await navigator.requestMIDIAccess();
      this.setupInputs();
    } catch (error) {
      console.error("MIDI access error:", error);
    }
  }

  setupInputs() {
    for (let input of this.midiAccess.inputs.values()) {
      this.inputs.push(input);
      input.onmidimessage = this.handleMidiMessage.bind(this);
    }
  }

  setHandleMidiCallback(callback) {
    this.handleMidiCallback = callback;
  }

  // MIDIメッセージ受信
  handleMidiMessage(message) {
    if (this.handleMidiCallback) {
      this.handleMidiCallback(message);
    }
  }
}

export default new MidiHandler();
