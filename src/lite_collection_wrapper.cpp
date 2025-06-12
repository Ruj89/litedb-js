#include <napi.h>
#include "lite_collection_wrapper.h"
#include "litedb.h"

Napi::Object LiteCollectionWrapper::NewInstance(Napi::Env env, const std::string &name)
{
    Napi::Function constructor = DefineClass(env, "LiteCollectionWrapper", {InstanceMethod("insert", &LiteCollectionWrapper::Insert)});

    Napi::Object instance = constructor.New({Napi::String::New(env, name)});
    return instance;
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
    return collection.insert(info[0]);
}

Napi::Value LiteCollectionWrapper::Update(const Napi::CallbackInfo &info)//const Napi::Env &item)
{
    Napi::Env env = info.Env();

    if (info.Length() < 1)
    {
        Napi::TypeError::New(env, "Expected one argument").ThrowAsJavaScriptException();
        return env.Null();
    }
    
}
Napi::Value LiteCollectionWrapper::Remove(const Napi::CallbackInfo &info)//const Query<Napi::Env> &query)
{
    Napi::Env env = info.Env();

    if (info.Length() < 1)
    {
        Napi::TypeError::New(env, "Expected one argument").ThrowAsJavaScriptException();
        return env.Null();
    }
}
Napi::Value LiteCollectionWrapper::Find(const Napi::CallbackInfo &info)//const Query<Napi::Env> &query) const
{
    Napi::Env env = info.Env();

    if (info.Length() < 1)
    {
        Napi::TypeError::New(env, "Expected one argument").ThrowAsJavaScriptException();
        return env.Null();
    }
}
void LiteCollectionWrapper::EnsureIndex(const Napi::CallbackInfo &info)//const std::string &field, bool unique = false)
{
    Napi::Env env = info.Env();

    if (info.Length() < 1)
    {
        Napi::TypeError::New(env, "Expected at least one argument").ThrowAsJavaScriptException();
    }
}
