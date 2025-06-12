// Sample file to use the LiteDBBridge dll

#include <dlfcn.h>
#include <iostream>

typedef void (*InsertDocumentFunc)();

int main()
{
    // Apri la .so
    void* handle = dlopen("../LiteDBBridge/bin/Release/net8.0/linux-x64/native/litedbbridge.so", RTLD_LAZY);
    if (!handle)
    {
        std::cerr << "Cannot open LiteDBBridge.so: " << dlerror() << std::endl;
        return 1;
    }

    // Recupera il simbolo (la funzione esportata)
    InsertDocumentFunc insertDocument = (InsertDocumentFunc)dlsym(handle, "InsertDocument");
    if (!insertDocument)
    {
        std::cerr << "Cannot find symbol InsertDocument: " << dlerror() << std::endl;
        dlclose(handle);
        return 1;
    }

    // Chiama la funzione!
    std::cout << "Calling InsertDocument..." << std::endl;
    insertDocument();
    std::cout << "Done." << std::endl;

    // Chiudi la .so
    dlclose(handle);

    return 0;
}
