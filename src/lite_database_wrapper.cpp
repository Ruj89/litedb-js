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
{Napi::Env env = info.Env();

    // Controlla che sia stato passato un argomento e che sia una stringa
    if (info.Length() < 1 || !info[0].IsString()) {
        Napi::TypeError::New(env, "Expected a string as the first argument").ThrowAsJavaScriptException();
        return env.Null();
    }

    std::string name = info[0].As<Napi::String>();

    // Crea un'istanza di LiteCollectionWrapper come oggetto N-API
    Napi::Object collectionWrapper = LiteCollectionWrapper::NewInstance(env, name);

    return collectionWrapper;
}
