import parameterDescriptor from "../src/parameterDescriptor"

class SynthesizerWorklet extends AudioWorkletProcessor {
    constructor(options) {
        // The super constructor call is required.
        super();

        this.sampleRate = parseFloat(options.processorOptions.sampleRate);
        this.interpolation = 9.99e-1; /* [0, 1) */

        this.desc = parameterDescriptor;
        this.params = this.desc.parameters;

        /* Oscillator */
        this.oscType = this.params.oscType.defaultValue;
        this.frequency = parseFloat(this.params.frequency.defaultValue) / this.sampleRate;
        this.iFrequency = this.frequency; /* Interpolated Frequency */
        this.phase = 0.0;

        /* Filter */
        this.filterType = this.params.filterType.defaultValue;
        this.cutoff = parseFloat(this.params.cutoff.defaultValue) / this.sampleRate;
        this.iCutoff = this.cutoff; /* Interpolated Cutoff */
        this.resonance = parseFloat(this.params.resonance.defaultValue);
        this.iResonance = this.resonance; /* Interpolated Resonance */
        this.update = 0;

        this.filterZ1 = 0.0;
        this.filterZ2 = 0.0;

        this.updateFilterCoefficients();

        /* Amp */
        this.noteOn = false;
        this.volume = this.convertVolume(parseFloat(this.params.volume.defaultValue));
        this.iVolume = this.volume; /* Interpolated Volume */

        this.port.onmessage = (event) => {
            const data = event.data;
            if (data.type == "noteOn") {
                this.noteOn = data.value;
            }
            else if (data.type == "param") {
                this.setParameter(data.value);
            }
        };
    }
    process(inputs, outputs, parameters) {
        let output = outputs[0][0];
        this.processOscillator(output);
        this.processFilter(output);
        this.processAmp(output);
        return true;
    }
    processOscillator(buffer) {
        switch (this.oscType) {
            case this.desc.oscTypes.sawtooth.index:
                this.generateSawtooth(buffer);
                break;
            case this.desc.oscTypes.sine.index:
                this.generateSawtooth(buffer);
                for (let i = 0; i < buffer.length; ++i) {
                    buffer[i] = Math.cos(Math.PI * buffer[i]);
                }
                break;
            case this.desc.oscTypes.square_wave.index:
                this.generateSawtooth(buffer);
                for(let i=0;i<buffer.length; ++i) {
                    if(buffer[i]=>0)
                        buffer[i]= 1;
                    else
                        buffer[i]= -1;
                }
                break;
            case this.desc.oscTypes.choppy_sea.index:
                this.generateSawtooth(buffer);
                for(let i=0;i<buffer.length; ++i) {
                    buffer[i]= 2*(Math.abs(buffer[i]))-1;
                }
                break;
            case this.desc.oscTypes.pseudosine_wave.index:
                this.generateSawtooth(buffer);
                for(let i=0;i<buffer.length; ++i) {
                    buffer[i]= 4*buffer[i]*((Math.abs(buffer[i]))-1);
                }
                break;
                
            default:
                console.log("Invalid Oscillator Type!");
                for (let i = 0; i < buffer.length; ++i) {
                    buffer[i] = 0.0;
                }
                break;
        }
    }
    processFilter(buffer) {
        let input;
        for (let i = 0; i < buffer.length; ++i) {
            input = buffer[i];
            buffer[i] = this.filterZ1 + this.filterB0 * input;
            this.filterZ1 = this.filterZ2 + this.filterB1 * input + this.filterA1 * buffer[i];
            this.filterZ2 = this.filterB2 * input + this.filterA2 * buffer[i];
            if (++this.update > 16) {
                this.update = 0;
                this.iCutoff += (this.cutoff - this.iCutoff) * 1.0e-2;
                this.iResonance += (this.resonance - this.iResonance) * 1.0e-2;
                this.updateFilterCoefficients();
            }
        }
    }
    processAmp(buffer) {
        if (this.noteOn) {
            for (let i = 0; i < buffer.length; ++i) {
                this.iVolume += (this.volume - this.iVolume) * (1.0 - this.interpolation);
                buffer[i] *= this.iVolume;
            }
        }
        else {
            for (let i = 0; i < buffer.length; ++i) {
                this.iVolume = this.volume;
                buffer[i] = 0.0;
            }
        }
    }
    generateSawtooth(buffer) {
        let frequency = this.iFrequency;
        let phase = this.phase;
        for (let i = 0; i < buffer.length; ++i) {
            frequency += (this.frequency - frequency) * (1.0 - this.interpolation);
            phase += frequency;
            if (phase >= 1.0) {
                phase -= Math.floor(phase);
            }
            buffer[i] = 2.0 * phase - 1.0;
        }
        this.iFrequency = frequency;
        this.phase = phase;
    }
    updateFilterCoefficients() {
        const w = 2.0 * Math.PI * this.iCutoff;
        const c = Math.cos(w);
        const s = Math.sin(w) / this.iResonance;
        const a0 = s + 2.0;
        switch (this.filterType) {
            case this.desc.filterTypes.bypass.index:
                this.filterB0 = 1.0;
                this.filterB1 = 0.0;
                this.filterB2 = 0.0;
                this.filterA1 = 0.0;
                this.filterA2 = 0.0;
                break;
            case this.desc.filterTypes.lowpass.index:
                this.filterB0 = (1.0 - c) / a0;
                this.filterB1 = this.filterB0 * 2.0;
                this.filterB2 = this.filterB0;
                this.filterA1 = 4.0 * c / a0;
                this.filterA2 = (s - 2.0) / a0;
                break;
            default:
                console.log("Invalid Filter Type!");
                this.filterB0 = 0.0;
                this.filterB1 = 0.0;
                this.filterB2 = 0.0;
                this.filterA1 = 0.0;
                this.filterA2 = 0.0;
                break;
        }
    }
    setParameter(parameter) {
        switch (parameter.id) {
            case this.params.oscType.id:
                this.oscType = parameter.value;
                break;
            case this.params.frequency.id:
                this.frequency = parseFloat(parameter.value) / this.sampleRate;
                break;
            case this.params.filterType.id:
                this.filterType = parameter.value;
                this.iCutoff = this.cutoff;
                this.iResonance = this.resonance;
                this.filterZ1 = 0.0;
                this.filterZ2 = 0.0;
                break;
            case this.params.cutoff.id:
                this.cutoff = parseFloat(parameter.value) / this.sampleRate;
                break;
            case this.params.resonance.id:
                this.resonance = parseFloat(parameter.value);
                break;
            case this.params.volume.id:
                this.volume = this.convertVolume(parseFloat(parameter.value));
                break;
            default:
                break;
        }
    }
    convertVolume(volume) {
        return volume > 0.0 ? 10.0 ** ((volume - 1.0) * 2.5) : 0.0;
    }
}
registerProcessor('synthesizer-worklet', SynthesizerWorklet);
