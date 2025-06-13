#include <dlfcn.h>
#include <iostream>
#include <cstdlib> // for free()

typedef char* (*GetCollectionNamesFunc)(const char*);

int main(int argc, char* argv[])
{
    if (argc < 2)
    {
        std::cerr << "Usage: " << argv[0] << " <path_to_db>" << std::endl;
        return 1;
    }

    const char* dbPath = argv[1];

    void* handle = dlopen("../LiteDBBridge/bin/Release/net8.0/linux-x64/native/litedbbridge.so", RTLD_LAZY);
    if (!handle)
    {
        std::cerr << "Cannot open LiteDBBridge.so: " << dlerror() << std::endl;
        return 1;
    }

    GetCollectionNamesFunc getCollectionNames = (GetCollectionNamesFunc)dlsym(handle, "GetCollectionNames");
    if (!getCollectionNames)
    {
        std::cerr << "Cannot find symbol GetCollectionNames: " << dlerror() << std::endl;
        dlclose(handle);
        return 1;
    }

    std::cout << "Calling GetCollectionNames on db: " << dbPath << std::endl;
    char* collectionNames = getCollectionNames(dbPath);

    std::cout << "Collections found:\n" << collectionNames << std::endl;

    // ATTENZIONE: chi libera la memoria? Qui dovresti progettare un Free function nel bridge, oppure:
    // Se sei sicuro che il programma finisce subito, puoi lasciarlo vivere.

    // Altrimenti, se vuoi pulire bene:
    // dlclose(handle);
    // -- Aggiungi in C# un metodo FreeMemory(IntPtr ptr) che chiama Marshal.FreeHGlobal(ptr), e chiamalo da C++.

    dlclose(handle);
    return 0;
}
