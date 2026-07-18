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
import { ChiptuneFile } from '/ChiptuneFile.js';
// ---------------------------------------------------------------------------
// AYM_Player
// ---------------------------------------------------------------------------

export class AYM_Player {
    constructor() {
        this.model = new AYM_PlayerModel(this);
        this.view  = new AYM_PlayerView(this);
        this.audioSource = 'internal';
        this.externalMusic = null; // Add GAM
    }


    async onLoadWindow() {
        this.view.bind();
        //this.onClickPower();
        //this.loadDynamicTracks();
        this.loadFromStaticJson();
        //this.view.bindHyperlinks();
    }

    async loadDynamicTracks() {
        // Tu lista de canciones que puede venir de un fetch() al servidor
        const playlistData = [
            { name: "Axel Folley", url: "/ym-data/axel_folley.ym" },
            { name: "Bach to the Future", url: "/ym-data/bach_the_future.ym" },
            { name: "Robocop Theme", url: "/ym-data/robocop.ym" },
            { name: "Enola Gay", url:"/ym-data/omd-enola_gay.ym"}
        ];

        // Le pedimos a la vista que los renderice y les asocie los listeners
        this.view.populateTracksContainer(playlistData);
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
        if(this.externalMusic != null){
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

    async recvFileData(data) {
        // Add GAM
        let status = data.title + "\n" + data.duration + "s";
        this.view.setStatusDisplay(status);
    }

    async recvSeek(seek) {
        this.view.setSeekValue(seek);
    }

    async recvPlayingFile(){
        this.view.setPlayingFile();
    }

    async recvStopped() {
        this.view.setStopped();
    }

    async recvStoppedFile(){
        this.view.setStoppedFile();
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

    // chiptuneFile debe estar disponible globalmente o impórtalo si lo modularizaste.
    /////////////////////////////////////////////////////////////////////
    // Add GAM
    async onFileSelected(file) {
        try {
            //this.view.setFileDisplay("Cargando y descompimiendo...");
            this.view.setStatusDisplay("Cargando y descompimiendo...");
            
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

                    // 4. Construir la estructura estructurada estándar que el procesador entiende
                    this.externalMusic = {
                        title: file.name.replace('.ym', ''),
                        type: 'YM',
                        frames: nFrames,
                        duration: nFrames * 0.02,
                        interleaved: interleaved[0] === 1,
                        // Pasamos la estructura plana de datos binarios decodificados
                        songData: songData 
                    };

                    // Cambiamos el origen antes de enviar al modelo
                    this.audioSource = 'external';
                    //this.view.enablePlay();

                    // 5. Enviar al modelo para su inyección al AudioWorklet
                    this.model.sendExternalTrack(this.externalMusic);
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
        try {
            this.view.setStatusDisplay(`Cargando: ${songName}...`);
            
            // 1. Descargamos los bytes puros del archivo .ym desde el servidor de producción
            const response = await fetch(fileUrl);
            if (!response.ok) throw new Error("No se pudo obtener el archivo desde el enlace.");
            
            const blob = await response.blob();
            
            // 2. Extraemos el nombre del archivo real a partir de la URL
            const filename = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
            
            // 3. TRUCO CLAVE: Creamos un objeto File real en memoria idéntico al del input file
            const mockFile = new File([blob], filename, { type: "application/octet-stream" });
            
            // 4. Invocamos de forma idéntica a tu pipeline original pasándole nuestro archivo ficticio
            await this.onFileSelected(mockFile);
            
            //this.view.setStatusDisplay(`Remoto: ${songName}`);
        } catch (error) {
            this.view.setStatusDisplay("Error al reproducir el enlace");
            console.error(error);
        }
    }

    async onUrlFileSelected(urlFile){
        let parsedUrl;
        let pathname;
        let filename;

        let urlOK = false;
        try {
            parsedUrl = new URL(urlFile);
            urlOK = true;
        }
        catch (error) {
            this.view.setStatusDisplay("URL not valid");
            
        }

        if(urlOK){
            pathname = parsedUrl.pathname;
            filename = pathname.substring(pathname.lastIndexOf('/') + 1);
            console.log("filename: " + filename);
            this.onHyperlinkFileSelected(urlFile, filename);
        }
    }

}

// ---------------------------------------------------------------------------
// End-Of-File
// ---------------------------------------------------------------------------
