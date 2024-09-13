<script setup>
import OscillatorUI from './components/OscillatorUI.vue';
import FilterUI from './components/FilterUI.vue';
import AmpUI from './components/AmpUI.vue';
import WaveDisplay from './components/WaveDisplay.vue';
import SpectrumAnalyser from './components/SpectrumAnalyser.vue';
import parameterDescriptor from "./parameterDescriptor.js"
import MidiHandler from "./MidiHandler.js";
import NoteManager from './NoteManager.js';
</script>

<template>
  <div class="whole">
    <div class="title">
      <h2 class="title-text">
        Internship Synthesizer
      </h2>
    </div>
    <div>
      <button id="start-button" v-show="!isStarted" @click="setup">
        start
      </button>
    </div>
    <div v-show="isStarted">
      <div>
        <input id="noteOn-button" type="button" value="Note On" @mousedown="noteOn" @mouseup="noteOff" />
      </div>
      <div class="display">
        <WaveDisplay ref="wave" :analyser="analyser" />
        <SpectrumAnalyser ref="spectrum" :analyser="analyser" />
      </div>
      <div>
        <OscillatorUI @parameterChanged="onParameterChanged" />
        <FilterUI @parameterChanged="onParameterChanged" />
        <AmpUI @parameterChanged="onParameterChanged" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "MainUI",
  data() {
    return {
      isStarted: false,
      context: null,
      sampleRate: 48000,
      synthesizer: null,
      analyser: null,
      waveDataSize: 512,
      params: parameterDescriptor.parameters
    }
  },
  methods: {
    setup() {
      this.setupWorklet();
      this.setupMidi();
    },
    setupWorklet() {
      console.log("start")
      this.isStarted = true
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      const context = new AudioContext()
      this.sampleRate = context.sampleRate
      this.context = context

      let options = {
        processorOptions: {
          sampleRate: this.context.sampleRate,
        },
        numberOfInputs: 0,
        numberOfOutputs: 1,
        outputChannelCount: [1]
      }
      context.audioWorklet.addModule('/SynthesizerWorklet.js').then(() => {
        this.synthesizer = new AudioWorkletNode(context, 'synthesizer-worklet', options)

        console.log(this.synthesizer)

        this.analyser = this.context.createAnalyser();
        this.analyser.maxDecibels = 0;
        this.analyser.fftSize = this.waveDataSize;
        this.analyser.smoothingTimeConstant = 0.1;
        this.synthesizer.connect(this.analyser).connect(context.destination)

        setInterval(this.draw, 1000 / 10) //  オシロスコープ描画用タイマー
      })
    },
    onParameterChanged(value) {
      const data = { type: "param", value: value }
      this.synthesizer.port.postMessage(data)
    },
    noteOn() {
      console.log("noteOn")
      const data = { type: "noteOn", value: true }
      this.synthesizer.port.postMessage(data)
    },
    noteOff() {
      const data = { type: "noteOn", value: false }
      this.synthesizer.port.postMessage(data)
    },
    setupMidi() {
      MidiHandler.init(); // Web MIDIのセットアップ
      MidiHandler.setHandleMidiCallback(this.processMidiMessage); // processMidiMessageをMIDI受信時のコールバックに設定
    },
    processMidiMessage(message) {
      const data = message.data; // データを取得 Uint8Array（8bit符号なし整数値の配列)
      const [status, data1, data2] = data; // 各要素を変数に格納　先頭がステータスバイト、それ以降がデータバイト
      //各データバイトは1byte（8bit）だが先頭の1bitはデータバイトであることを示すフラグで常に０なので得られる値は7bit(0~127)である
      console.log(`ステータスバイト:${status}, データバイト１:${data1}, データバイト２:${data2}`);

      // ステータスバイトの値によって処理を場合分けする（参照：https://www.g200kg.com/jp/docs/tech/midi.html）
      switch (status >> 4) {
        case 0x8:  // 8n hex(nはMIDIチャンネル)はノートオフを指す
          //  ノートオフメッセージの場合も、data1：ノート番号、data2：ベロシティ
          this.midiNoteOff(data1, data2);
          break;

        case 0x9:  // 9n hex(nはMIDIチャンネル)はノートオンを指す
          //  ノートオンメッセージの場合、data1：ノート番号、data2：ベロシティ
          this.midiNoteOn(data1, data2);
          break;

        default:
          console.log("This status byte is not supported in this app.");
          break;
      }
    },
    midiNoteOff(noteNumber, velocity) {
      NoteManager.noteOff(noteNumber);
      const activeNoteNumber = NoteManager.getCurrentNote()
      if (activeNoteNumber == null) {
        // 押鍵中のノートがない場合はノートオフする
        this.noteOff();
      }
      else {
        //  押鍵中のノートがある（レガートしている）場合はオシレーターをそのノートの音程に変更する
        //  activeNoteNumberを周波数に変換
        const freq = this.noteNumberToFrequency(activeNoteNumber);
        let data = {
          id: this.params.frequency.id,
          value: freq
        };
        this.onParameterChanged(data); //  frequencyを変更
      }
    },
    midiNoteOn(noteNumber, velocity) {
      //  以下の処理でnoteNumber、velocityに対応した音を発音する
      //  ①noteNumberを使ってオシレーターの周波数を設定　②velocityを使って音量を設定　③Note On

      //  ①
      //  ノートナンバーを周波数に変換（算出はnoteNumberToFrequency関数内を見てください）
      const freq = this.noteNumberToFrequency(noteNumber);
      let data = {
        id: this.params.frequency.id,
        value: freq
      };
      this.onParameterChanged(data); //  frequencyを変更

      //  ②
      //  ベロシティでvolumeを変える
      const volume = velocity / 127; //  velocityは0~127なので、volume=0.0~1.0
      data = {
        id: this.params.volume.id,
        value: volume
      };
      this.onParameterChanged(data); //  volumeを変更

      //  ③
      //  ノートオン
      this.noteOn();

      // レガート奏法に対応するためにNoteManagerにノートナンバーを記録する
      NoteManager.noteOn(noteNumber);
    },
    noteNumberToFrequency(noteNumber) {
      //  12平均律に基づいてノートナンバーを周波数に変換
      //  ノートナンバーnの周波数をf(n)Hzとすると
      //  f(n+1) = f(n) * 2^(1/12)
      //  つまり　f(n+a) = f(n) * 2^(a/12)
      const A4_NOTE_NUMBER = 69; // A4のMIDIノート番号
      const A4_FREQUENCY = 440; // A4の周波数 (Hz)
      const frequency = A4_FREQUENCY * Math.pow(2, (noteNumber - A4_NOTE_NUMBER) / 12);
      return frequency;
    },
    draw() {
      this.$refs.wave.drawWave()
      this.$refs.spectrum.drawSpectrum()
    }
  },
}
</script>

<style scoped></style>
