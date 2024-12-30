#include "litedb.h"
#include <algorithm>
#include <iostream>

// Implementazione della classe LiteCollection

template <typename T>
void LiteCollection<T>::rebuildIndexes() {
    for (auto& [field, index] : indexes) {
        index.clear();
        for (const auto& item : data) {
            auto value = std::to_string(item.at(field));  // Assume che T sia un map-like container
            index[value].push_back(item);
        }
    }
}

template <typename T>
T LiteCollection<T>::insert(const T& item) {
    for (const auto& [field, index] : indexes) {
        auto value = std::to_string(item.at(field));
        if (uniqueIndexes.count(field) && index.count(value)) {
            throw std::runtime_error("Duplicate key for unique index on field: " + field);
        }
        indexes[field][value].push_back(item);
    }
    data.push_back(item);
    return item;
}

template <typename T>
bool LiteCollection<T>::update(const T& item) {
    auto it = std::find(data.begin(), data.end(), item);
    if (it == data.end()) {
        return false;
    }
    *it = item;
    rebuildIndexes();
    return true;
}

template <typename T>
int LiteCollection<T>::remove(const Query<T>& query) {
    auto originalSize = data.size();
    data.erase(std::remove_if(data.begin(), data.end(), query), data.end());
    rebuildIndexes();
    return originalSize - data.size();
}

template <typename T>
std::vector<T> LiteCollection<T>::find(const Query<T>& query) const {
    std::vector<T> results;
    for (const auto& item : data) {
        if (query(item)) {
            results.push_back(item);
        }
    }
    return results;
}

template <typename T>
void LiteCollection<T>::ensureIndex(const std::string& field, bool unique) {
    if (indexes.count(field)) {
        throw std::runtime_error("Index already exists on field: " + field);
    }

    std::map<std::string, std::vector<T>> index;
    for (const auto& item : data) {
        auto value = std::to_string(item.at(field));  // Assume che T sia un map-like container
        if (unique && index.count(value)) {
            throw std::runtime_error("Duplicate key error for unique index on field: " + field);
        }
        index[value].push_back(item);
    }
    indexes[field] = index;

    if (unique) {
        uniqueIndexes.insert(field);
    }
}

// Implementazione della classe LiteDatabase

template <typename T>
LiteCollection<T>* LiteDatabase::getCollection(const std::string& name) {
    if (collections.count(name) == 0) {
        collections[name] = new LiteCollection<T>();
    }
    return static_cast<LiteCollection<T>*>(collections[name]);
}
