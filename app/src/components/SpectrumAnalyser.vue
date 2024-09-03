<script setup>
</script>

<template>
  <h3></h3>
  <div class="section">
    <canvas ref="main" width="600" height="100"></canvas>
  </div>
</template>

<script>
export default {
  name: "SpectrumAnalyser",
  props: {
    analyser: {
      type: Object,
      default: null,
      required: false
    }
  },
  data() {
    return {
      canvas: null,
      context: null,
    }
  },
  methods:
  {
    drawSpectrum() {
      if (!this.analyser) {
        return
      }
      const bufferSize = this.analyser.frequencyBinCount  // fftSize/2
      const dataArray = new Float32Array(bufferSize)
      this.analyser.getFloatFrequencyData(dataArray)  // 単位はdB
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)

      const mininumLevel = -60  // dB
      const logMax = Math.log(bufferSize)

      this.context.beginPath()
      for (let i = 0; i < bufferSize; i++) {
        const sample = dataArray[i] < mininumLevel ? 0 : 1 - dataArray[i] / mininumLevel;  // 0.0 ~ 1.0
        const x = (Math.log(i + 1) / logMax) * this.canvas.width  // x座標を計算（logスケール）
        const y = Math.min(this.canvas.height - this.context.lineWidth, (1 - sample) * this.canvas.height); // y座標の計算 (sample==0の時に線が細くなるのを避けるため最小値を設定)
        if (i == 0) {
          this.context.moveTo(x, y); // 座標(x, y)の点に移動する
        } else {
          this.context.lineTo(x, y); // 現在の点から座標(x, y)の点までの直線を引く
        }
      }
      this.context.strokeStyle = "black";
      this.context.stroke() //  パスを描画
    },
    clear() {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
  },
  mounted() {
    this.canvas = this.$refs.main;
    this.context = this.canvas.getContext('2d');

    this.clear();
  }
}
</script>

<style scoped></style>
