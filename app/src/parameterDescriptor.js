const oscTypes = {
    sawtooth: { index: 0, name: "Sawtooth" },
    sine: { index: 1, name: "Sine" },
    square_wave: {index: 2, name: "Square Wave"},
    choppy_sea: {index: 3, name: "Choppy Sea"},
    pseudosine_wave: {index: 4, name: "Pseudosine Wave"},
}

const filterTypes = {
    bypass: { index: 0, name: "Bypass" },
    lowpass: { index: 1, name: "LowPass" },
    highpass: { index: 2, name: "HighPass" },
    bandpass: { index: 3, name: "BandPass" },
    bandstop: { index: 4, name: "BandStop" },
}

const parameters = {
    oscType: {
        id: 0,
        name: "OSC Type",
        defaultValue: 0,
        minValue: 0,
        maxValue: Object.keys(oscTypes).length - 1,
    },
    frequency: {
        id: 1,
        name: "Frequency",
        defaultValue: 440.0,
        minValue: 20,
        maxValue: 10000,
    },
    filterType: {
        id: 2,
        name: "Filter Type",
        defaultValue: 0,
        minValue: 0,
        maxValue: Object.keys(filterTypes).length - 1,
    },
    cutoff: {
        id: 3,
        name: "Filter Cutoff",
        defaultValue: 1000,
        minValue: 20,
        maxValue: 20000,
    },
    resonance: {
        id: 4,
        name: "Filter Q",
        defaultValue: 0.7,
        minValue: 0.1,
        maxValue: 2,
    },
    volume: {
        id: 5,
        name: "Volume",
        defaultValue: 0.9,
        minValue: 0,
        maxValue: 1,
    },
}

export default {
    oscTypes,
    filterTypes,
    parameters,
}
