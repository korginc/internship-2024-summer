<script setup>
import parameterDescriptor from "../parameterDescriptor.js"
</script>

<template>
  <h3 class="section-title">Oscillator</h3>
  <div class="section">
    <div class="param" id="oscType">
      <h5>
        {{ params.oscType.name }}
      </h5>
      <select v-model="oscType" @change="oscTypeChanged">
        <option v-for="i in Object.keys(oscTypes).length" v-bind:value="i - 1">
          {{ oscTypeName(i) }}
        </option>
      </select>
    </div>
    <div class="param" id="oscFrequency">
      <h5>
        {{ params.frequency.name }}
      </h5>
      <input type="range" :min="minLogFreq" :max="maxLogFreq" :step="(maxLogFreq - minLogFreq) / 10000"
        v-model="logFreq" @input="frequencyChanged" />
      <div>
        {{ frequency }} Hz
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "OscillatorUI",
  emits: ["parameterChanged"],
  data() {
    return {
      params: parameterDescriptor.parameters,
      oscTypes: parameterDescriptor.oscTypes,

      oscType: parameterDescriptor.parameters.oscType.defaultValue,
      frequency: parameterDescriptor.parameters.frequency.defaultValue,

      // for log scale slider
      logFreq: Math.log(parameterDescriptor.parameters.frequency.defaultValue),
      minLogFreq: Math.log(parameterDescriptor.parameters.frequency.minValue),
      maxLogFreq: Math.log(parameterDescriptor.parameters.frequency.maxValue),
    }
  },
  methods: {
    oscTypeChanged(event) {
      const param = { id: this.params.oscType.id, value: this.oscType }
      this.$emit("parameterChanged", param)
    },
    frequencyChanged(event) {
      const frequency = Math.round(Math.exp(this.logFreq));
      if (frequency != this.frequency) {
        this.frequency = frequency
        const param = { id: this.params.frequency.id, value: this.frequency }
        this.$emit("parameterChanged", param)
      }
    },
    oscTypeName(i) {
      const key = Object.keys(this.oscTypes).find(key => this.oscTypes[key].index == i - 1)
      return this.oscTypes[key].name
    }
  },
}
</script>

<style scoped></style>
