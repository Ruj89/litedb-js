#include <napi.h>
#include "litedb.h"

class LiteDatabaseWrapper : public Napi::ObjectWrap<LiteDatabaseWrapper> {
private:
    LiteDatabase database;

public:
    static Napi::Object Init(Napi::Env env, Napi::Object exports);
    LiteDatabaseWrapper(const Napi::CallbackInfo& info);

    Napi::Value GetCollection(const Napi::CallbackInfo& info);
};

Napi::Object LiteDatabaseWrapper::Init(Napi::Env env, Napi::Object exports) {
    Napi::Function func = DefineClass(env, "LiteDatabase", {
        InstanceMethod("getCollection", &LiteDatabaseWrapper::GetCollection)
    });

    exports.Set("LiteDatabase", func);
    return exports;
}

LiteDatabaseWrapper::LiteDatabaseWrapper(const Napi::CallbackInfo& info)
    : Napi::ObjectWrap<LiteDatabaseWrapper>(info) {}

Napi::Value LiteDatabaseWrapper::GetCollection(const Napi::CallbackInfo& info) {
    std::string name = info[0].As<Napi::String>();

    // Aggiungi la logica per gestire tipi di dati generici (C++ templates non sono diretti in JS).
    return Napi::Value();
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    LiteDatabaseWrapper::Init(env, exports);
    return exports;
}

NODE_API_MODULE(addon, Init)
