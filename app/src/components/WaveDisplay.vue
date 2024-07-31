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
  name: "WaveDisplay",
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
    drawWave() {
      if (!this.analyser) {
        return
      }

      const bufferSize = this.analyser.fftSize
      const dataArray = new Uint8Array(bufferSize);
      this.analyser.getByteTimeDomainData(dataArray);

      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.context.beginPath()
      for (let i = 0; i < bufferSize; i++) {
        const sample = dataArray[i] / 255.0;  // 0.0 ~ 1.0
        const x = (i / bufferSize) * this.canvas.width; // x座標の計算
        const y = (1 - sample) * this.canvas.height; // y座標の計算
        if (i === 0) {
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
