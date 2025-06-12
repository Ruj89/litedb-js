using System;
using System.Runtime.InteropServices;
using LiteDB;

public static class MyWrapper
{
    [UnmanagedCallersOnly(EntryPoint = "InsertDocument")]
    public static void InsertDocument()
    {
        using var db = new LiteDatabase("mydata.db");
        var col = db.GetCollection<BsonDocument>("mycollection");

        var doc = new BsonDocument
        {
            ["name"] = "test",
            ["value"] = 123
        };

        col.Insert(doc);
    }
}
