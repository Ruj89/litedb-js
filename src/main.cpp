#include <dlfcn.h>
#include <iostream>
#include <cstdlib>

typedef void* (*OpenDatabaseFunc)(const char*);
typedef char* (*ListCollectionsFunc)(void*);
typedef void (*CloseDatabaseFunc)(void*);
typedef void (*FreeMemoryFunc)(void*);

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

    auto openDatabase = (OpenDatabaseFunc)dlsym(handle, "OpenDatabase");
    auto listCollections = (ListCollectionsFunc)dlsym(handle, "ListCollections");
    auto closeDatabase = (CloseDatabaseFunc)dlsym(handle, "CloseDatabase");
    auto freeMemory = (FreeMemoryFunc)dlsym(handle, "FreeMemory");

    if (!openDatabase || !listCollections || !closeDatabase || !freeMemory)
    {
        std::cerr << "Failed to load one or more functions from LiteDBBridge.so" << std::endl;
        dlclose(handle);
        return 1;
    }

    std::cout << "Opening database: " << dbPath << std::endl;
    void* dbHandle = openDatabase(dbPath);

    std::cout << "Listing collections..." << std::endl;
    char* collectionNames = listCollections(dbHandle);

    std::cout << "Collections found:\n" << collectionNames << std::endl;

    // Libera la memoria della stringa
    freeMemory(collectionNames);

    // Chiudi il database
    closeDatabase(dbHandle);

    dlclose(handle);
    return 0;
}
