/*
 * aym-player-processor.js - Copyright (c) 2001-2026 - Olivier Poncet
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { AYM_Emulator } from './aym-emulator.js';
import { AYM_Playlist } from './aym-playlist.js';

// ---------------------------------------------------------------------------
// Some useful constants
// ---------------------------------------------------------------------------

const AYM_FLAG_RESET = 0x01;
const AYM_FLAG_PAUSE = 0x02;
const AYM_FLAG_MUTEA = 0x10;
const AYM_FLAG_MUTEB = 0x20;
const AYM_FLAG_MUTEC = 0x40;

// ---------------------------------------------------------------------------
// AYM_Processor
// ---------------------------------------------------------------------------

export class AYM_PlayerProcessor extends AudioWorkletProcessor {
    constructor(options) {
        super();
        this.playlist    = new AYM_Playlist();
        this.chip        = new AYM_Emulator({});
        this.chip_flags  = 0;
        this.chip_ticks  = 0;
        this.chip_clock  = 0;
        this.music       = null;
        this.music_index = -1;
        this.music_count = 0;
        this.music_ticks = 0;
        this.music_clock = 0;
        this.channel_a   = null;
        this.channel_b   = null;
        this.channel_c   = null;
        this.port.onmessage = (message) => {
            this.recvMessage(message);
        };
        this.setChipMasterClock(1000000);
    }

    sendMessage(type = null, data = null) {
        this.port.postMessage({ message_type: type, message_data: data });
    }

    recvMessage(message) {
        const payload = message.data;

        switch(payload.message_type) {
            case 'State':
                this.recvState();
                break;
            case 'Reset':
                this.recvReset();
                break;
            case 'Pause':
                this.recvPause();
                break;
            case 'MuteA':
                this.recvMuteA();
                break;
            case 'MuteB':
                this.recvMuteB();
                break;
            case 'MuteC':
                this.recvMuteC();
                break;
            case 'OnlyA':
                this.recvOnlyA();
                break;
            case 'OnlyB':
                this.recvOnlyB();
                break;
            case 'OnlyC':
                this.recvOnlyC();
                break;
            case 'Play':
                this.recvPlay();
                break;
            case 'Stop':
                this.recvStop();
                break;
            case 'StopFile':
                this.recvStopFile();
                break;
            case 'Prev':
                this.recvPrev();
                break;
            case 'Next':
                this.recvNext();
                break;
            case 'Seek':
                this.recvSeek(payload.message_data);
                break;
            // Add GAM
            case 'SelectTrack':
                this.recvSelectTrack(payload.message_data);
                break;
             // Add GAM
            case 'RequestTrackList':
                this.sendTrackList();
                break;
            // Add GAM
            case 'PlayExternal':
                this.recvPlayExternal(payload.message_data);
                break;            
            default:
                break;
        }
    }

    recvState() {
        if((this.chip_flags & AYM_FLAG_PAUSE) != 0) {
            this.sendPaused();
        }
        else {
            this.sendResumed();
        }
        if((this.chip_flags & AYM_FLAG_MUTEA) != 0) {
            this.sendMutedA();
        }
        else {
            this.sendUnmutedA();
        }
        if((this.chip_flags & AYM_FLAG_MUTEB) != 0) {
            this.sendMutedB();
        }
        else {
            this.sendUnmutedB();
        }
        if((this.chip_flags & AYM_FLAG_MUTEC) != 0) {
            this.sendMutedC();
        }
        else {
            this.sendUnmutedC();
        }
    }

    recvReset() {
        this.chip_flags |= AYM_FLAG_RESET;
    }

    recvPause() {
        if((this.chip_flags & AYM_FLAG_PAUSE) == 0) {
            this.chip_flags |= AYM_FLAG_PAUSE;
            this.sendPaused();
        }
        else {
            this.chip_flags &= ~AYM_FLAG_PAUSE;
            this.sendResumed();
        }
    }

    recvMuteA() {
        if((this.chip_flags & AYM_FLAG_MUTEA) == 0) {
            this.chip_flags |= AYM_FLAG_MUTEA;
            this.sendMutedA();
        }
        else {
            this.chip_flags &= ~AYM_FLAG_MUTEA;
            this.sendUnmutedA();
        }
    }

    recvOnlyA() {  // Cambiar lógica para silenciar canal A
        if(this.chip_flags == (AYM_FLAG_MUTEB & AYM_FLAG_MUTEC)) {
            this.chip_flags |= AYM_FLAG_MUTEB | AYM_FLAG_MUTEC;
            this.sendOnlyA_sel();
            console.log("recvOnlyA");
        }
        else {
            this.chip_flags = 0;
            this.sendOnlyA_unsel();
        }
    }

    recvMuteB() {
        if((this.chip_flags & AYM_FLAG_MUTEB) == 0) {
            this.chip_flags |= AYM_FLAG_MUTEB;
            this.sendMutedB();
        }
        else {
            this.chip_flags &= ~AYM_FLAG_MUTEB;
            this.sendUnmutedB();
        }
    }

    recvOnlyB() { // Cambiar lógica para silenciar canal B
        if(this.chip_flags == (AYM_FLAG_MUTEA & AYM_FLAG_MUTEC)) {
            this.chip_flags |= AYM_FLAG_MUTEA | AYM_FLAG_MUTEC;
            this.sendOnlyB_sel();
            console.log("recvOnlyB");
        }
        else {
            this.chip_flags = 0;
            this.sendOnlyB_unsel();
        }
    }

    recvMuteC() {
        if((this.chip_flags & AYM_FLAG_MUTEC) == 0) {
            this.chip_flags |= AYM_FLAG_MUTEC;
            this.sendMutedC();
        }
        else {
            this.chip_flags &= ~AYM_FLAG_MUTEC;
            this.sendUnmutedC();
        }
    }

    recvOnlyC() { // Cambiar lógica para silenciar canal C
        if(this.chip_flags == (AYM_FLAG_MUTEA & AYM_FLAG_MUTEB)) {
            this.chip_flags |= AYM_FLAG_MUTEA | AYM_FLAG_MUTEB;
            this.sendOnlyC_sel();
            console.log("recvOnlyC");
        }
        else {
            this.chip_flags = 0;
            this.sendOnlyC_unsel();
        }
    }


    recvPlay(trackIndex = null) {
        this.chip_flags |= AYM_FLAG_RESET;
        this.music = this.playlist.getMusic();
        console.log(this.music);

        this.music_index = 0;
        this.music_count = this.music.length;
        this.music_ticks = 0;
        this.music_clock = this.music.framerate;
        this.setChipMasterClock(this.music.frequency);
        this.sendPlaying();

        // Solo cambia de pista interna si el argumento es un número válido
        /*
        if (trackIndex !== null && trackIndex !== undefined) {
            const music = this.playlist.setTrack(trackIndex);
            if (music != null) {
                this.music = music;
                this.music_index = 0;
                this.music_count = this.music.length;
                this.music_ticks = 0;
                this.music_clock = this.music.framerate;
                this.setChipMasterClock(this.frequency);
                this.sendChanged();
                this.sendTitle();
            }
        }

        // Si trackIndex era null, esta línea simplemente quita la pausa 
        // y continúa reproduciendo los bytes que ya estaban en "this.music"
        this.flags &= ~AYM_FLAG_PAUSE;
        this.sendPlaying();*/
        
    }

    recvStop() {
        this.chip_flags |= AYM_FLAG_RESET;
        this.music_index = -1;
        this.music_count = 0;
        this.music_ticks = 0;
        this.music_clock = 0;
        this.setChipMasterClock(this.music.frequency);
        this.sendStopped();
    }

    recvStopFile() {
        this.chip_flags |= AYM_FLAG_RESET;
        this.music_index = -1;
        this.music_count = 0;
        this.music_ticks = 0;
        this.music_clock = 0;
        this.setChipMasterClock(this.music.frequency);
        this.sendStoppedFile();
    }

    recvPrev() {
        const music = this.playlist.prevMusic();
        if(music != null) {
            this.music = music;
            this.music_index = (this.music_index >= 0 ? 0 : this.music_index);
            this.music_count = this.music.length;
            this.music_ticks = 0;
            this.music_clock = this.music.framerate;
            this.setChipMasterClock(this.music.frequency);
            this.sendChanged();
            this.sendTitle();
            if(this.music_index >= 0) {
                this.sendPlaying();
            }
        }
        else {
            this.sendUnchanged();
        }
    }

    recvNext() {
        const music = this.playlist.nextMusic();
        if(music != null) {
            this.music = music;
            this.music_index = (this.music_index >= 0 ? 0 : this.music_index);
            this.music_count = this.music.length;
            this.music_ticks = 0;
            this.music_clock = this.music.framerate;
            this.setChipMasterClock(this.music.frequency);
            this.sendChanged();
            this.sendTitle();
            if(this.music_index >= 0) {
                this.sendPlaying();
            }
        }
        else {
            this.sendUnchanged();
        }
    }

    recvSeek(seek) {
        const music_index = this.music_index;
        const music_count = this.music_count;
        if((music_index > 0) && (music_count > 0)) {
            this.music_index = (((music_count * seek) | 0) % music_count);
        }
    }

    /////////////////////////////////////////////////////////////////////
    // Add GAM
    recvSelectTrack(trackIndex) {
        const music = this.playlist.setTrack(trackIndex);
        if (music != null) {
            this.music = music;
            this.music_index = 0; // Inicia la canción desde el principio
            this.music_count = this.music.length;
            this.music_ticks = 0;
            this.music_clock = this.music.framerate;
            this.setChipMasterClock(this.music.frequency);
            this.sendChanged();
            this.sendTitle();
            this.sendPlaying();
        }
    }

     /////////////////////////////////////////////////////////////////////
    // Add GAM
    recvPlayExternal(extMusic) {
        let framesStruct = [];
        for (let i = 0; i < extMusic.songData.length; i += 14) { 
            framesStruct.push(extMusic.songData.slice(i, i + 14));
        
        }
        extMusic.frames = framesStruct;

        // Adaptamos el objeto recibido para simular la interfaz de las pistas fijas de musics/*
        this.music = {
            title: extMusic.title,
            type: extMusic.type,
            length: extMusic.frames.length,
            framerate: 50, // Frecuencia estándar de actualización (Hz)
            frequency: 2000000,
            frames: extMusic.frames
        };

        //console.log(this.music);
        if (this.music.type === 'YM') {
            this.chip.set_type_ym();
        } else {
            this.chip.set_type_ay();
        }

        this.chip_flags |= AYM_FLAG_RESET;

        // Reiniciamos todos los punteros de control del reproductor
        this.music_index = 0; // Apunta al inicio del arreglo (Frame 0)
        this.music_count = this.music.length;
        this.music_ticks = 0;
        this.music_clock = this.music.framerate;
        this.setChipMasterClock(this.music.frequency);

        // Quitamos estados de pausa y notificamos los cambios a la interfaz de usuario
        //this.flags &= ~AYM_FLAG_PAUSE;
        //this.sendChanged();
        //this.sendTitle();
        //this.sendPlaying();
        this.sendFilePlaying();
        
    }

    sendTitle() {
        //this.sendMessage('Title', this.music.title);
        // Add GAM
        this.port.postMessage({
            message_type: 'Title',
            message_data: {
                title: this.music.title || "Unknown",
                track_index: this.playlist.cur_track // <-- Enviamos el índice actual de la playlist
            }
        });
    }

    sendPlaying() {
        this.sendMessage('Playing');
        this.sendTitle();
    }

    sendFilePlaying() {
        this.sendMessage('PlayingFile');
        this.port.postMessage({
            message_type: 'TitleFile',
            message_data: {
                title: this.music.title || "Unknown"
            }
        });
        
    }

    sendStopped() {
        this.sendMessage('Stopped');
        this.sendSeek(0);
    }

    sendStoppedFile() {
        this.sendMessage('StoppedFile');
        this.sendSeek(0);
    }


    sendChanged() {
        this.sendMessage('Changed');
    }

    sendUnchanged() {
        this.sendMessage('Unchanged');
    }

    sendSeek(seek) {
        this.sendMessage('Seek', seek);
    }

    sendPaused() {
        this.sendMessage('Paused');
    }

    sendResumed() {
        this.sendMessage('Resumed');
    }

    sendMutedA() {
        this.sendMessage('MutedA');
    }

    sendUnmutedA() {
        this.sendMessage('UnmutedA');
    }

    sendMutedB() {
        this.sendMessage('MutedB');
    }

    sendUnmutedB() {
        this.sendMessage('UnmutedB');
    }

    sendMutedC() {
        this.sendMessage('MutedC');
    }

    sendUnmutedC() {
        this.sendMessage('UnmutedC');
    }

    sendOnlyA_sel(){
        this.sendMessage('OnlyA_sel');
    }

    sendOnlyA_unsel(){
        this.sendMessage('OnlyA_unsel');
    }

    sendOnlyB_sel(){
        this.sendMessage('OnlyB_sel');
    }

    sendOnlyB_unsel(){
        this.sendMessage('OnlyB_unsel');
    }

    sendOnlyC_sel(){
        this.sendMessage('OnlyC_sel');
    }

    sendOnlyC_unsel(){
        this.sendMessage('OnlyC_unsel');
    }

    setChipMasterClock(master_clock) {
        this.chip_clock = this.chip.set_master_clock(master_clock);
        this.chip.reset();
    }

    /////////////////////////////////////////////////////////////////////////////
    // Add GAM
    sendTrackList() {
        const list = this.playlist.getTrackNames();
        this.port.postMessage({
            message_type: 'TrackList',
            message_data: list
        });
    }

    hasReset() {
        if((this.chip_flags & AYM_FLAG_RESET) != 0) {
            this.chip_flags &= ~AYM_FLAG_RESET;
            this.chip_ticks &= 0;
            this.chip.reset();
            return true;
        }
        return false;
    }

    hasPause() {
        if((this.chip_flags & AYM_FLAG_PAUSE) != 0) {
            return true;
        }
        return false;
    }

    process(inputs, outputs, parameters) {
        if(this.hasReset() || this.hasPause()) {
            return true;
        }

        const numSamples = () => {
            if(outputs.length > 0) {
                const output0 = outputs[0];
                if(output0.length > 0) {
                    const channel0 = output0[0];
                    if(channel0.length > 0) {
                        return channel0.length;
                    }
                }
            }
            return 128;
        };

        const getChannelA = (samples) => {
            if((this.channel_a == null) || (this.channel_a.length < samples)) {
                this.channel_a = new Float32Array(samples);
            }
            return this.channel_a;
        };

        const getChannelB = (samples) => {
            if((this.channel_b == null) || (this.channel_b.length < samples)) {
                this.channel_b = new Float32Array(samples);
            }
            return this.channel_b;
        };

        const getChannelC = (samples) => {
            if((this.channel_c == null) || (this.channel_c.length < samples)) {
                this.channel_c = new Float32Array(samples);
            }
            return this.channel_c;
        };

        const samples   = numSamples();
        const channel_a = getChannelA(samples);
        const channel_b = getChannelB(samples);
        const channel_c = getChannelC(samples);

        const mixMono = (channel) => {
            for(let sample = 0; sample < samples; ++sample) {
                let output = 0;
                if((this.chip_flags & AYM_FLAG_MUTEA) == 0) {
                    output += channel_a[sample];
                }
                if((this.chip_flags & AYM_FLAG_MUTEB) == 0) {
                    output += channel_b[sample];
                }
                if((this.chip_flags & AYM_FLAG_MUTEC) == 0) {
                    output += channel_c[sample];
                }
                channel[sample] = (output / 3.0);
            }
        };

        const mixStereo = (channel1, channel2) => {
            for(let sample = 0; sample < samples; ++sample) {
                let output1 = 0;
                let output2 = 0;
                if((this.chip_flags & AYM_FLAG_MUTEA) == 0) {
                    output1 += (channel_a[sample] * 0.75);
                    output2 += (channel_a[sample] * 0.25);
                }
                if((this.chip_flags & AYM_FLAG_MUTEB) == 0) {
                    output1 += (channel_b[sample] * 0.50);
                    output2 += (channel_b[sample] * 0.50);
                }
                if((this.chip_flags & AYM_FLAG_MUTEC) == 0) {
                    output1 += (channel_c[sample] * 0.25);
                    output2 += (channel_c[sample] * 0.75);
                }
                channel1[sample] = (output1 / 1.5);
                channel2[sample] = (output2 / 1.5);
            }
        };

        const clockMusic = () => {
            if((this.music != null) && (this.music_index >= 0)) {
                this.music_ticks += this.music_clock;
                if(this.music_ticks >= this.chip_clock) {
                    this.music_ticks -= this.chip_clock;
                    const frame = this.music.frames[this.music_index];
                    for(let index = 0; index < 14; ++index) {
                        const value = frame[index];
                        if((index == 13) && (value == 0xff)) {
                            continue;
                        }
                        this.chip.set_register_index(index);
                        this.chip.set_register_value(value);
                    }
                    if((this.music_index % this.music_clock) == 0) {
                        this.sendSeek((+this.music_index / +this.music_count));
                    }
                    this.music_index = ((this.music_index + 1) | 0);

                    // ==============================================================
                    // Si el puntero llegó al límite de frames totales de la canción
                    // ==============================================================
                    if(this.music_index >= this.music_count) {
                        /*
                        // Carga la siguiente canción en forma automática
                        this.recvNext();
                        if(this.music_index >= this.music_count) {
                            this.recvStop();
                        }*/

                        // Opción simple: no sigue tocando
                        this.recvStop();
                    }
                }
            }
        };

        const clockChip = () => {
            for(let sample = 0; sample < samples; ++sample) {
                channel_a[sample] = this.chip.get_channel0();
                channel_b[sample] = this.chip.get_channel1();
                channel_c[sample] = this.chip.get_channel2();
                while(this.chip_ticks < this.chip_clock) {
                    this.chip_ticks += sampleRate;
                    this.chip.clock();
                    clockMusic();
                }
                this.chip_ticks -= this.chip_clock;
            }
            /*for(const output of outputs) {
                if(output.length >= 2) {
                    //mixStereo(output[0], output[1]);
                    mixStereo(outputs[0][0], outputs[0][1]);
                    continue;
                }
                if(output.length >= 1) {
                    mixMono(output[0]);
                    continue;
                }
            }*/

            if (outputs[0] && outputs[0].length >= 2) {
                mixStereo(outputs[0][0], outputs[0][1]);
            }

            // NUEVO: Si definimos salidas adicionales, volcamos los canales individuales puros
            // Output 1 -> Canal A | Output 2 -> Canal B | Output 3 -> Canal C
            //((this.chip_flags & AYM_FLAG_MUTEA) == 0)

            if (outputs[1] && outputs[1][0]) {
                if((this.chip_flags & AYM_FLAG_MUTEA) == 0){
                     outputs[1][0].set(channel_a);
                }
               
            }
            if (outputs[2] && outputs[2][0]) {
                if((this.chip_flags & AYM_FLAG_MUTEB) == 0){
                    outputs[2][0].set(channel_b);
                }
            }
            if (outputs[3] && outputs[3][0]) {
                if((this.chip_flags & AYM_FLAG_MUTEC) == 0){
                    outputs[3][0].set(channel_c);
                }
                
            }
            return true;
        };

        return clockChip();
    }
}

// ---------------------------------------------------------------------------
// register AYM_PlayerProcessor
// ---------------------------------------------------------------------------

registerProcessor("aym-player-processor", AYM_PlayerProcessor);

// ---------------------------------------------------------------------------
// End-Of-File
// ---------------------------------------------------------------------------
