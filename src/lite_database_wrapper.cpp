#include <napi.h>

#include "litedb.h"
#include "lite_database_wrapper.h"
#include "lite_collection_wrapper.h"

Napi::Object LiteDatabaseWrapper::Init(Napi::Env env, Napi::Object exports)
{
    Napi::Function func = DefineClass(env, "LiteDatabase", {
        InstanceMethod("getCollection", &LiteDatabaseWrapper::GetCollection)
    });

    exports.Set("LiteDatabase", func);
    return exports;
}

LiteDatabaseWrapper::LiteDatabaseWrapper(const Napi::CallbackInfo &info)
    : Napi::ObjectWrap<LiteDatabaseWrapper>(info) {}

Napi::Value LiteDatabaseWrapper::GetCollection(const Napi::CallbackInfo &info)
{
    std::string name = info[0].As<Napi::String>();
    Napi::Env env = info.Env();
    
    return env.Null();
    // TODO: return LiteCollectionWrapper::NewInstance(env, info[0]);
}
