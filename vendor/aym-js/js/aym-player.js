/*
 * aym-player.js - Copyright (c) 2001-2026 - Olivier Poncet
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

import { AYM_PlayerModel } from './aym-player-model.js';
import { AYM_PlayerView  } from './aym-player-view.js';
import { AYM_SerialAdapter } from './aym-serial-adapter.js';
//import { AYM_HardwarePresets } from './aym-hw-presets.js';
import { AYM_HardwarePresetManager } from './aym-hw-presets.js';
import { ChiptuneFile } from '/ChiptuneFile.js';
// ---------------------------------------------------------------------------
// AYM_Player
// ---------------------------------------------------------------------------

export class AYM_Player {
    constructor() {
        this.model = new AYM_PlayerModel(this);
        this.view  = new AYM_PlayerView(this);
        this.serialAdapter = new AYM_SerialAdapter();
        this.audioSource = 'internal';
        this.externalMusic = null; // Add GAM
        this.mockFile = null;

        this.presetManager = new AYM_HardwarePresetManager(this.serialAdapter, this.view);
    }

    // Handler ejecutado al hacer clic en el botón de conexión serial
    async onClickSerialConnect() {
        try {
            if (!this.serialAdapter.isConnected) {
                this.view.setSerialStatus("Conectando...", false);
                await this.serialAdapter.connect();
                this.view.setSerialStatus("Serial: Conectado (115200)", true);
            } else {
                await this.serialAdapter.disconnect();
                this.view.setSerialStatus("Serial: Desconectado", false);
            }
        } catch (err) {
            console.error("Error en conexión Web Serial:", err);
            this.view.setSerialStatus(`Serial: ${err.message}`, false);
        }
    }

    // Al apagar el emulador, desconectar el puerto si está abierto
    async onClickPower() {
        if(this.model.isNotPowered()) { //[cite: 20]
            await this.model.powerOn(); //[cite: 20]
            await this.view.powerOn(); //[cite: 20]
            this.model.sendRequestTrackList(); //[cite: 20]
        }
        else {
            if (this.serialAdapter && this.serialAdapter.isConnected) {
                await this.serialAdapter.disconnect();
                this.view.setSerialStatus("Serial: Desconectado", false);
            }
            await this.view.powerOff(); //[cite: 20]
            await this.model.powerOff(); //[cite: 20]
        }
    }

    


    async onLoadWindow() {
        this.view.bind();
        //this.onClickPower();
        this.loadFromStaticJson();
        this.view.resetFrameDisplay();
    }

    async loadFromStaticJson() {
        try {
            // Solicitamos el archivo JSON estático que vive en la misma carpeta de música[cite: 2]
            const response = await fetch('/ym-data/tracks.json'); 
            const files = await response.json();

            const tracks = files.map(filename => {
                const cleanName = filename
                    .replace('.ym', '')
                    //.replace(/_/g, ' ')
                    //.replace(/-/g, ' - ')
                    ;

                return {
                    name: cleanName,
                    url: `/ym-data/${filename}` 
                };
            });

            this.view.populateTracksContainer(tracks); 
        } catch (error) {
            console.error("No se pudo cargar el índice tracks.json", error);
        }
    }


    async onClickFilePlay(){
        //if(this.externalMusic != null){
        //    this.model.sendExternalTrack(this.externalMusic);
        //}
        if(this.mockFile != null){
             this.onFileSelected(this.mockFile);
             this.model.sendExternalTrack(this.externalMusic);
        }
        
    }

    async onClickStop() {
        this.model.sendStop();
    }

    async onClickFileStop(){
        this.model.sendStopFile();
    }


    async onClickPrev() {
        this.audioSource = 'internal';
        this.model.sendPrev();
    }

    async onClickNext() {
        this.audioSource = 'internal';
        this.model.sendNext();
    }

    async onInputSeek() {
        const seek = this.view.getSeekValue();
        this.model.sendSeek(seek);
    }

    async onInputGain() {
        const gain = this.view.getGainValue();
        this.model.setGain(gain);
    }

    async onClickChip0() {
        /* do nothing */
    }

    async onClickMuteA() {
        this.model.sendMuteA();
    }

    async onClickMuteB() {
        this.model.sendMuteB();
    }

    async onClickMuteC() {
        this.model.sendMuteC();
    }

    async onClickOnlyA() {
        this.model.sendOnlyA();
    }

    async onClickOnlyB() {
        this.model.sendOnlyB();
    }

    async onClickOnlyC() {
        this.model.sendOnlyC();
    }

    async onClickPower() {
        if(this.model.isNotPowered()) {
            await this.model.powerOn();
            await this.view.powerOn();
            // Solicitamos la lista de canciones dinámicamente al iniciar
            this.model.sendRequestTrackList();
        }
        else {
            await this.view.powerOff();
            await this.model.powerOff();
        }
    }

    async onClickReset() {
        this.model.sendReset();
    }

    async onClickPause() {
        this.model.sendPause();
    }

    async onClickAnalyse() {
        this.view.renderFFT();
    }

    async startAnalyse() {
        this.onClickAnalyse();
    }

    async recvTitle(data) {
        //this.view.setDisplay(title);
        // Add GAM
        // data ahora contiene { title, track_index }
        //this.view.setDisplay(data.title);
        this.view.setStatusDisplay(data.title);
        this.view.setSelectedTrackIndex(data.track_index); // <-- Sincroniza el select de la UI
    }

    async recvTitleFile(data) {
        // Add GAM
        // data ahora contiene { title, track_index }
        //this.view.setFileDisplay(data.title);
        this.view.setStatusDisplay(data.title);
    }

    async recvSeek(seek) {
        this.view.setSeekValue(seek);
    }

    //async recvFrame(nFrame) { 
    //    this.view.updateCurrentFrame(nFrame);
    //}

    async recvPlaying() {
        this.view.setPlaying();
    }

    async recvPlayingFile(){
        this.view.setPlayingFile();
    }

    async recvStopped() {
        this.view.setStopped();
        //this.view.highlightFrame(0); //para volver al inicio
    }

    async recvStoppedFile(){
        this.view.setStoppedFile();
        //this.view.highlightFrame(0); //para volver al inicio
        if (this.serialAdapter.isConnected && this.externalMusic && this.externalMusic.songData) {
            this.playHardwarePreset('muteAll');
        }
    }


    async recvChanged() {
        this.view.setChanged();
    }

    async recvUnchanged() {
        this.view.setUnchanged();
    }

    async recvPaused() {
        this.view.setPaused();
    }

    async recvResumed() {
        this.view.setResumed();
    }

    async recvMutedA() {
        this.view.setMutedA();
    }

    async recvUnmutedA() {
        this.view.setUnmutedA();
    }

    async recvMutedB() {
        this.view.setMutedB();
    }

    async recvUnmutedB() {
        this.view.setUnmutedB();
    }

    async recvMutedC() {
        this.view.setMutedC();
    }

    async recvUnmutedC() {
        this.view.setUnmutedC();
    }

    async recvOnlyA_sel() {
        this.view.setOnlyA();
    }

    async recvOnlyA_unsel() {
        this.view.unSetOnlyA();
    }

    async recvOnlyB_sel() {
        this.view.setOnlyB();
    }

    async recvOnlyB_unsel() {
        this.view.unSetOnlyB();
    }

    async recvOnlyC_sel() {
        this.view.setOnlyC();
    }

    async recvOnlyC_unsel() {
        this.view.unSetOnlyC();
    }


    /////////////////////////////////////////////////////////////////////
    // Add GAM
    /*async onSelectTrack(index) {
        this.audioSource = 'internal';
        this.model.sendSelectTrack(index);
    }*/

    /////////////////////////////////////////////////////////////////////
    // Add GAM
    async recvTrackList(trackList) {
        this.view.populateSelector(trackList);
    }

    // chiptuneFile debe estar disponible globalmente o impórtalo si lo modularizaste.
    /////////////////////////////////////////////////////////////////////
    // Add GAM
    async onFileSelected(file) {
        try {
            this.mockFile = file;;
            //this.view.setFileDisplay("Cargando y descompimiendo...");
            this.view.setStatusDisplay("Cargando y descomprimiendo...");
            
            // 1. Asegurar que la librería JSLha / localModules esté lista
            if (typeof initLhaLibrary === "function") {
                await initLhaLibrary();
            }

            // 2. Leer el archivo local como ArrayBuffer
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const arrayBuffer = e.target.result;
                    
                    // 3. Decodificar usando la clase ChiptuneFile
                    //const chiptune = new ChiptuneFile(arrayBuffer);
                    const chiptune = new ChiptuneFile();
                    await chiptune.loadFile(file);
                    const [songData, nFrames, interleaved] = chiptune.getData();
                    
                    if(songData.length === 0 || nFrames === 0 || interleaved === null){
                        throw new Error("YM File corrupted");
                    }

                    const songName = file.name.replace('.ym', '');
                    // 4. Construir la estructura estructurada estándar que el procesador entiende
                    this.externalMusic = {
                        title: file.name.replace('.ym', ''),
                        type: 'YM',
                        frames: nFrames,
                        interleaved: interleaved[0] === 1,
                        // Pasamos la estructura plana de datos binarios decodificados
                        songData: songData 
                    };

                    // Cambiamos el origen antes de enviar al modelo
                    this.audioSource = 'external';
                    //this.view.enablePlay();

                    // 5. Se inyectan los registros decodificados en el visor visual
                    this.view.populateFramesContainer(songData, nFrames);

                    // 6. Enviar al modelo para su inyección al AudioWorklet
                    //this.model.sendExternalTrack(this.externalMusic);

                    this.view.setTotalFrames(nFrames);
                    this.view.setStatusDisplay(`${songName}...OK`);
                    //console.log("onFileSelected OK...");
                } catch (err) {
                    //this.view.setFileDisplay("Error de decodificación");
                    this.view.setStatusDisplay(err.message);
                    console.error(err);
                }
            };
            
            reader.readAsArrayBuffer(file);
        } catch (error) {
            //this.view.setFileDisplay("Error al abrir archivo");
            this.view.setStatusDisplay("Error de decodificación");
            console.error(error);
        }
    }

    //////////////////////////////////////////////////////////////
    // Add GAM
    async onHyperlinkFileSelected(fileUrl, songName) {
        if(this.mockFile != null){
            this.onClickFileStop();
        }
        
        try {
            this.view.setStatusDisplay(`Descargando: ${songName}...`);
            
            // 1. Descargamos los bytes puros del archivo .ym desde el servidor de producción
            const response = await fetch(fileUrl);
            if (!response.ok) throw new Error("No se pudo obtener el archivo desde el enlace.");
            
            const blob = await response.blob();
            
            // 2. Extraemos el nombre del archivo real a partir de la URL
            const filename = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
            
            // 3. objeto File real en memoria idéntico al del input file
            this.mockFile = new File([blob], filename, { type: "application/octet-stream" });
            
            // 4. Invocamos de forma idéntica a tu pipeline original pasándole nuestro archivo ficticio
            await this.onFileSelected(this.mockFile);
            this.view.setStatusDisplay(`${songName}...OK`);
            
            //this.view.setStatusDisplay(`Remoto: ${songName}`);
        } catch (error) {
            this.view.setStatusDisplay("Error al reproducir el enlace");
            console.error(error);
        }
    }

    /////////////////////////
    // Se llama al resaltado:
    /////////////////////////
    /*async recvFrame(nFrame) { 
        this.view.updateCurrentFrame(nFrame);
        this.view.highlightFrame(nFrame); // <--- NUEVO: Resalta el frame en la lista
    }*/

    // Cada vez que llega el frame desde el AudioWorklet:
    async recvFrame(nFrame) { 
        this.view.updateCurrentFrame(nFrame); 
        this.view.highlightFrame(nFrame); 

        // NUEVO: Transmisión Serial directa al hardware Arduino
        if (this.serialAdapter.isConnected && this.externalMusic && this.externalMusic.songData) {
            const startIdx = nFrame * 14;
            const currentFrameData = this.externalMusic.songData.slice(startIdx, startIdx + 14);
            
            // Envío no bloqueante
            this.serialAdapter.sendFrame(currentFrameData);
        }
    }

    async playHardwarePreset(presetKey, loop = false) {
        await this.presetManager.play(presetKey, loop);
    }

    async stopHardwarePreset() {
        await this.presetManager.stop(true);
    }

    /*
    async playHardwarePreset(presetKey, loop = false, refreshStatus = false) {
        if (!this.serialAdapter.isConnected) {
            this.view.setStatusDisplay("Error: Serial no conectado");
            return;
        }

        const preset = AYM_HardwarePresets[presetKey];
        if (!preset || !preset.songData || preset.songData.length === 0) {
            this.view.setStatusDisplay("Error: Preset inválido o vacío");
            return;
        }

        // Si ya hay un preset corriendo, lo detenemos primero
        this.stopHardwarePreset(false);

        const totalFrames = preset.nFrames;
        const intervalMs = Math.floor(1000 / (preset.framerate || 50)); // ~20 ms

        // Sincronizar visor gráfico de frames en la UI
        if(refreshStatus){
            this.view.populateFramesContainer(preset.songData, totalFrames);
            this.view.setTotalFrames(totalFrames);
            this.view.setStatusDisplay(`HW: ${preset.title} (${totalFrames} frames)`);
        }
        

        this.currentHwFrame = 0;
        this.isHwPlaying = true;

        this.hwPlaybackInterval = setInterval(async () => {
            if (!this.isHwPlaying || !this.serialAdapter.isConnected) {
                this.stopHardwarePreset();
                return;
            }

            // Fin de la secuencia de frames
            if (this.currentHwFrame >= totalFrames) {
                if (loop) {
                    this.currentHwFrame = 0; // Reiniciar en bucle
                } else {
                    this.stopHardwarePreset(true);
                    return;
                }
            }

            // Extraer el bloque de 14 bytes del frame actual
            const startIdx = this.currentHwFrame * 14;
            const frameBytes = preset.songData.slice(startIdx, startIdx + 14);

            // Transmisión directa hacia el puerto Serial
            await this.serialAdapter.sendFrame(frameBytes);

            // Actualización visual en pantalla (sin sonido en altavoces)
            this.view.updateCurrentFrame(this.currentHwFrame);
            this.view.highlightFrame(this.currentHwFrame);

            this.currentHwFrame++;
        }, intervalMs);
    }

    async stopHardwarePreset(sendMuteFrame = true, refreshStatus = false) {
        if (this.hwPlaybackInterval) {
            clearInterval(this.hwPlaybackInterval);
            this.hwPlaybackInterval = null;
        }

        this.isHwPlaying = false;

        // Enviar frame de silencio total al hardware para evitar notas pegadas
        if (sendMuteFrame && this.serialAdapter.isConnected) {
            const muteBytes = [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x3F, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
            await this.serialAdapter.sendFrame(muteBytes);
        }

        if(refreshStatus){
            this.view.setStatusDisplay("HW: Preset finalizado/detenido");
        }
        
    }*/

}

// ---------------------------------------------------------------------------
// End-Of-File
// ---------------------------------------------------------------------------
