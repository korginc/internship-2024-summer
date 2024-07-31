<script setup>
import parameterDescriptor from "../parameterDescriptor.js"
</script>

<template>
  <h3 class="section-title">Amp</h3>
  <div class="section">
    <div class="param" id="volume">
      <h5>
        {{ params.volume.name }}
      </h5>
      <input type="range" :min="params.volume.minValue" :max="params.volume.maxValue" step="0.01" v-model="volume"
        @input="volumeChanged" />
      <div>
        {{ Math.round(volume * 100 * 100) / 100 }} %
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "AmpUI",
  emits: ["parameterChanged"],
  data() {
    return {
      params: parameterDescriptor.parameters,

      volume: parameterDescriptor.parameters.volume.defaultValue,
    }
  },
  methods:
  {
    volumeChanged() {
      const param = { id: this.params.volume.id, value: this.volume }
      this.$emit("parameterChanged", param)
    },
  },
}
</script>

<style scoped></style>
