#include <dlfcn.h>
#include <iostream>

typedef void (*InsertDocumentFunc)(const char*);

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

    InsertDocumentFunc insertDocument = (InsertDocumentFunc)dlsym(handle, "InsertDocument");
    if (!insertDocument)
    {
        std::cerr << "Cannot find symbol InsertDocument: " << dlerror() << std::endl;
        dlclose(handle);
        return 1;
    }

    std::cout << "Calling InsertDocument with db: " << dbPath << std::endl;
    insertDocument(dbPath);
    std::cout << "Done." << std::endl;

    dlclose(handle);
    return 0;
}
