{
  "targets": [
    {
      "target_name": "addon",
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")"
      ],
      "defines": ["NODE_ADDON_API_CPP_EXCEPTIONS"],
      "sources": ["src/addon.cpp", "src/litedb.cpp"],
      "cflags!": ["-fno-exceptions"],
      "cflags_cc!": ["-fno-exceptions"],
    }
  ]
}
