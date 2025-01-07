#include <napi.h>
#include "litedb.h"

class LiteCollectionWrapper : public Napi::ObjectWrap<LiteCollectionWrapper> {
public:
    static Napi::Object Init(Napi::Env env, Napi::Object exports);
    LiteCollectionWrapper(const Napi::CallbackInfo& info);


private:
    LiteCollection<Napi::Value> collection;

    Napi::Value Insert(const Napi::CallbackInfo& info);
    //Napi::Value update(const T& item);
    //Napi::Value remove(const Query<T>& query);
    //Napi::Value find(const Query<T>& query) const;
    //void ensureIndex(const std::string& field, bool unique = false);
};
