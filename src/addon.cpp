#include <napi.h>
#include "lite_database_wrapper.h"
#include "lite_collection_wrapper.h"

Napi::Object Init(Napi::Env env, Napi::Object exports)
{
    LiteDatabaseWrapper::Init(env, exports);
    return exports;
}

NODE_API_MODULE(litedb_native, Init)