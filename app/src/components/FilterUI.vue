<script setup>
</script>

<template>
  <h3 class="section-title">Filter</h3>

  <div class="section">
    <div class="param" id="filterType">
      <h5>
        {{ params.filterType.name }}
      </h5>
      <select v-model="filterType" @change="filterTypeChanged">
        <option v-for="i in Object.keys(filterTypes).length" v-bind:value="i - 1">
          {{ filterTypeName(i) }}
        </option>
      </select>
    </div>
    <div class="param" id="filterCutoff">
      <h5>
        {{ params.cutoff.name }}
      </h5>
      <input type="range" :min="minLogCutoff" :max="maxLogCutoff" :step="(maxLogCutoff - minLogCutoff) / 10000"
        v-model="logCutoff" @input="cutoffChanged" />
      <div>
        {{ cutoff }} Hz
      </div>
    </div>
    <div class="param" id="filterCutoff">
      <h5>
        {{ params.resonance.name }}
      </h5>
      <input type="range" :min="params.resonance.minValue" :max="params.resonance.maxValue" step="0.01"
        v-model="resonance" @input="resonanceChanged" />
      <div>
        {{ resonance }}
      </div>
    </div>
  </div>
</template>

<script>
import parameterDescriptor from "../parameterDescriptor.js" //  <script setup>でインポートすると$refsがうまく機能しないためこちらに移動しました、、

export default {
  name: "FilterUI",
  emits: ["parameterChanged"],
  data() {
    return {
      params: parameterDescriptor.parameters,
      filterTypes: parameterDescriptor.filterTypes,

      filterType: parameterDescriptor.parameters.filterType.defaultValue,
      cutoff: parameterDescriptor.parameters.cutoff.defaultValue,
      resonance: parameterDescriptor.parameters.resonance.defaultValue,

      // for log scale slider
      logCutoff: Math.log(parameterDescriptor.parameters.cutoff.defaultValue),
      minLogCutoff: Math.log(parameterDescriptor.parameters.cutoff.minValue),
      maxLogCutoff: Math.log(parameterDescriptor.parameters.cutoff.maxValue)
    }
  },
  methods: {
    filterTypeChanged(event) {
      const param = { id: this.params.filterType.id, value: this.filterType }
      this.$emit("parameterChanged", param)
    },
    cutoffChanged(event) {
      const cutoff = Math.round(Math.exp(this.logCutoff));
      if (this.cutoff != cutoff) {
        this.cutoff = cutoff
        const param = { id: this.params.cutoff.id, value: this.cutoff }
        this.$emit("parameterChanged", param)
      }
    },
    resonanceChanged(event) {
      const param = { id: this.params.resonance.id, value: this.resonance }
      this.$emit("parameterChanged", param)
    },
    filterTypeName(i) {
      const key = Object.keys(this.filterTypes).find(key => this.filterTypes[key].index == i - 1)
      return this.filterTypes[key].name
    },
    setParameter(data) {
      if (data.id != null && data.value != null) {
        const id = data.id
        const value = data.value
        switch (id) {
          case this.params.cutoff.id:
            this.cutoff = Math.round(value)
            this.logCutoff = Math.log(this.cutoff)
            break;
          case this.params.resonance.id:
            this.resonance = Math.round(value * 100) / 100
          default:
            break;
        }
      }
    }
  },
}
</script>

<style scoped></style>
