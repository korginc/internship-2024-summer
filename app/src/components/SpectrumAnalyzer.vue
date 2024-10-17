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
  name: "SpectrumAnalyzer",
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
      width: 600,
      height: 100,
      margin: { top: 10, right: 20, bottom: 30, left: 40 },
      xTicks: [400, 500, 600, 700, 800],
    }
  },
  methods:
  {
    drawWave() {
      if (!this.analyser) {
        return
      }

      const bufferSize = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferSize);
      this.analyser.getByteFrequencyData(dataArray);

      this.clear();
      this.drawXAxis();
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
    drawXAxis() {
      const { left, bottom } = this.margin;
      const axisY = this.height - bottom; 

      // Draw axis line
      this.context.beginPath();
      this.context.moveTo(left, axisY); 
      this.context.lineTo(this.width - this.margin.right, axisY); 
      this.context.strokeStyle = "black";
      this.context.stroke();

      // Draw ticks and labels
      this.xTicks.forEach((tick) => {
        const x = this.getXPosition(tick); 

        // Draw tick mark
        this.context.beginPath();
        this.context.moveTo(x, axisY); 
        this.context.lineTo(x, axisY + 5); 
        this.context.stroke();

        // Draw label
        this.context.fillStyle = "black";
        this.context.textAlign = "center";
        this.context.fillText(`${tick} nm`, x, axisY + 15); 
      });
    },

    
    getXPosition(wavelength) {
      const minWavelength = 400;
      const maxWavelength = 800;
      const axisWidth = this.width - this.margin.left - this.margin.right;

     
      return (
        this.margin.left +
        ((wavelength - minWavelength) / (maxWavelength - minWavelength)) * axisWidth
      );
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
