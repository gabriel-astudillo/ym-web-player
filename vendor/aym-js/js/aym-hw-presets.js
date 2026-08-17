const YM_SILENT = new Uint8Array([
    0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00,
    0x00, 0x00]);

// assets/js/aym-hardware-presets.js

export const AYM_HardwarePresetsData = {
    // Ejemplo: Tono de prueba 440 Hz en Canal A
    presetA: {
        title: "HW Test 440Hz",
        nFrames: 50, // 1 segundo de duración a 50 Hz
        // Generamos 50 frames idénticos
        songData: new Array(50).fill([
            0xFD, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
            0x3E, // Mixer: Solo tono A habilitado
            0x0F, 0x00, 0x00, 0x00, 0x00, 0x00
        ]).flat()
    },

    muteAll: {
        title: "All Channels Mute",
        nFrames: 1,
        songData: [
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
            0x3F, // Mixer: R7=0x3F deshabilita tonos y ruidos
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00
        ]
    },


    // Efecto de explosión / ruido blanco (secuencia de frames)
    laserSfx: {
        title: "Laser SFX",
        nFrames: 4,
        songData: [
            // Frame 0: Tono agudo y volumen alto
            0x20, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x3E, 0x0F, 0x00, 0x00, 0x00, 0x00, 0x00,
            // Frame 1: Descenso de tono y decaimiento
            0x40, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x3E, 0x0B, 0x00, 0x00, 0x00, 0x00, 0x00,
            // Frame 2: Tono más grave
            0x80, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x3E, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00,
            // Frame 3: Silencio final
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x3F, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
        ]
    },

    // Ejemplo: Arpegio multi-frame rápido (6 frames de duración)
    arpeggioChA: {
        title: "Arpeggio Major Chord",
        framerate: 50,
        nFrames: 6,
        // Cada renglón contiene los 14 registros de hardware (R0..R13)
        songData: [
            // Frame 0: Nota C-4 (Periodo ~0x01EE), Tono A activo, Volumen 15
            0xEE, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x3E, 0x0F, 0x00, 0x00, 0x00, 0x00, 0x00,
            // Frame 1: Nota E-4 (Periodo ~0x0188)
            0x88, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x3E, 0x0F, 0x00, 0x00, 0x00, 0x00, 0x00,
            // Frame 2: Nota G-4 (Periodo ~0x014A)
            0x4A, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x3E, 0x0F, 0x00, 0x00, 0x00, 0x00, 0x00,
            // Frame 3: Nota C-5 (Periodo ~0x00F7)
            0xF7, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x3E, 0x0E, 0x00, 0x00, 0x00, 0x00, 0x00,
            // Frame 4: Decaimiento (Volumen 8)
            0xF7, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x3E, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00,
            // Frame 5: Silencio
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x3F, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
        ]
    },

    // Efecto de Explosión: Ruido blanco descendente con decaimiento de volumen
    sfxExplosion: {
        title: "SFX Explosion (Noise)",
        framerate: 50,
        nFrames: 6,
        songData: [
            // Frame 0: Ruido agudo (Periodo 4), solo ruido en Canal A, Volumen 15
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x04, 0x37, 0x0F, 0x00, 0x00, 0x00, 0x00, 0x00,
            // Frame 1: Ruido medio (Periodo 10), Volumen 13
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x0A, 0x37, 0x0D, 0x00, 0x00, 0x00, 0x00, 0x00,
            // Frame 2: Ruido grave (Periodo 18), Volumen 10
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x12, 0x37, 0x0A, 0x00, 0x00, 0x00, 0x00, 0x00,
            // Frame 3: Ruido muy grave (Periodo 26), Volumen 7
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x1A, 0x37, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00,
            // Frame 4: Desvanecimiento final (Periodo 31), Volumen 3
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x1F, 0x37, 0x03, 0x00, 0x00, 0x00, 0x00, 0x00,
            // Frame 5: Silencio
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x3F, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
        ]
    },

    // Efecto Salto Retro (8-bit Jump): Barrido ascendente rápido de frecuencia en Canal A
    sfxJump: {
        title: "SFX 8-Bit Jump",
        framerate: 50,
        nFrames: 5,
        songData: [
            // Frame 0: Tono base medio (~180 Hz, Periodo 0x0280), Volumen 15
            0x80, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x3E, 0x0F, 0x00, 0x00, 0x00, 0x00, 0x00,
            // Frame 1: Sube frecuencia (Periodo 0x01E0)
            0xE0, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x3E, 0x0F, 0x00, 0x00, 0x00, 0x00, 0x00,
            // Frame 2: Sube frecuencia (Periodo 0x0140)
            0x40, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x3E, 0x0D, 0x00, 0x00, 0x00, 0x00, 0x00,
            // Frame 3: Agudo final (Periodo 0x00A0), Volumen 8
            0xA0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x3E, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00,
            // Frame 4: Silencio
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x3F, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
        ]
    },

    // 2. Platillo Abierto / Crash (Open Cymbal) - Decaimiento metálico largo (8 frames @ 50 Hz = 160 ms)
    sfxCrashCymbal: {
        title: "SFX Crash Cymbal",
        framerate: 50,
        nFrames: 8,
        songData: [
            // Frame 0: Tono muy agudo (R0=0x18) + Ruido fino (R6=0x01), Mixer Tono+Ruido en A (R7=0x36), Vol 15
            0x18, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x36, 0x0F, 0x00, 0x00, 0x00, 0x00, 0x00,
            // Frame 1: Solo ruido agudo, Volumen 13
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0x37, 0x0D, 0x00, 0x00, 0x00, 0x00, 0x00,
            // Frame 2: Volumen 11
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0x37, 0x0B, 0x00, 0x00, 0x00, 0x00, 0x00,
            // Frame 3: Volumen 9
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x03, 0x37, 0x09, 0x00, 0x00, 0x00, 0x00, 0x00,
            // Frame 4: Volumen 7
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x03, 0x37, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00,
            // Frame 5: Volumen 5
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x04, 0x37, 0x05, 0x00, 0x00, 0x00, 0x00, 0x00,
            // Frame 6: Volumen 2 (cola final)
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x04, 0x37, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00,
            // Frame 7: Silencio
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x3F, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
        ]
    },




};

/**
 * Metodos que permiten enviar trozos de datos, que se llaman presets
 * Hay métodos de prueba que utilizar el emulador, otros que envían los datos
 * sólo al hw.  
 * */ 


export class AYM_HardwarePresetManager {
    //constructor(serialAdapter, view, model) {
    constructor(player) {
        //this.serialAdapter = serialAdapter;
        //this.view = view;
        //this.model = model;

        this.player = player;
        this.serialAdapter = player.serialAdapter;
        this.view = player.view;
        this.model = player.model;


        this.presets = AYM_HardwarePresetsData;

        this.hwTimer = null;
        this.hwPlaybackInterval = null;
        this.currentHwFrame = 0;
        this.isHwPlaying = false;
    }

    /**
     * 
     * @param {*} presetKey 
     * @returns 
     */
    playHwAndEmu(presetKey) {
        const preset = this.presets[presetKey];
        if (!preset) return;

        // 1. Empaquetar con la estructura esperada por el reproductor
        this.player.externalMusic = {
            title: preset.title,
            type: 'YM',
            frames: preset.nFrames,
            interleaved: false,
            songData: preset.songData
        };

        this.player.audioSource = 'external';

        // 2. Poblar el visor de frames en la UI
        this.view.populateFramesContainer(preset.songData, preset.nFrames);
        this.view.setTotalFrames(preset.nFrames);
        this.view.setStatusDisplay(`Preset: ${preset.title}`);

        // 3. Si quieres ejecutarlo directamente en el emulador y por puerto serial:
        this.model.sendExternalTrack(this.player.externalMusic);
    }

    /**
     * Envía un preset directamente al hardware sin pasar por el emulador
     * @param {string} presetKey 
     */
    async sendPresetToHardwareOnly(presetKey) {
        // 1. Validar que el puerto serial esté conectado
        if (!this.serialAdapter.isConnected) {
            this.view.setStatusDisplay("Error: Serial no conectado");
            return;
        }

        const preset = this.presets[presetKey];
        if (!preset) return;

        // 2. Detener cualquier transmisión serial previa
        if (this.hwTimer) {
            clearInterval(this.hwTimer);
            this.hwTimer = null;
        }

        // 3. Actualizar la vista con los frames a enviar (para inspección)
        this.view.populateFramesContainer(preset.songData, preset.nFrames);
        this.view.setTotalFrames(preset.nFrames);
        this.view.setStatusDisplay(`Enviando al HW: ${preset.title}...`);

        let currentFrame = 0;
        const totalFrames = preset.nFrames;

        // 4. Temporizador a 50 Hz (20 ms por frame) exclusivo hacia el Serial
        this.hwTimer = setInterval(async () => {
            if (currentFrame >= totalFrames || !this.serialAdapter.isConnected) {
                clearInterval(this.hwTimer);
                this.hwTimer = null;
                this.view.setStatusDisplay(`HW: ${preset.title} completado`);
                return;
            }

            // Extraer los 14 registros del frame actual
            const startIdx = currentFrame * 14;
            const frameBytes = preset.songData.slice(startIdx, startIdx + 14);

            // Transmisión directa por el puerto serial
            await this.serialAdapter.sendFrame(frameBytes);

            // Actualizar el visor y contador visual en pantalla
            this.view.updateCurrentFrame(currentFrame);
            this.view.highlightFrame(currentFrame);

            currentFrame++;
        }, 20); // 20 ms = 50 Hz (Framerate estándar del AY-3-8910)
    }

    /**
     * Enviar un único frame directo (útil para pruebas inmediatas o comandos únicos)
     */
    async sendSingleFrameToHardware(registers14) {
        if (this.serialAdapter.isConnected && registers14.length === 14) {
            await this.serialAdapter.sendFrame(registers14);
        }
    }

    /**
     * Envía una secuencia multi-frame directamente al Arduino/AY-3-8910
     * @param {string} presetKey - Clave del preset en AYM_HardwarePresets
     * @param {boolean} loop - Si debe repetirse indefinidamente
     */
    async play(presetKey, loop = false, refreshStatus = false) {
        if (!this.serialAdapter.isConnected) {
            this.view.setStatusDisplay("Error: Serial no conectado");
            return;
        }

        const preset = this.presets[presetKey];
        if (!preset || !preset.songData || preset.songData.length === 0) {
            this.view.setStatusDisplay("Error: Preset no encontrado");
            return;
        }

        await this.stop(false);

        const totalFrames = preset.nFrames;
        const intervalMs = Math.floor(1000 / (preset.framerate || 50));

        if(refreshStatus){
            this.view.populateFramesContainer(preset.songData, totalFrames);
            this.view.setTotalFrames(totalFrames);
            this.view.setStatusDisplay(`HW: ${preset.title} (${totalFrames} frames)`);
        }

        this.currentHwFrame = 0;
        this.isHwPlaying = true;

        this.hwPlaybackInterval = setInterval(async () => {
            if (!this.isHwPlaying || !this.serialAdapter.isConnected) {
                await this.stop();
                return;
            }

            if (this.currentHwFrame >= totalFrames) {
                if (loop) {
                    this.currentHwFrame = 0;
                } else {
                    await this.stop(true);
                    return;
                }
            }

            const startIdx = this.currentHwFrame * 14;
            const frameBytes = preset.songData.slice(startIdx, startIdx + 14);

            await this.serialAdapter.sendFrame(frameBytes);

            this.view.updateCurrentFrame(this.currentHwFrame);
            this.view.highlightFrame(this.currentHwFrame);

            this.currentHwFrame++;
        }, intervalMs);
    }

    /**
     * Detiene la secuencia del preset y apaga el chip físico
     * @param {boolean} sendMuteFrame - Si true, envía silencio total al hardware
     */
    async stop(sendMuteFrame = true, refreshStatus = false) {
        if (this.hwPlaybackInterval) {
            clearInterval(this.hwPlaybackInterval);
            this.hwPlaybackInterval = null;
        }

        this.isHwPlaying = false;

        if (sendMuteFrame && this.serialAdapter.isConnected) {
            const muteBytes = [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x3F, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
            await this.serialAdapter.sendFrame(muteBytes);
        }

        if(refreshStatus){
            this.view.setStatusDisplay("HW: Preset detenido");
        }
    }
};