<script setup>
import OscillatorUI from './components/OscillatorUI.vue';
import FilterUI from './components/FilterUI.vue';
import AmpUI from './components/AmpUI.vue';
import WaveDisplay from './components/WaveDisplay.vue';
import SpectrumAnalyzer from './components/SpectrumAnalyzer.vue';  
import parameterDescriptor from "./parameterDescriptor.js"
import MyWorkletProcessorUrl from '../public/SynthesizerWorklet.js?worker&url';
</script>

<template>
  <div class="whole">
    <div class="title">
      <a class="logo" href="https://www.korg.com/jp/" target="_blank">
        <img class="logo-img" src="./assets/korg.jpg" />
      </a>
      <h2 class="title-text">
        Internship Synthesizer
      </h2>
    </div>
    <div>
      <button id="start-button" v-show="!isStarted" @click="setupWorklet">
        start
      </button>
    </div>
    <div v-show="isStarted">
      <div>
        <input id="noteOn-button" type="button" value="Note On" @mousedown="noteOn" @mouseup="noteOff" />
      </div>
      <div>
        <WaveDisplay ref="wave" :analyser="analyser" />
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
      context.audioWorklet.addModule(MyWorkletProcessorUrl).then(() => {
        this.synthesizer = new AudioWorkletNode(context, 'synthesizer-worklet', options)

        console.log(this.synthesizer)

        this.analyser = this.context.createAnalyser();
        this.analyser.maxDecibels = 0;
        this.analyser.fftSize = this.waveDataSize;
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
    draw() {
      this.$refs.wave.drawWave()
    }
  },
}
</script>

<style scoped></style>
