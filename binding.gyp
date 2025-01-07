{
  "targets": [
    {
      "target_name": "litedb_native",
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")"
      ],
      "defines": ["NODE_ADDON_API_CPP_EXCEPTIONS"],
      "sources": ["src/addon.cpp", "src/lite_database_wrapper.cpp", "src/lite_collection_wrapper.cpp", "src/litedb.cpp"],
      "cflags!": ["-fno-exceptions"],
      "cflags_cc!": ["-fno-exceptions"],
    }
  ]
}
