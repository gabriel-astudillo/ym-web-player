/*
 * aym-player-view.js - Copyright (c) 2001-2026 - Olivier Poncet
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

import { AYM_Utils, $ } from './aym-utils.js';

// ---------------------------------------------------------------------------
// AYM_PlayerView
// ---------------------------------------------------------------------------

export class AYM_PlayerView {
    constructor(controller) {
        this.controller = controller;
        this.aymDisplay = null;
        this.aymPlay    = null;
        this.aymFilePlay = null; // Add GAM
        this.aymStop    = null;
        this.aymFileStop = null; // Add GAM

        this.aymNext    = null;
        this.aymSeek    = null;
        this.aymGain    = null;
        this.aymChip0   = null;

        this.aymMuteA   = null;
        this.aymMuteB   = null;
        this.aymMuteC   = null;

        this.aymOnlyA   = null;
        this.aymOnlyB   = null;
        this.aymOnlyC   = null;

        this.aymPower   = null;
        this.aymReset   = null;
        this.aymPause   = null;
        this.aymAnalyse = null;

        this.aymCanvas  = null;
        this.aymContext = null;
        this.aymCanvasCh0  = null;
        this.aymContextCh0 = null;
        this.aymCanvasCh1 = null;
        this.aymContextCh1 = null;
        this.aymCanvasCh2  = null;
        this.aymContextCh2 = null;

        this.aymTimeCanvas = null;
        this.aymTimeContext = null;
        this.aymTimeCanvasCh0 = null;
        this.aymTimeContextCh0 = null;
        this.aymTimeCanvasCh1 = null;
        this.aymTimeContextCh1 = null;
        this.aymTimeCanvasCh2 = null;
        this.aymTimeContextCh2 = null;

        this.fftData    = null;
        this.fftDataCh0 = null;
        this.fftDataCh1 = null;
        this.fftDataCh2 = null;
        
        this.aymFileDisplay = null; // Add GAM
        this.aymStatusDisplay = null; // Add GAM
        //this.aymSelector = null; // Add GAM
        this.filePicker  = null; // Add GAM para archivos ym
        window.addEventListener('load', async () => { await this.controller.onLoadWindow(); });
    }

    async powerOn() {
        this.enableFilePlay(); // Add GAM
        this.disableFileStop(); // Add GAM
        this.enableSeek();

        this.enableMuteA();
        this.enableMuteB();
        this.enableMuteC();

        this.enableOnlyA();
        this.enableOnlyB();
        this.enableOnlyC();


        this.enableReset();
        this.enablePause();
        this.enableAnalyse();
        this.enableCanvas();
        this.setStatusDisplay('AYM Player is On')
        this.startAnalyse();
    }

    async powerOff() {
        this.disableCanvas();
        this.disableAnalyse();
        this.disablePause();
        this.disableReset();

        this.disableMuteC();
        this.disableMuteB();
        this.disableMuteA();

        this.disableOnlyA();
        this.disableOnlyB();
        this.disableOnlyC();

        //this.disablePower();

        this.disableSeek();
        this.disableFileStop(); // Add GAM
        this.disableFilePlay(); // Add GAM
        this.setStatusDisplay('AYM Player is Off')
    }

    bind() {
        this.bindFilePlay(); // Add GAM
        this.bindFileStop(); // Add GAM
        this.bindStatusDisplay(); // Add GAM
        this.bindSeek();

        this.bindMuteA();
        this.bindMuteB();
        this.bindMuteC();

        this.bindOnlyA();
        this.bindOnlyB();
        this.bindOnlyC();

        this.bindPower();
        this.bindReset();
        this.bindPause();
        this.bindAnalyse();
        this.bindCanvas();
        this.bindFilePicker(); // Add GAM
        this.bindHyperlinks();
    }

    bindStatusDisplay() {
        if(this.aymStatusDisplay == null) {
            this.aymStatusDisplay = $('#aymStatusDisplay');
        }
    }


    bindFilePlay() {
        if(this.aymFilePlay == null) {
            this.aymFilePlay = $('#aymFilePlay');
            this.aymFilePlay.disabled = true;
            this.aymFilePlay.addEventListener('click', async () => { await this.controller.onClickFilePlay(); });
        }
    }

    bindFileStop() {
        if(this.aymFileStop == null) {
            this.aymFileStop = $('#aymFileStop');
            this.aymFileStop.disabled = true;
            this.aymFileStop.addEventListener('click', async () => { await this.controller.onClickFileStop(); });
        }
    }

    bindSeek() {
        if(this.aymSeek == null) {
            this.aymSeek = $('#aymSeek');
            this.aymSeek.disabled = true;
            this.aymSeek.min = 0;
            this.aymSeek.max = 1000;
            this.aymSeek.value = 0;
            this.aymSeek.addEventListener('input', async () => { await this.controller.onInputSeek(); });
        }
    }

    bindMuteA() {
        if(this.aymMuteA == null) {
            this.aymMuteA = $('#aymMuteA');
            this.aymMuteA.disabled = true;
            this.aymMuteA.addEventListener('click', async () => { await this.controller.onClickMuteA(); });
        }
    }

    bindMuteB() {
        if(this.aymMuteB == null) {
            this.aymMuteB = $('#aymMuteB');
            this.aymMuteB.disabled = true;
            this.aymMuteB.addEventListener('click', async () => { await this.controller.onClickMuteB(); });
        }
    }

    bindMuteC() {
        if(this.aymMuteC == null) {
            this.aymMuteC = $('#aymMuteC');
            this.aymMuteC.disabled = true;
            this.aymMuteC.addEventListener('click', async () => { await this.controller.onClickMuteC(); });
        }
    }

    bindOnlyA() {
        if(this.aymOnlyA == null) {
            this.aymOnlyA = $('#aymOnlyA');
            this.aymOnlyA.disabled = true;
            this.aymOnlyA.addEventListener('click', async () => { await this.controller.onClickOnlyA(); });
        }
    }

    bindOnlyB() {
        if(this.aymOnlyB == null) {
            this.aymOnlyB = $('#aymOnlyB');
            this.aymOnlyB.disabled = true;
            this.aymOnlyB.addEventListener('click', async () => { await this.controller.onClickOnlyB(); });
        }
    }

    bindOnlyC() {
        if(this.aymOnlyC == null) {
            this.aymOnlyC = $('#aymOnlyC');
            this.aymOnlyC.disabled = true;
            this.aymOnlyC.addEventListener('click', async () => { await this.controller.onClickOnlyC(); });
        }
    }

    bindPower() {
        if(this.aymPower == null) {
            this.aymPower = $('#aymPower');
            this.aymPower.disabled = false;
            this.aymPower.addEventListener('click', async () => { await this.controller.onClickPower(); });
        }
    }

    bindReset() {
        if(this.aymReset == null) {
            this.aymReset = $('#aymReset');
            this.aymReset.disabled = true;
            this.aymReset.addEventListener('click', async () => { await this.controller.onClickReset(); });
        }
    }

    bindPause() {
        if(this.aymPause == null) {
            this.aymPause = $('#aymPause');
            this.aymPause.disabled = true;
            this.aymPause.addEventListener('click', async () => { await this.controller.onClickPause(); });
        }
    }

    bindAnalyse() {
        if(this.aymAnalyse == null) {
            this.aymAnalyse = $('#aymAnalyse');
            this.aymAnalyse.disabled = false;
            this.aymAnalyse.addEventListener('click', async () => { await this.controller.onClickAnalyse(); });
        }
    }

    bindCanvas() {
        if(this.aymCanvas == null) {
            this.aymCanvas = $('#aymCanvas');
            this.aymCanvas.disabled = false;
            this.aymContext = this.aymCanvas.getContext('2d');
        }
        if(this.aymCanvasCh0 == null) {
            this.aymCanvasCh0 = $('#aymCanvasCh0');
            this.aymCanvasCh0.disabled = false;
            this.aymContextCh0 = this.aymCanvasCh0.getContext('2d');
        }
        if(this.aymCanvasCh1 == null) {
            this.aymCanvasCh1 = $('#aymCanvasCh1');
            this.aymCanvasCh1.disabled = false;
            this.aymContextCh1 = this.aymCanvasCh1.getContext('2d');
        }
        if(this.aymCanvasCh2 == null) {
            this.aymCanvasCh2 = $('#aymCanvasCh2');
            this.aymCanvasCh2.disabled = false;
            this.aymContextCh2 = this.aymCanvasCh2.getContext('2d');
        }
        if(this.aymTimeCanvas == null) {
            this.aymTimeCanvas = $('#aymTimeCanvas');
            this.aymTimeCanvas.disabled = false;
            this.aymTimeContext = this.aymTimeCanvas.getContext('2d');
        }
        if(this.aymTimeCanvasCh0 == null) {
            this.aymTimeCanvasCh0 = $('#aymTimeCanvasCh0');
            this.aymTimeCanvasCh0.disabled = false;
            this.aymTimeContextCh0 = this.aymTimeCanvasCh0.getContext('2d');
        }
        if(this.aymTimeCanvasCh1 == null) {
            this.aymTimeCanvasCh1 = $('#aymTimeCanvasCh1'); 
            this.aymTimeCanvasCh1.disabled = false;
            this.aymTimeContextCh1 = this.aymTimeCanvasCh1.getContext('2d');
        }
        if(this.aymTimeCanvasCh2 == null) {
            this.aymTimeCanvasCh2 = $('#aymTimeCanvasCh2');
            this.aymTimeCanvasCh2.disabled = false;
            this.aymTimeContextCh2 = this.aymTimeCanvasCh2.getContext('2d');  
        }

    }

    //////////////////////////////////////////////////////
    // ADD GAM
    bindFilePicker() {
        this.filePicker = $('#file-picker', false); // false por si no existe en todos los HTMLs
        if (this.filePicker) {
            this.filePicker.addEventListener('change', (event) => {
                if (event.target.files.length > 0) {
                    this.controller.onFileSelected(event.target.files[0]);
                }
            });
        }
    }

    //////////////////////////////////////////////////////
    // ADD GAM
    bindHyperlinks() {
        // Buscamos todos los enlaces de canciones .ym en el documento
        const links = document.querySelectorAll('.ym-link');
        
        links.forEach(link => {
            link.addEventListener('click', async (event) => {
                // 1. Evitamos que el navegador intente descargar o navegar al archivo directamente
                event.preventDefault(); 
                
                // 2. Obtenemos la URL exacta del atributo href y el nombre del texto
                const fileUrl = event.target.getAttribute('href');
                const songName = event.target.innerText;
                
                // 3. Cambiamos el contexto de origen y llamamos al controlador pasándole los datos
                this.controller.audioSource = 'external';
                await this.controller.onHyperlinkFileSelected(fileUrl, songName);
            });
        });
    }

    enableFilePlay() {
        AYM_Utils.enableElement(this.aymFilePlay);
    }

    disableFilePlay() {
        AYM_Utils.disableElement(this.aymFilePlay);
    }

    enableStatusDisplay() {
        AYM_Utils.enableElement(this.aymStatusDisplay);
    }

    disableStatusDisplay() {
        AYM_Utils.disableElement(this.aymStatusDisplay);
    }

    enableStop() {
        AYM_Utils.enableElement(this.aymStop);
    }

    enableFileStop() {
        AYM_Utils.enableElement(this.aymFileStop);
    }

    disableFileStop() {
        AYM_Utils.disableElement(this.aymFileStop);
    }

    enableSeek() {
        AYM_Utils.enableElement(this.aymSeek);
    }

    disableSeek() {
        AYM_Utils.disableElement(this.aymSeek);
    }

    enableMuteA() {
        AYM_Utils.enableElement(this.aymMuteA);
    }

    disableMuteA() {
        AYM_Utils.disableElement(this.aymMuteA);
    }

    enableMuteB() {
        AYM_Utils.enableElement(this.aymMuteB);
    }

    disableMuteB() {
        AYM_Utils.disableElement(this.aymMuteB);
    }

    enableMuteC() {
        AYM_Utils.enableElement(this.aymMuteC);
    }

    disableMuteC() {
        AYM_Utils.disableElement(this.aymMuteC);
    }

    enableOnlyA() {
        AYM_Utils.enableElement(this.aymOnlyA);
    }

    disableOnlyA() {
        AYM_Utils.disableElement(this.aymOnlyA);
    }

    enableOnlyB() {
        AYM_Utils.enableElement(this.aymOnlyB);
    }

    disableOnlyB() {
        AYM_Utils.disableElement(this.aymOnlyB);
    }

    enableOnlyC() {
        AYM_Utils.enableElement(this.aymOnlyC);
    }

    disableOnlyC() {
        AYM_Utils.disableElement(this.aymOnlyC);
    }

    enablePower() {
        AYM_Utils.enableElement(this.aymPower);
    }

    disablePower() {
        AYM_Utils.disableElement(this.aymPower);
    }

    enableReset() {
        AYM_Utils.enableElement(this.aymReset);
    }

    disableReset() {
        AYM_Utils.disableElement(this.aymReset);
    }

    enablePause() {
        AYM_Utils.enableElement(this.aymPause);
    }

    disablePause() {
        AYM_Utils.disableElement(this.aymPause);
    }

    enableAnalyse() {
        AYM_Utils.checkElement(this.aymAnalyse);
        AYM_Utils.enableElement(this.aymAnalyse);
    }

    disableAnalyse() {
        AYM_Utils.uncheckElement(this.aymAnalyse);
        AYM_Utils.disableElement(this.aymAnalyse);
    }

    startAnalyse() {
        this.controller.startAnalyse();
    }


    enableCanvas() {
        AYM_Utils.enableElement(this.aymCanvas);
        AYM_Utils.enableElement(this.aymCanvasCh0);
        AYM_Utils.enableElement(this.aymCanvasCh1);
        AYM_Utils.enableElement(this.aymCanvasCh2);
        AYM_Utils.enableElement(this.aymTimeCanvas);
        AYM_Utils.enableElement(this.aymTimeCanvasCh0);
        AYM_Utils.enableElement(this.aymTimeCanvasCh1);
        AYM_Utils.enableElement(this.aymTimeCanvasCh2);
    }

    disableCanvas() {
        AYM_Utils.disableElement(this.aymCanvas);
        AYM_Utils.disableElement(this.aymCanvasCh0);
        AYM_Utils.disableElement(this.aymCanvasCh1);
        AYM_Utils.disableElement(this.aymCanvasCh2);
        AYM_Utils.disableElement(this.aymTimeCanvas);
        AYM_Utils.disableElement(this.aymTimeCanvasCh0);
        AYM_Utils.disableElement(this.aymTimeCanvasCh1);
        AYM_Utils.disableElement(this.aymTimeCanvasCh2);
    }

    setPlayingFile(){
        this.disableFilePlay();
        this.enableFileStop();
    }

    setStoppedFile(){
        this.disableFileStop();
        this.enableFilePlay();
    }


    setChanged() {
        /* do nothing */
    }

    setUnchanged() {
        /* do nothing */
    }

    setMutedA() {
        if(this.aymMuteA != null) {
            this.aymMuteA.className = 'is-toggled';
        }
    }

    setUnmutedA() {
        if(this.aymMuteA != null) {
            this.aymMuteA.className = '';
        }
    }

    setMutedB() {
        if(this.aymMuteB != null) {
            this.aymMuteB.className = 'is-toggled';
        }
    }

    setUnmutedB() {
        if(this.aymMuteB != null) {
            this.aymMuteB.className = '';
        }
    }

    setMutedC() {
        if(this.aymMuteC != null) {
            this.aymMuteC.className = 'is-toggled';
        }
    }

    setUnmutedC() {
        if(this.aymMuteC != null) {
            this.aymMuteC.className = '';
        }
    }

    setOnlyA() {
        if(this.aymOnlyA != null) {
            this.aymOnlyA.className = 'is-toggled';
        }
    }

    unSetOnlyA() {
        if(this.aymOnlyA != null) {
            this.aymOnlyA.className = '';
        }
    }

    setOnlyB() {
        if(this.aymOnlyB != null) {
            this.aymOnlyB.className = 'is-toggled';
        }
    }

    unSetOnlyB() {
        if(this.aymOnlyB != null) {
            this.aymOnlyB.className = '';
        }
    }

    setOnlyC() {
        if(this.aymOnlyC != null) {
            this.aymOnlyC.className = 'is-toggled';
        }
    }

    unSetOnlyC() {
        if(this.aymOnlyC != null) {
            this.aymOnlyC.className = '';
        }
    }

    setPaused() {
        if(this.aymPause != null) {
            this.aymPause.className = 'is-toggled';
        }
        if(this.aymChip0 != null) {
            this.aymChip0.className = 'is-toggled';
        }
    }

    setResumed() {
        if(this.aymPause != null) {
            this.aymPause.className = '';
        }
        if(this.aymChip0 != null) {
            this.aymChip0.className = '';
        }
    }

    setStatusDisplay(message) {
        AYM_Utils.setInnerText(this.aymStatusDisplay, message);
    }

    setSeekValue(seek) {
        const min = 0;
        const max = 1000;
        const val = ((seek * 1000.0) | 0);

        AYM_Utils.setValue(this.aymSeek, AYM_Utils.clamp_int(val, min, max));
    }

    getSeekValue() {
        const min = 0;
        const max = 1000;
        const val = (this.aymSeek != null ? (this.aymSeek.value | 0) : 0);

        return AYM_Utils.clamp_int(val, min, max) / +max;
    }

    getGainValue() {
        const min = 0;
        const max = 1000;
        const val = (this.aymGain != null ? (this.aymGain.value | 0) : 0);

        return AYM_Utils.clamp_int(val, min, max) / +max;
    }

    //////////////////////////////////////////////////////////////////////
    // ADD GAM
    getSelectedTrackIndex() {
        if (this.aymSelector != null) {
            return parseInt(this.aymSelector.value, 10);
        }
        return 0; // Por defecto la primera pista si no se ha bindeado
    }

    //////////////////////////////////////////////////////////////////////
    // ADD GAM
    populateSelector(trackList) {
        if (this.aymSelector != null) {
            // Limpiamos opciones previas estáticas
            this.aymSelector.innerHTML = '';
            
            // Poblamos dinámicamente recorriendo el arreglo enviado desde el hilo de audio
            trackList.forEach((trackName, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.text = trackName; // Muestra el nombre/autor de la canción
                this.aymSelector.appendChild(option);
            });
        }
    }

    renderFFT() {
        const analyser  = this.controller.model.waAnalyser;
        const analyserCh0  = this.controller.model.waAnalyserCh0;
        const analyserCh1  = this.controller.model.waAnalyserCh1;
        const analyserCh2  = this.controller.model.waAnalyserCh2;
        const canvas    = this.aymCanvas;
        const context   = this.aymContext;
        const canvasCh0 = this.aymCanvasCh0;
        const contextCh0 = this.aymContextCh0;
        const canvasCh1 = this.aymCanvasCh1;
        const contextCh1 = this.aymContextCh1;
        const canvasCh2 = this.aymCanvasCh2;
        const contextCh2 = this.aymContextCh2;

        const canvasTime = this.aymTimeCanvas;
        const contextTime = this.aymTimeContext;
        const canvasTimeCh0 = this.aymTimeCanvasCh0;
        const contextTimeCh0 = this.aymTimeContextCh0;
        const canvasTimeCh1 = this.aymTimeCanvasCh1;
        const contextTimeCh1 = this.aymTimeContextCh1;
        const canvasTimeCh2 = this.aymTimeCanvasCh2;
        const contextTimeCh2 = this.aymTimeContextCh2;



        const backcolor = '#e0e0e0';
        const linecolor = '#ff4444';
        const barcolor  = '#ff5555';

        const waveLineWidth = 1;

        const fftEnabled = () => {
            if(this.aymAnalyse != null) {
                return this.aymAnalyse.checked;
            }
            return false;
        }

        const canRender = () => {
            if((analyser != null) && (canvas != null) && (context != null) && (this.fftData == null)) {
                return true;
            }
            return false;
        }

        const fftRender = () => {
            const canvas_w = canvas.width;
            const canvas_h = canvas.height;

            if(fftEnabled() && (this.fftData != null)) {
                analyser.getByteFrequencyData(this.fftData);
                
                context.fillStyle = backcolor;
                context.fillRect(0, 0, canvas_w, canvas_h);
                context.fillStyle = barcolor;
                const count = this.fftData.length;
                const bar_w = (canvas_w / count);
                for(let index = 0; index < count; index++) {
                    const value = this.fftData[index];
                    const bar_h = ((value * canvas_h) / 255);
                    const bar_x = (index * bar_w);
                    const bar_y = ((canvas_h - bar_h) / 2);
                    context.fillRect(bar_x, bar_y, bar_w, bar_h);
                }
                context.fillStyle = linecolor;
                context.fillRect(0, (canvas_h / 2) - 1, canvas_w, 1);
                requestAnimationFrame(fftRender);
            }
            else {
                context.clearRect(0, 0, canvas_w, canvas_h);
                this.fftData = null;
            }
        };
        
        const fftRenderChannel0 = () => {
            const canvas_w = canvasCh0.width;
            const canvas_h = canvasCh0.height;

            if(fftEnabled() && (this.fftData != null)) {
                //analyser.getByteFrequencyData(this.fftData);
                analyserCh0.getByteFrequencyData(this.fftData)

                contextCh0.fillStyle = backcolor;
                contextCh0.fillRect(0, 0, canvas_w, canvas_h);
                contextCh0.fillStyle = barcolor;
                const count = this.fftData.length;
                const bar_w = (canvas_w / count);
                for(let index = 0; index < count; index++) {
                    const value = this.fftData[index];
                    const bar_h = ((value * canvas_h) / 255);
                    const bar_x = (index * bar_w);
                    const bar_y = ((canvas_h - bar_h) / 2);
                    contextCh0.fillRect(bar_x, bar_y, bar_w, bar_h);
                }
                contextCh0.fillStyle = linecolor;
                contextCh0.fillRect(0, (canvas_h / 2) - 1, canvas_w, 1);
                //requestAnimationFrame(() => fftRenderChannel(channel));
                requestAnimationFrame(fftRenderChannel0);
                
            }
            else {
                contextCh0.clearRect(0, 0, canvas_w, canvas_h);
                this.fftData = null;
            }
        };

        const fftRenderChannel1 = () => {
            const canvas_w = canvasCh1.width;
            const canvas_h = canvasCh1.height;

            if(fftEnabled() && (this.fftData != null)) {
                //analyser.getByteFrequencyData(this.fftData);
                analyserCh1.getByteFrequencyData(this.fftData)

                contextCh1.fillStyle = backcolor;
                contextCh1.fillRect(0, 0, canvas_w, canvas_h);
                contextCh1.fillStyle = barcolor;
                const count = this.fftData.length;
                const bar_w = (canvas_w / count);
                for(let index = 0; index < count; index++) {
                    const value = this.fftData[index];
                    const bar_h = ((value * canvas_h) / 255);
                    const bar_x = (index * bar_w);
                    const bar_y = ((canvas_h - bar_h) / 2);
                    contextCh1.fillRect(bar_x, bar_y, bar_w, bar_h);
                }
                contextCh1.fillStyle = linecolor;
                contextCh1.fillRect(0, (canvas_h / 2) - 1, canvas_w, 1);
                //requestAnimationFrame(() => fftRenderChannel(channel));
                requestAnimationFrame(fftRenderChannel1);
                
            }
            else {
                contextCh1.clearRect(0, 0, canvas_w, canvas_h);
                this.fftData = null;
            }
        };

        const fftRenderChannel2 = () => {
            const canvas_w = canvasCh2.width;
            const canvas_h = canvasCh2.height;

            if(fftEnabled() && (this.fftData != null)) {
                //analyser.getByteFrequencyData(this.fftData);
                analyserCh2.getByteFrequencyData(this.fftData)

                contextCh2.fillStyle = backcolor;
                contextCh2.fillRect(0, 0, canvas_w, canvas_h);
                contextCh2.fillStyle = barcolor;
                const count = this.fftData.length;
                const bar_w = (canvas_w / count);
                for(let index = 0; index < count; index++) {
                    const value = this.fftData[index];
                    const bar_h = ((value * canvas_h) / 255);
                    const bar_x = (index * bar_w);
                    const bar_y = ((canvas_h - bar_h) / 2);
                    contextCh2.fillRect(bar_x, bar_y, bar_w, bar_h);
                }
                contextCh2.fillStyle = linecolor;
                contextCh2.fillRect(0, (canvas_h / 2) - 1, canvas_w, 1);
                //requestAnimationFrame(() => fftRenderChannel(channel));
                requestAnimationFrame(fftRenderChannel2);
                
            }
            else {
                contextCh2.clearRect(0, 0, canvas_w, canvas_h);
                this.fftData = null;
            }
        };


        const TimeRender = () => {
            const currCanvas = canvasTime;
            const currContext = contextTime;
            const currAnalyser = analyser;
            const zoomY = 1.5;

            const canvas_w = currCanvas.width;
            const canvas_h = currCanvas.height;

            if(fftEnabled() && (this.fftData != null)) {
                // 1. Capturar el dominio del tiempo en vez de frecuencias
                currAnalyser.getByteTimeDomainData(this.fftData);
                
                // Limpiar el fondo
                currContext.fillStyle = backcolor;
                currContext.fillRect(0, 0, canvas_w, canvas_h);
                
                // 2. ALGORITMO DE ESTABILIZACIÓN (TRIGGER)
                // Buscar un punto de partida bueno (donde el sonido cruza el umbral central)
                const totalSamples = this.fftData.length;
                let triggerIndex = 0;
                const threshold = 128; // 128 es el silencio/centro exacto en Byte Time Domain Data

                for (let i = 0; i < totalSamples / 2; i++) {
                    // Buscar cuando la onda viene desde abajo (menor a 128) 
                    // y cruza inmediatamente hacia arriba (mayor o igual a 128)
                    if (this.fftData[i] < threshold && this.fftData[i + 1] >= threshold) {
                        triggerIndex = i; // punto de estabilidad
                        break;            // terminar elciclo para empezar a dibujar desde aquí
                    }
                }

                // 3. CONFIGURAR EL DIBUJO DE LA ONDA
                currContext.lineWidth = waveLineWidth;          
                currContext.strokeStyle = barcolor; 
                currContext.beginPath();            
                
                // Se dibuja sólo la mitad de las muestras o un bloque fijo a partir del triggerIndex
                // para asegurar de que la pantalla no se quede sin muestras al desfasarse el inicio
                const drawLength = totalSamples / 2; 
                const slice_w = (canvas_w / drawLength); 
                let x = 0;

                for(let index = 0; index < drawLength; index++) {
                    // Leer los datos desfasados por el triggerIndex estabilizado
                    const value = this.fftData[triggerIndex + index];
                    
                    // ===============================================
                    // 1. Centrar el valor: restar 128 para que el rango sea [-128, 127]
                    // 2. Aplicar  zoom
                    // 3. Sumar el centro para obtener la nueva posición
                    // ===============================================
                    const centeredValue = (value - 128) * zoomY + 128;

                    // Calcular la posición Y normalizada
                    const y = (centeredValue * canvas_h) / 255;

                    if (index === 0) {
                        currContext.moveTo(x, y); 
                    } else {
                        currContext.lineTo(x, y); 
                    }

                    x += slice_w; 
                }

                currContext.stroke(); 
                
                // Línea central de referencia fija
                currContext.fillStyle = linecolor;
                currContext.fillRect(0, (canvas_h / 2) - 1, canvas_w, 1);
                
                requestAnimationFrame(TimeRender);
            }
            else {
                currContext.clearRect(0, 0, canvas_w, canvas_h);
                this.fftData = null;
            }
        };

        const TimeRenderCh0 = () => {
            const currCanvas = canvasTimeCh0;
            const currContext = contextTimeCh0;
            const currAnalyser = analyserCh0;
            const zoomY = 1.0;

            const canvas_w = currCanvas.width;
            const canvas_h = currCanvas.height;

            if(fftEnabled() && (this.fftData != null)) {
                // 1. Capturar el dominio del tiempo en vez de frecuencias
                currAnalyser.getByteTimeDomainData(this.fftData);
                
                // Limpiar el fondo
                currContext.fillStyle = backcolor;
                currContext.fillRect(0, 0, canvas_w, canvas_h);
                
                // 2. ALGORITMO DE ESTABILIZACIÓN (TRIGGER)
                // Buscar un punto de partida bueno (donde el sonido cruza el umbral central)
                const totalSamples = this.fftData.length;
                let triggerIndex = 0;
                const threshold = 128; // 128 es el silencio/centro exacto en Byte Time Domain Data

                for (let i = 0; i < totalSamples / 2; i++) {
                    // Buscar cuando la onda viene desde abajo (menor a 128) 
                    // y cruza inmediatamente hacia arriba (mayor o igual a 128)
                    if (this.fftData[i] < threshold && this.fftData[i + 1] >= threshold) {
                        triggerIndex = i; // punto de estabilidad
                        break;            // terminar elciclo para empezar a dibujar desde aquí
                    }
                }

                // 3. CONFIGURAR EL DIBUJO DE LA ONDA
                currContext.lineWidth = waveLineWidth;          
                currContext.strokeStyle = barcolor; 
                currContext.beginPath();            
                
                // Se dibuja sólo la mitad de las muestras o un bloque fijo a partir del triggerIndex
                // para asegurar de que la pantalla no se quede sin muestras al desfasarse el inicio
                const drawLength = totalSamples / 2; 
                const slice_w = (canvas_w / drawLength); 
                let x = 0;

                for(let index = 0; index < drawLength; index++) {
                    // Leer los datos desfasados por el triggerIndex estabilizado
                    const value = this.fftData[triggerIndex + index];
                    
                    // ===============================================
                    // 1. Centrar el valor: restar 128 para que el rango sea [-128, 127]
                    // 2. Aplicar  zoom
                    // 3. Sumar el centro para obtener la nueva posición
                    // ===============================================
                    const centeredValue = (value - 128) * zoomY + 128;

                    // Calcular la posición Y normalizada
                    const y = (centeredValue * canvas_h) / 255;

                    if (index === 0) {
                        currContext.moveTo(x, y); 
                    } else {
                        currContext.lineTo(x, y); 
                    }

                    x += slice_w; 
                }

                currContext.stroke(); 
                
                // Línea central de referencia fija
                currContext.fillStyle = linecolor;
                currContext.fillRect(0, (canvas_h / 2) - 1, canvas_w, 1);
                
                requestAnimationFrame(TimeRenderCh0);
            }
            else {
                currContext.clearRect(0, 0, canvas_w, canvas_h);
                this.fftData = null;
            }
        };

        const TimeRenderCh1 = () => {
            const currCanvas = canvasTimeCh1;
            const currContext = contextTimeCh1;
            const currAnalyser = analyserCh1;
            const zoomY = 1.0;

            const canvas_w = currCanvas.width;
            const canvas_h = currCanvas.height;

            if(fftEnabled() && (this.fftData != null)) {
                // 1. Capturar el dominio del tiempo en vez de frecuencias
                currAnalyser.getByteTimeDomainData(this.fftData);
                
                // Limpiar el fondo
                currContext.fillStyle = backcolor;
                currContext.fillRect(0, 0, canvas_w, canvas_h);
                
                // 2. ALGORITMO DE ESTABILIZACIÓN (TRIGGER)
                // Buscar un punto de partida bueno (donde el sonido cruza el umbral central)
                const totalSamples = this.fftData.length;
                let triggerIndex = 0;
                const threshold = 128; // 128 es el silencio/centro exacto en Byte Time Domain Data

                for (let i = 0; i < totalSamples / 2; i++) {
                    // Buscar cuando la onda viene desde abajo (menor a 128) 
                    // y cruza inmediatamente hacia arriba (mayor o igual a 128)
                    if (this.fftData[i] < threshold && this.fftData[i + 1] >= threshold) {
                        triggerIndex = i; // punto de estabilidad
                        break;            // terminar elciclo para empezar a dibujar desde aquí
                    }
                }

                // 3. CONFIGURAR EL DIBUJO DE LA ONDA
                currContext.lineWidth = waveLineWidth;          
                currContext.strokeStyle = barcolor; 
                currContext.beginPath();            
                
                // Se dibuja sólo la mitad de las muestras o un bloque fijo a partir del triggerIndex
                // para asegurar de que la pantalla no se quede sin muestras al desfasarse el inicio
                const drawLength = totalSamples / 2; 
                const slice_w = (canvas_w / drawLength); 
                let x = 0;

                for(let index = 0; index < drawLength; index++) {
                    // Leer los datos desfasados por el triggerIndex estabilizado
                    const value = this.fftData[triggerIndex + index];
                    
                    // ===============================================
                    // 1. Centrar el valor: restar 128 para que el rango sea [-128, 127]
                    // 2. Aplicar  zoom
                    // 3. Sumar el centro para obtener la nueva posición
                    // ===============================================
                    const centeredValue = (value - 128) * zoomY + 128;

                    // Calcular la posición Y normalizada
                    const y = (centeredValue * canvas_h) / 255;

                    if (index === 0) {
                        currContext.moveTo(x, y); 
                    } else {
                        currContext.lineTo(x, y); 
                    }

                    x += slice_w; 
                }

                currContext.stroke(); 
                
                // Línea central de referencia fija
                currContext.fillStyle = linecolor;
                currContext.fillRect(0, (canvas_h / 2) - 1, canvas_w, 1);
                
                requestAnimationFrame(TimeRenderCh1);
            }
            else {
                currContext.clearRect(0, 0, canvas_w, canvas_h);
                this.fftData = null;
            }
        };

        const TimeRenderCh2 = () => {
            const currCanvas = canvasTimeCh2;
            const currContext = contextTimeCh2;
            const currAnalyser = analyserCh2;
            const zoomY = 1.0;

            const canvas_w = currCanvas.width;
            const canvas_h = currCanvas.height;

            if(fftEnabled() && (this.fftData != null)) {
                // 1. Capturar el dominio del tiempo en vez de frecuencias
                currAnalyser.getByteTimeDomainData(this.fftData);
                
                // Limpiar el fondo
                currContext.fillStyle = backcolor;
                currContext.fillRect(0, 0, canvas_w, canvas_h);
                
                // 2. ALGORITMO DE ESTABILIZACIÓN (TRIGGER)
                // Buscar un punto de partida bueno (donde el sonido cruza el umbral central)
                const totalSamples = this.fftData.length;
                let triggerIndex = 0;
                const threshold = 128; // 128 es el silencio/centro exacto en Byte Time Domain Data

                for (let i = 0; i < totalSamples / 2; i++) {
                    // Buscar cuando la onda viene desde abajo (menor a 128) 
                    // y cruza inmediatamente hacia arriba (mayor o igual a 128)
                    if (this.fftData[i] < threshold && this.fftData[i + 1] >= threshold) {
                        triggerIndex = i; // punto de estabilidad
                        break;            // terminar elciclo para empezar a dibujar desde aquí
                    }
                }

                // 3. CONFIGURAR EL DIBUJO DE LA ONDA
                currContext.lineWidth = waveLineWidth;          
                currContext.strokeStyle = barcolor; 
                currContext.beginPath();            
                
                // Se dibuja sólo la mitad de las muestras o un bloque fijo a partir del triggerIndex
                // para asegurar de que la pantalla no se quede sin muestras al desfasarse el inicio
                const drawLength = totalSamples / 2; 
                const slice_w = (canvas_w / drawLength); 
                let x = 0;

                for(let index = 0; index < drawLength; index++) {
                    // Leer los datos desfasados por el triggerIndex estabilizado
                    const value = this.fftData[triggerIndex + index];
                    
                    // ===============================================
                    // 1. Centrar el valor: restar 128 para que el rango sea [-128, 127]
                    // 2. Aplicar  zoom
                    // 3. Sumar el centro para obtener la nueva posición
                    // ===============================================
                    const centeredValue = (value - 128) * zoomY + 128;

                    // Calcular la posición Y normalizada
                    const y = (centeredValue * canvas_h) / 255;

                    if (index === 0) {
                        currContext.moveTo(x, y); 
                    } else {
                        currContext.lineTo(x, y); 
                    }

                    x += slice_w; 
                }

                currContext.stroke(); 
                
                // Línea central de referencia fija
                currContext.fillStyle = linecolor;
                currContext.fillRect(0, (canvas_h / 2) - 1, canvas_w, 1);
                
                requestAnimationFrame(TimeRenderCh2);
            }
            else {
                currContext.clearRect(0, 0, canvas_w, canvas_h);
                this.fftData = null;
            }
        };

        if(fftEnabled() && canRender()) {
            this.fftData = new Uint8Array(analyser.frequencyBinCount);
            //this.fftData = analyser.getByteFrequencyData(new Uint8Array(analyser.frequencyBinCount));
            //this.fftDataCh0 = new Uint8Array(analyserCh0.frequencyBinCount);
            //this.fftDataCh1 = new Uint8Array(analyserCh1.frequencyBinCount);
            //this.fftDataCh2 = new Uint8Array(analyserCh2.frequencyBinCount);


            requestAnimationFrame(fftRender);
            requestAnimationFrame(fftRenderChannel0);
            requestAnimationFrame(fftRenderChannel1);
            requestAnimationFrame(fftRenderChannel2);

            requestAnimationFrame(TimeRender);            
            requestAnimationFrame(TimeRenderCh0);
            requestAnimationFrame(TimeRenderCh1);
            requestAnimationFrame(TimeRenderCh2);
        
        }
    }
}

// ---------------------------------------------------------------------------
// End-Of-File
// ---------------------------------------------------------------------------
