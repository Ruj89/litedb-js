#include <napi.h>
#include "litedb.h"

class LiteCollectionWrapper : public Napi::ObjectWrap<LiteCollectionWrapper> {
public:
    static Napi::Object NewInstance(Napi::Env env, const std::string &name);
    LiteCollectionWrapper(const Napi::CallbackInfo& info);

    Napi::Value Insert(const Napi::CallbackInfo& info);
    Napi::Value Update(const Napi::CallbackInfo &info);
    Napi::Value Remove(const Napi::CallbackInfo &info);
    Napi::Value Find(const Napi::CallbackInfo &info);
    void EnsureIndex(const Napi::CallbackInfo &info);

private:
    LiteCollection<Napi::Value> collection;
};
