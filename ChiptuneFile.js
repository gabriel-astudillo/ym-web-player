const localModules = {};

// Cargador emulado de CommonJS de Node.js adaptado a la Web
async function initLhaLibrary() {
    if (localModules['archive']) return; // Ya está cargada

    const requireWeb = (path) => {
        if (path.includes('bit-eater')) return localModules['bit-eater'];
        if (path.includes('tree')) return localModules['tree'];
        if (path.includes('new_decoder')) return localModules['new_decoder'];
        if (path.includes('null_decoder')) return localModules['null_decoder'];
        if (path.includes('decoder')) return localModules['decoder'];
        if (path.includes('archive')) return localModules['archive'];
        return null;
    };

    const filesToLoad = [
        { name: 'bit-eater', url: './vendor/libLHA/bit-eater.js' },
        { name: 'tree', url: './vendor/libLHA/tree.js' },
        { name: 'null_decoder', url: './vendor/libLHA/null_decoder.js' },
        { name: 'new_decoder', url: './vendor/libLHA/new_decoder.js' },
        { name: 'decoder', url: './vendor/libLHA/decoder.js' },
        { name: 'archive', url: './vendor/libLHA/archive.js' }
    ];

    for (const file of filesToLoad) {
        const response = await fetch(file.url);
        const code = await response.text();

        const module = { exports: {} };
        const exports = module.exports;

        // Inyectamos un entorno aislado para cada script de la librería
        // Esto evita que 'NewDecoder' de un archivo pise al del otro en el objeto window
        const runModule = new Function('module', 'exports', 'require', code);
        runModule(module, exports, requireWeb);

        localModules[file.name] = module.exports;
    }
}

/**
 * Clase principal ChiptuneFile reescrita para la Web
 * Integrada con el motor secuencial de la librería local 'jslha'
 */
export class ChiptuneFile {
    constructor() {
        this.formatType = null;
        this.songData = null;
        this.nFrames = null;
        this.interleaved = null;
        this.numRegisters = 14;
        this.additionalInfo = "";
        this.processLog = "";
    }

    getData() { return [this.songData, this.nFrames, this.interleaved]; }
    getAdditionalInfo() { return this.additionalInfo; }
    getProcessLog() { return this.processLog; }
    getFormatType() { return this.formatType; }

    async loadFile(fileObject) {
        this.additionalInfo = "";
        this.processLog = "";

        // ========================================================================
        // No continuar hasta que se inicialice la librería de descompresión LHA
        // ========================================================================
        await initLhaLibrary();
        
        const arrayBuffer = await fileObject.arrayBuffer();
        const view = new DataView(arrayBuffer);
        const uint8Array = new Uint8Array(arrayBuffer);

        this.formatType = this.detectFormat(view);

        if (this.formatType === 'unknown') {
            this.processLog += "File format not recognized\n";
            throw new Error("File format not recognized");
        }

        if (this.formatType.includes('YM')) {
            this.processLog += `Format file detected: ${this.formatType}\n`;
            this.decodeYmFile(view, uint8Array);
        } else if (this.formatType === '-lh5-') {
            this.processLog += `LHA format file detected: ${this.formatType}\n`;
            //this.decompressLh5File(arrayBuffer);
            this.decompressLh5File_GAM(arrayBuffer);
        }

        if (this.interleaved && this.interleaved[0] === 1) {
            this.processLog += "File is interleaved...\n";
        } else {
            this.processLog += "File is not interleaved...\n";
        }

        // ========================================================================
        // Separar flujos nibarios por canal/registro
        // ========================================================================
        this.registers = {};
        for (let i = 0; i < this.numRegisters; i++) {
            this.registers[i] = [];
        }

        if (this.interleaved && this.interleaved[0] === 1) {
            this.processLog += "Deinterleaving registers...\n";
            //console.log("Deinterleaving...\n" + this.numRegisters);

            // Equivale a: for i in range(0, num_registers):
            for (let i = 0; i < this.numRegisters; i++) {
                // Equivale a: registers[i]=song_data[i*n_frames:(i+1)*n_frames]
                const startIdx = i * this.nFrames;
                const endIdx = (i + 1) * this.nFrames;
                
                this.registers[i] = this.songData.slice(startIdx, endIdx);
            }
            console.log("Deinterleaving...OK\n");
        }

        // ========================================================================
        // Reconstrucción de los frames
        // ========================================================================
        let j = 0;
        let allFrames = []; 

        while (j < this.nFrames) {
            let endEarly = false;

            for (let i = 0; i < this.numRegisters; i++) {
                // ========================================================
                // Extrae el primer elemento (modifica el arreglo original)
                // ========================================================
                const currentReg = this.registers[i].shift(); 

                // ========================================================
                // Control de IndexError : si es undefined, 
                // el array se quedó sin elementos
                // ========================================================
                if (currentReg === undefined) {
                    this.processLog += "Reached end of frames early...\n";
                    console.log("reached end of frames early...");
                    endEarly = true;
                    break;
                }

                allFrames.push(currentReg);
            }

            // ========================================================
            // Agregar dos bytes para compatibilizar con el emulador
            // TODO: modificar el emulador para que trabaje con 14 registros
            //       y no con 16 registros.
            // ========================================================
            //allFrames.push(0x00);
            //allFrames.push(0x00);

            if (endEarly) {
                break;
            }

            j += 1;
        }

        // Sobrescribimos songData con el nuevo flujo ordenado linealmente por frame
        this.songData = allFrames;

    }

    detectFormat(view) {
        // Escaneo de firmas YM directas en crudo
        for (let i = 0; i < Math.min(view.byteLength - 4, 64); i++) {
            let magic = this.readAsciiString(view, i, 4);
            if (['YM3!', 'YM3b', 'YM5!', 'YM6!', 'YM2!'].includes(magic)) {
                return magic;
            }
        }
        // Escaneo de cabecera LHA (-lh0-, -lh5-, etc.)
        for (let i = 0; i < view.byteLength - 7; i++) {
            if (view.getUint8(i) === 0x2d && view.getUint8(i+1) === 0x6c && view.getUint8(i+2) === 0x68 && view.getUint8(i+6) === 0x2d) {
                return '-lh5-';
            }
        }

        for (let i = 0; i < view.byteLength - 7; i++) {
            if (view.getUint8(i) === 0x2d && view.getUint8(i+1) === 0x6c ) {
                return '-lh5-';
            }
        }
        return 'unknown';
    }

    decodeYmFile(view, uint8Array) {
        let startOffset = 0;
        for (let i = 0; i < 64; i++) {
            let magic = this.readAsciiString(view, i, 4);
            if ([ 'YM3!', 'YM3b', 'YM5!', 'YM6!' ].includes(magic)) {
                startOffset = i;
                break;
            }
        }

        if (['YM3!', 'YM3b', 'YM2!'].includes(this.formatType)) {
            this.nFrames = Math.floor((view.byteLength - startOffset - 4) / this.numRegisters);
            this.interleaved = [1];
            this.songData = Array.from(uint8Array.subarray(startOffset + 4));
        } 
        else if (['YM5!', 'YM6!'].includes(this.formatType)) {
            this.nFrames = view.getUint32(startOffset + 0xc, false); // Big Endian (>I o >i)
            this.interleaved = [view.getUint8(startOffset + 0x13)]; // 0x13

            console.log("interleaved="+ this.interleaved);

            let idx = startOffset + 34; // 0x22
            this.additionalInfo += "Song title: ";
            idx = this.readWordFromUint8Array(uint8Array, idx);
            this.additionalInfo += "\n";

            this.additionalInfo += "Author: ";
            idx = this.readWordFromUint8Array(uint8Array, idx);
            this.additionalInfo += "\n";

            this.additionalInfo += "Comments: ";
            idx = this.readWordFromUint8Array(uint8Array, idx);
            this.additionalInfo += "\n";
            
            this.songData = Array.from(uint8Array.subarray(idx));
        }
    }

    decompressLh5File_GAM(arrayBuffer) {
        this.processLog += "Decompressing Lempel Ziv Huffman archive file via jslha...\n";
        try {
            // Obtenemos el constructor de Archive desde nuestro namespace aislado y protegido
            const ArchiveConstructor = localModules['archive'];
            if (!ArchiveConstructor) {
                throw new Error("Módulo 'archive.js' no inicializado.");
            }

            // Instanciar usando el buffer binario leído de la Web
            const archive = new ArchiveConstructor(arrayBuffer);
            archive.parseFile();
            
            if (!archive.sequence || archive.sequence.length === 0) {
                throw new Error("El contenedor LHA no contiene archivos legibles.");
            }

            const firstEntry = archive.sequence[0];
            this.processLog += `Contents of archive:\n- ${firstEntry.name}\n`;
            
            // Extraer usando el extractor nativo de jslha
            const decompressedData = archive.extract(0);
            const sizeDecompressed = decompressedData.length;

            let ymType = 'unknown';
            let ymStartIdx = -1;

            for (let j = 0; j < Math.min(decompressedData.length - 4, 128); j++) {
                let checkMagic = String.fromCharCode(decompressedData[j]) + 
                                 String.fromCharCode(decompressedData[j+1]) + 
                                 String.fromCharCode(decompressedData[j+2]) + 
                                 String.fromCharCode(decompressedData[j+3]);

                if (['YM3!', 'YM3b', 'YM5!', 'YM6!', 'YM2!'].includes(checkMagic)) {
                    ymType = checkMagic;
                    ymStartIdx = j;
                    break;
                }
            }

            if (ymType === 'unknown') {
                throw new Error("La estructura extraída por jslha carece de una firma YM válida.");
            }

            this.processLog += `Decompressed file format type: ${ymType}\n`;
            
            const decompressedView = new DataView(
                new Uint8Array(decompressedData).buffer, 
                decompressedData.byteOffset || 0, 
                decompressedData.length
            );

            let idx = ymStartIdx;

            if (['YM5!', 'YM6!'].includes(ymType)) {
                this.nFrames = decompressedView.getUint32(ymStartIdx + 12, false);
                this.processLog += `Number of frames in decompressed data: ${this.nFrames}\n`;

                this.interleaved = [decompressedView.getUint8(ymStartIdx + 19)];

                idx = ymStartIdx + 34; // 0x22
                this.additionalInfo += "Song title: ";
                idx = this.readWordFromUint8Array(decompressedData, idx);
                this.additionalInfo += "\n";

                this.additionalInfo += "Author: ";
                idx = this.readWordFromUint8Array(decompressedData, idx);
                this.additionalInfo += "\n";

                this.additionalInfo += "Comments: ";
                idx = this.readWordFromUint8Array(decompressedData, idx);
                this.additionalInfo += "\n";

                this.processLog += `Decompressed ${sizeDecompressed} bytes from LHA file.\n`;
            } 
            else if (['YM3!', 'YM3b', 'YM2!'].includes(ymType)) {
                this.nFrames = Math.floor((sizeDecompressed - ymStartIdx - 4) / this.numRegisters);
                this.interleaved = [1];
                idx = ymStartIdx + 4;
            }

            this.songData = Array.from(decompressedData.slice(idx));
            this.formatType = ymType;

        } catch (e) {
            throw new Error(`Error descomprimiendo archivo LHA: ${e.message}`);
        }
    }


    decompressLh5File(arrayBuffer) {
        this.processLog += "Decompressing Lempel Ziv Huffman archive file via local jslha...\n";
        try {
            if (typeof window.JSLha === 'undefined') {
                throw new Error("El cargador 'JSLha' no se encuentra acoplado al entorno global.");
            }
            console.log("######");
            // 1. Instanciar la librería local pasándole el buffer binario
            const lhaArchive = new window.JSLha(arrayBuffer);
            
            if (!lhaArchive.files || lhaArchive.files.length === 0) {
                throw new Error("El contenedor LHA no contiene archivos legibles.");
            }

            const firstEntry = lhaArchive.files[0];
            this.processLog += `Contents of archive: - ${firstEntry.name}\n`;

            // 2. Convertir el flujo extraído en una vista Uint8Array limpia y acotada
            const decompressedBytes = new Uint8Array(firstEntry.content);
            const sizeDecompressed = decompressedBytes.length;

            let ymType = 'unknown';
            let ymStartIdx = -1;

            // Escaneo dinámico estricto para ubicar el encabezado de audio YM extraído
            for (let i = 0; i < Math.min(decompressedBytes.length - 4, 128); i++) {
                let checkMagic = String.fromCharCode(decompressedBytes[i]) + 
                                 String.fromCharCode(decompressedBytes[i+1]) + 
                                 String.fromCharCode(decompressedBytes[i+2]) + 
                                 String.fromCharCode(decompressedBytes[i+3]);

                if (['YM3!', 'YM3b', 'YM5!', 'YM6!', 'YM2!'].includes(checkMagic)) {
                    ymType = checkMagic;
                    ymStartIdx = i;
                    break;
                }
            }

            if (ymType === 'unknown') {
                throw new Error("La estructura extraída por jslha carece de una firma YM válida.");
            }

            this.processLog += `Decompressed file format type discovered at byte ${ymStartIdx}: ${ymType}\n`;
            
            // Generar la vista de datos sobre el buffer exclusivo de la canción extraída
            const decompressedView = new DataView(decompressedBytes.buffer, decompressedBytes.byteOffset, decompressedBytes.byteLength);

            let idx = ymStartIdx;

            if (['YM5!', 'YM6!'].includes(ymType)) {
                // Cálculo de frames exactos relativo al offset de sincronización real
                this.nFrames = decompressedView.getUint32(ymStartIdx + 12, false); 
                this.processLog += `Number of frames in decompressed data: ${this.nFrames}\n`;

                this.interleaved = [decompressedView.getUint8(ymStartIdx + 19)];

                idx = ymStartIdx + 34; // Desplazamiento base de cadenas de texto (0x22)
                this.additionalInfo += "Song title: ";
                idx = this.readWordFromUint8Array(decompressedBytes, idx);
                this.additionalInfo += "\n";

                this.additionalInfo += "Author: ";
                idx = this.readWordFromUint8Array(decompressedBytes, idx);
                this.additionalInfo += "\n";

                this.additionalInfo += "Comments: ";
                idx = this.readWordFromUint8Array(decompressedBytes, idx);
                this.additionalInfo += "\n";

                this.processLog += `Decompressed ${sizeDecompressed} bytes from LHA file.\n`;
            } 
            else if (['YM3!', 'YM3b', 'YM2!'].includes(ymType)) {
                this.nFrames = Math.floor((sizeDecompressed - ymStartIdx - 4) / this.numRegisters);
                this.interleaved = [1];
                idx = ymStartIdx + 4;
            }

            this.songData = Array.from(decompressedBytes.subarray(idx));
            this.formatType = ymType;

        } catch (e) {
            throw new Error(`Error descomprimiendo archivo LHA con jslha: ${e.message}`);
        }
    }

    readAsciiString(view, offset, length) {
        let str = "";
        for (let i = 0; i < length; i++) {
            if (offset + i < view.byteLength) {
                str += String.fromCharCode(view.getUint8(offset + i));
            }
        }
        return str;
    }

    readWordFromUint8Array(uint8Array, idx) {
        let charCode = uint8Array[idx];
        while (charCode !== 0 && idx < uint8Array.length) {
            this.additionalInfo += String.fromCharCode(charCode);
            idx++;
            charCode = uint8Array[idx];
        }
        return idx + 1;
    }
}
