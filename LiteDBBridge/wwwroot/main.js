// Importa lo script di avvio del runtime .NET WebAssembly
import { dotnet } from './_framework/dotnet.js';

let liteDBExports = null;
// let jsRuntime = null; // NON PIÙ NECESSARIO
let wasmModule = null; // Per _malloc, _free, HEAPU8 dell'istanza WASM
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

    // Usa _malloc dal modulo WASM effettivo
    const ptr = wasmModule._malloc(utf8Bytes.length);
    
    // Scrivi i byte nella memoria WASM tramite HEAPU8
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
    
    // Accedi al buffer della memoria WASM tramite HEAPU8
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
    
    // Libera la memoria della stringa del percorso DB allocata da JS usando _free del modulo WASM
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
    
    // Libera la memoria della stringa dei nomi delle collezioni restituita da C#
    // Chiamando il tuo metodo C# FreeMemory
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

async function initializeDotNet() {
    try {
        // Deconstruisci l'oggetto ritornato da dotnet.create()
        // Rimosso getJSRuntime in quanto non è più una funzione esposta qui
        const { getAssemblyExports, getConfig, Module } = await dotnet.create(); 
        const config = getConfig();

        liteDBExports = (await getAssemblyExports(config.mainAssemblyName)).LiteDBBridge; 
        console.dir(liteDBExports)
        
        wasmModule = Module; // Salva l'oggetto Module che contiene _malloc, _free, HEAPU8

        console.log("LiteDB C# WASM Library Loaded!");
        
        window.LiteDB = {
            open: openLiteDB,
            listCollections: listCollections,
            close: closeLiteDB
        };

        console.log("LiteDB JavaScript API ready via window.LiteDB");

        // Esempio di utilizzo:
        await window.LiteDB.open("mytest.db");
        const collections = await window.LiteDB.listCollections();
        console.log("Collections from example:", collections);
        await window.LiteDB.close();

    } catch (error) {
        console.error("Failed to load .NET WASM LiteDB library:", error);
    }
}

// Avvia l'inizializzazione del runtime .NET quando il DOM è completamente caricato
document.addEventListener('DOMContentLoaded', initializeDotNet);