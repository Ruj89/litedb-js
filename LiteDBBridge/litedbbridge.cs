using System;
using System.Runtime.InteropServices;
using LiteDB;

public static class MyWrapper
{
    [UnmanagedCallersOnly(EntryPoint = "InsertDocument")]
    public static void InsertDocument(IntPtr dbPathPtr)
    {
        // Converte IntPtr in string UTF8
        string dbPath = Marshal.PtrToStringUTF8(dbPathPtr);

        using var db = new LiteDatabase(dbPath);
        var col = db.GetCollection<BsonDocument>("mycollection");

        var doc = new BsonDocument
        {
            ["name"] = "test",
            ["value"] = 123
        };

        col.Insert(doc);
    }
}
