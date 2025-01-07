#include <napi.h>
#include "lite_collection_wrapper.h"
#include "litedb.h"

Napi::Object LiteCollectionWrapper::Init(Napi::Env env, Napi::Object exports)
{
    Napi::Function func = DefineClass(env, "LiteCollection", {
        InstanceMethod("insert", &LiteCollectionWrapper::Insert)
    });

    Napi::FunctionReference *constructor = new Napi::FunctionReference();
    *constructor = Napi::Persistent(func);
    env.SetInstanceData(constructor);

    exports.Set("LiteCollection", func);
    return exports;
}

LiteCollectionWrapper::LiteCollectionWrapper(const Napi::CallbackInfo &info)
    : Napi::ObjectWrap<LiteCollectionWrapper>(info) {}

Napi::Value LiteCollectionWrapper::Insert(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();

    if (info.Length() < 1)
    {
        Napi::TypeError::New(env, "Expected one argument").ThrowAsJavaScriptException();
        return env.Null();
    }

    return env.Null();
    //TODO: return collection.insert(info[0]);
}
