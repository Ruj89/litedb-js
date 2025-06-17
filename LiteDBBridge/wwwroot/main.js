// Importa lo script di avvio del runtime .NET WebAssembly
import { dotnet } from './_framework/dotnet.js';

let liteDBExports = null;
let wasmModule = null; // Per _malloc, _free, HEAPU8, FS
let currentDbHandle = 0;

/**
 * Funzione di utilità per convertire una stringa JS in un puntatore UTF-8 in memoria WASM.
 * @param {string} jsString La stringa JavaScript da convertire.
 * @returns {number} L'IntPtr (indirizzo numerico) della stringa in memoria WASM.
 */
function jsStringToWasmPtr(jsString) {
    if (!wasmModule) throw new Error("WASM Module not initialized. Cannot allocate memory.");

    const encoder = new TextEncoder();
    const utf8Bytes = encoder.encode(jsString + '\0'); // Aggiungi null-terminator

    const ptr = wasmModule._malloc(utf8Bytes.length);
    wasmModule.HEAPU8.set(utf8Bytes, ptr);

    return ptr;
}

/**
 * Funzione di utilità per leggere una stringa da un puntatore UTF-8 in memoria WASM.
 * @param {number} ptr L'IntPtr (indirizzo numerico) della stringa in memoria WASM.
 * @returns {string} La stringa JavaScript decodificata.
 */
function wasmPtrToJsString(ptr) {
    if (!wasmModule) throw new Error("WASM Module not initialized. Cannot read memory.");
    if (ptr === 0) return null;

    const decoder = new TextDecoder('utf-8');
    
    const memoryView = new Uint8Array(wasmModule.HEAPU8.buffer, ptr);

    let length = 0;
    while (memoryView[length] !== 0 && length < memoryView.length) {
        length++;
    }

    return decoder.decode(memoryView.subarray(0, length));
}

// --- Funzioni wrapper per il tuo bridge C# ---

async function openLiteDB(dbPath) {
    if (!liteDBExports) {
        console.error("LiteDB C# exports not loaded yet.");
        return null;
    }

    if (currentDbHandle !== 0) {
        console.warn("A database is already open. Closing the previous one.");
        await closeLiteDB();
    }

    const dbPathPtr = jsStringToWasmPtr(dbPath);
    console.log(`Opening database at path: ${dbPath} (ptr: ${dbPathPtr})`);

    currentDbHandle = liteDBExports.OpenDatabase(dbPathPtr);
    
    wasmModule._free(dbPathPtr); 
    
    console.log(`Database opened, handle: ${currentDbHandle}`);
    return currentDbHandle;
}

async function listCollections() {
    if (!liteDBExports || currentDbHandle === 0) {
        console.error("Database not open.");
        return [];
    }

    console.log("Listing collections...");
    const collectionsPtr = liteDBExports.ListCollections(currentDbHandle);
    
    const collectionNamesString = wasmPtrToJsString(collectionsPtr);
    
    liteDBExports.FreeMemory(collectionsPtr); 

    console.log("Collections:", collectionNamesString);
    return collectionNamesString ? collectionNamesString.split('\n').filter(name => name) : [];
}

async function closeLiteDB() {
    if (!liteDBExports || currentDbHandle === 0) {
        console.warn("No database is currently open to close.");
        return;
    }
    console.log(`Closing database with handle: ${currentDbHandle}`);
    liteDBExports.CloseDatabase(currentDbHandle);
    currentDbHandle = 0;
    console.log("Database closed and handle freed.");
}

/**
 * Carica un File da input HTML nel Filesystem Virtuale WASM.
 * @param {File} file Il File object dall'input HTML.
 */
async function uploadFileToVFS(file) {
    if (!wasmModule || !wasmModule.FS) {
        console.error("WASM Filesystem (FS) non disponibile.");
        return;
    }

    console.log(`Inizio caricamento file: ${file.name} (${file.size} bytes) nel VFS...`);
    
    try {
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        try {
            wasmModule.FS.unlink(file.name); 
            console.warn(`Il file '${file.name}' esistente nel VFS è stato rimosso.`);
        } catch (e) {
            console.dir(e)
            if (e.errno === 44 || (e.message && e.message.includes('No such file or directory'))) {
                console.log(`Il file '${file.name}' non esiste ancora nel VFS. Procedo con la creazione.`);
            } else {
                console.error(`Errore inaspettato durante la rimozione del file esistente: ${e.message || e.toString()}`, e);
                throw e;
            }
        }

        // A questo punto, il file è stato rimosso se esisteva, o non esisteva affatto.
        // Possiamo procedere a scriverlo con la flag 'w' in modo sicuro.
        wasmModule.FS.writeFile(file.name, uint8Array, { flags: 'w' }); 
        
        console.log(`File '${file.name}' caricato con successo nel VFS.`);
        console.log(`Ora puoi aprire il database LiteDB usando il percorso '${file.name}'.`);
        // --- FINE REVISIONE ---
        
    } catch (e) {
        // Gestione generica degli errori durante il caricamento/scrittura
        console.error(`Errore durante il caricamento del file nel VFS: ${e.message || e.toString()}`, e);
    }
}

async function initializeDotNet() {
    try {
        const { getAssemblyExports, getConfig, Module } = await dotnet.create(); 
        const config = getConfig();

        liteDBExports = (await getAssemblyExports(config.mainAssemblyName)).LiteDBBridge; 
        console.dir(liteDBExports)
        
        wasmModule = Module; // Salva l'oggetto Module che contiene _malloc, _free, HEAPU8

        console.log("LiteDB C# WASM Library Loaded!");
        
        // Esponi le funzioni al contesto globale
        window.LiteDB = {
            open: openLiteDB,
            listCollections: listCollections,
            close: closeLiteDB,
            uploadFile: uploadFileToVFS, // Aggiungi la funzione di caricamento
            isReady: true // Indica che l'API è pronta
        };

        console.log("LiteDB JavaScript API ready via window.LiteDB");


    } catch (error) {
        console.error("Failed to load .NET WASM LiteDB library:", error);
    }
}

// Avvia l'inizializzazione del runtime .NET quando il DOM è completamente caricato
document.addEventListener('DOMContentLoaded', initializeDotNet);