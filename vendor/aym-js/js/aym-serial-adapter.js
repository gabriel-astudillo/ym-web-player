// assets/js/aym-serial-adapter.js
import { AYM_HardwarePresetManager } from './aym-hw-presets.js';

export class AYM_SerialAdapter {
    constructor(controller) {
        this.controller = controller;
        this.port = null;
        this.writer = null;
        this.isConnected = false;
        this.baudRate = 115200;

        // Callback para notificar a observadores externos
        this.onDisconnect = null;
    }

    async connect() {
        if (!("serial" in navigator)) {
            throw new Error("Web Serial API no soportada en este navegador. Usa Chrome o Edge.");
        }

        // Solicitar al usuario seleccionar el puerto COM / /dev/ttyUSB del Arduino
        this.port = await navigator.serial.requestPort();
        await this.port.open({ baudRate: this.baudRate });

        this.writer = this.port.writable.getWriter();
        this.isConnected = true;
    }

    async disconnect() {
        
        if (this.writer) {
            await this.writer.close();
            this.writer = null;
        }
        if (this.port) {
            await this.port.close();
            this.port = null;
        }
        this.isConnected = false;

        
    }

    handleDisconnection() {
        this.isConnected = false;
        // Invocamos el callback si existe
        if (typeof this.onDisconnect === 'function') {
            this.onDisconnect();
        }
    }

    /**
     * Envía un frame de 14 registros empaquetado con sincronización
     * @param {Array<number>|Uint8Array} frameData (14 bytes)
     */
    async sendFrame(frameData) {
        if (!this.isConnected || !this.writer) return;

        // Paquete: [0xFF, 0x5A] + 14 registros + [Checksum XOR]
        const packet = new Uint8Array(17);
        packet[0] = 0xFF; // Sync 1
        packet[1] = 0x5A; // Sync 2

        let checksum = 0;
        for (let i = 0; i < 14; i++) {
            const val = frameData[i] || 0;
            packet[2 + i] = val;
            checksum ^= val;
        }
        packet[16] = checksum;

        try {
            await this.writer.write(packet);
        } catch (err) {
            console.error("Error enviando frame por serial:", err);
        }
    }
}