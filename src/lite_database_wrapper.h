#include <napi.h>
#include "litedb.h"

class LiteDatabaseWrapper : public Napi::ObjectWrap<LiteDatabaseWrapper> {
public:
    static Napi::Object Init(Napi::Env env, Napi::Object exports);
    LiteDatabaseWrapper(const Napi::CallbackInfo& info);
    
    Napi::Value GetCollection(const Napi::CallbackInfo& info);
    
private:
    LiteDatabase database;
};
