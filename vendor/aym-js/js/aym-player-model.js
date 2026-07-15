/*
 * aym-player-model.js - Copyright (c) 2001-2026 - Olivier Poncet
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

import { AYM_Utils } from './aym-utils.js';

// ---------------------------------------------------------------------------
// AYM_PlayerModel
// ---------------------------------------------------------------------------

export class AYM_PlayerModel {
    constructor(controller) {
        this.controller = controller;
        this.waContext  = null;
        this.waAnalyser = null;
        this.waGain     = null;
        this.waWorklet  = null;

        this.waSplitter = null;
        this.waAnalyserCh0 = null;
        this.waAnalyserCh1 = null;
        this.waAnalyserCh2 = null;

    }

    async powerOn() {
        await this.createContext();
        await this.createWorklet();
        await this.createAnalyser();
        await this.createGain();
        await this.controller.onInputGain();
        await this.sendState();
    }

    async powerOff() {
        await this.destroyWorklet();
        await this.destroyGain();
        await this.destroyAnalyser();
        await this.destroyContext();
    }

    async createContext() {
        if(this.waContext == null) {
            this.waContext = new AudioContext();
            await this.waContext.audioWorklet.addModule('/vendor/aym-js/js/aym-player-processor.js');
        }
    }

    async destroyContext() {
        if(this.waContext != null) {
            await this.waContext.close();
            this.waContext = null;
        }
    }

    async createAnalyser() {
        if(this.waAnalyser == null) {
            this.waAnalyser = this.waContext.createAnalyser();
            this.waAnalyser.connect(this.waContext.destination);

            // 2. Crear el divisor para separar Izquierda y Derecha (2 canales de salida)
            //this.waSplitter = this.waContext.createChannelSplitter(2);

            // 3. Crear el analizador exclusivo para el Canal 0
            this.waAnalyserCh0 = this.waContext.createAnalyser();
            //this.waAnalyserCh0.fftSize = 64; // Ajusta el tamaño de bandas según tus necesidades
            this.waWorklet.connect(this.waAnalyserCh0, 1, 0); // <--- Salida 1 (Canal A puro)

            // 4. Conectar la salida 0 del splitter (L / Izquierda) al analizador del Canal 0
            //this.waSplitter.connect(this.waAnalyserCh0, 0, 0);

            // Crear el analizador para el Canal 1 (Aproximación usando la mezcla L)
            this.waAnalyserCh1 = this.waContext.createAnalyser();
            //this.waAnalyserCh1.fftSize = 64;
            //this.waSplitter.connect(this.waAnalyserCh1, 0, 0); 
            this.waWorklet.connect(this.waAnalyserCh1, 2, 0); // <--- Salida 2 (Canal B puro)

            // Crear el analizador exclusivo para el Canal 2 (Derecha)
            this.waAnalyserCh2 = this.waContext.createAnalyser();
            //this.waAnalyserCh2.fftSize = 64;
            //this.waSplitter.connect(this.waAnalyserCh2, 1, 0); // Conecta salida R
            this.waWorklet.connect(this.waAnalyserCh2, 3, 0); // <--- Salida 3 (Canal C puro)

        }
    }

    async destroyAnalyser() {
        if(this.waAnalyser != null) {
            this.waAnalyser.disconnect();
            this.waAnalyser = null;

             // NUEVA LIMPIEZA: Disconectar splitter y analizador del Canal 0
            if(this.waSplitter != null) {
                this.waSplitter.disconnect();
                this.waSplitter = null;
            }
            if(this.waAnalyserCh0 != null) {
                this.waAnalyserCh0.disconnect();
                this.waAnalyserCh0 = null;
            }
            // NUEVA LIMPIEZA: Canal 1 y Canal 2
            if(this.waAnalyserCh1 != null) {
                this.waAnalyserCh1.disconnect();
                this.waAnalyserCh1 = null;
            }
            if(this.waAnalyserCh2 != null) {
                this.waAnalyserCh2.disconnect();
                this.waAnalyserCh2 = null;
            }
        }
    }

    async createGain() {
        if(this.waGain == null) {
            this.waGain = new GainNode(this.waContext);
            this.waWorklet.connect(this.waGain, 0, 0);
            this.waGain.connect(this.waAnalyser);
            this.setGain();

            // NUEVA CONEXIÓN: Alimentamos el splitter con la salida del volumen
            //this.waGain.connect(this.waSplitter);
        }
    }

    async destroyGain() {
        if(this.waGain != null) {
            this.waGain.disconnect();
            this.waGain = null;
        }
    }

    async createWorklet() {
        if(this.waWorklet == null) {
            const audioWorkletProcessorOptions = {
                unused: null
            };
            const audioWorkletNodeOptions = {
                numberOfInputs: 0,
                numberOfOutputs: 4,
                outputChannelCount: [2, 1, 1, 1], // Output0: Estéreo, Output1,2,3: Monofónicos
                processorOptions: audioWorkletProcessorOptions,
            };
            this.waWorklet = new AudioWorkletNode(this.waContext, 'aym-player-processor', audioWorkletNodeOptions);
            //this.waWorklet.connect(this.waGain);
            //this.waWorklet.port.onmessage = (message) => {
            //    this.recvMessage(message);
            //};

            // Conectamos la salida 0 (Mezcla general estéreo) al amplificador máster
            //this.waWorklet.connect(this.waGain, 0, 0); 
            this.waWorklet.port.onmessage = (message) => { this.recvMessage(message); };
        }
    }

    async destroyWorklet() {
        if(this.waWorklet != null) {
            this.waWorklet.disconnect();
            this.waWorklet = null;
        }
    }

    isPowered() {
        if(this.waWorklet != null) {
            return true;
        }
        return false;
    }

    isNotPowered() {
        if(this.waWorklet == null) {
            return true;
        }
        return false;
    }

    sendMessage(type = null, data = null) {
        if(this.waWorklet != null) {
            this.waWorklet.port.postMessage({ message_type: type, message_data: data });
        }
    }

    recvMessage(message) {
        const payload = message.data;

        switch(payload.message_type) {
            case 'Paused':
                this.controller.recvPaused();
                break;
            case 'Resumed':
                this.controller.recvResumed();
                break;
            case 'MutedA':
                this.controller.recvMutedA();
                break;
            case 'UnmutedA':
                this.controller.recvUnmutedA();
                break;
            case 'MutedB':
                this.controller.recvMutedB();
                break;
            case 'UnmutedB':
                this.controller.recvUnmutedB();
                break;
            case 'MutedC':
                this.controller.recvMutedC();
                break;
            case 'UnmutedC':
                this.controller.recvUnmutedC();
                break;
            case 'OnlyA_sel':
                this.controller.recvOnlyA_sel();
                break;
            case 'OnlyB_sel':
                this.controller.recvOnlyB_sel();
                break;
            case 'OnlyC_sel':
                this.controller.recvOnlyC_sel();
                break;
            case 'OnlyA_unsel':
                this.controller.recvOnlyA_unsel();
                break;
            case 'OnlyB_unsel':
                this.controller.recvOnlyB_unsel();
                break;
            case 'OnlyC_unsel':
                this.controller.recvOnlyC_unsel();
                break;
            case 'Title':
                this.controller.recvTitle(payload.message_data);
                break;
            case 'FileData':
                this.controller.recvFileData(payload.message_data);
                break;
            case 'Seek':
                this.controller.recvSeek(payload.message_data);
                break;
            case 'Playing':
                this.controller.recvPlaying();
                break;
            case 'PlayingFile':
                this.controller.recvPlayingFile();
                break;
            
            case 'Stopped':
                this.controller.recvStopped();
                break;
            // Add GAM 
            case 'StoppedFile':
                this.controller.recvStoppedFile();
                break;
            case 'Changed':
                this.controller.recvChanged();
                break;
            case 'Unchanged':
                this.controller.recvUnchanged();
                break;
            // Add GAM
            case 'TrackList':
                this.controller.recvTrackList(payload.message_data);
                break;
            default:
                break;
        }
    }

    sendState() {
        this.sendMessage('State');
    }

    sendReset() {
        this.sendMessage('Reset');
    }

    sendPause() {
        this.sendMessage('Pause');
    }

    sendMuteA() {
        this.sendMessage('MuteA');
    }

    sendMuteB() {
        this.sendMessage('MuteB');
    }

    sendMuteC() {
        this.sendMessage('MuteC');
    }

    sendOnlyA() {
        this.sendMessage('OnlyA');
    }

    sendOnlyB() {
        this.sendMessage('OnlyB');
    }

    sendOnlyC() {
        this.sendMessage('OnlyC');
    }

    sendPlay() {
        this.sendMessage('Play');
    }

    sendStop() {
        this.sendMessage('Stop');
    }

    sendStopFile() {
        this.sendMessage('StopFile');
    }

    sendPrev() {
        this.sendMessage('Prev');
    }

    sendNext() {
        this.sendMessage('Next');
    }

    sendSeek(seek) {
        this.sendMessage('Seek', seek);
    }

    setGain(gain) {
        if(this.waGain != null) {
            this.waGain.gain.value = 0.5; //AYM_Utils.clamp_flt(gain, 0.0, 1.0);
        }
    }

    /////////////////////////////////////////////////////
    // Add by GAM
    sendSelectTrack(index) {
        this.sendMessage('SelectTrack', index);
    }


    /////////////////////////////////////////////////////
    // Add by GAM
    sendExternalTrack(musicData) {
        // Mandamos el comando personalizado 'PlayExternal' con la estructura completa
        this.sendMessage('PlayExternal', musicData);
    }
}

// ---------------------------------------------------------------------------
// End-Of-File
// ---------------------------------------------------------------------------
