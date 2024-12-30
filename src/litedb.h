#ifndef LITE_DB_H
#define LITE_DB_H

#include <map>
#include <set>
#include <string>
#include <vector>
#include <functional>
#include <stdexcept>

// Template per il tipo Query
template <typename T>
using Query = std::function<bool(const T&)>;

// Classe LiteCollection
template <typename T>
class LiteCollection {
private:
    std::vector<T> data;
    std::map<std::string, std::map<std::string, std::vector<T>>> indexes;
    std::set<std::string> uniqueIndexes;

    void rebuildIndexes();

public:
    LiteCollection() = default;

    T insert(const T& item);
    bool update(const T& item);
    int remove(const Query<T>& query);
    std::vector<T> find(const Query<T>& query) const;
    void ensureIndex(const std::string& field, bool unique = false);
};

// Classe LiteDatabase
class LiteDatabase {
private:
    std::map<std::string, void*> collections;

public:
    LiteDatabase() = default;
    ~LiteDatabase() = default;

    template <typename T>
    LiteCollection<T>* getCollection(const std::string& name);
};

#endif
