using System;
using System.Runtime.InteropServices;
using System.Text;
using LiteDB;

public static class LiteDBBridge
{
    [UnmanagedCallersOnly(EntryPoint = "OpenDatabase")]
    public static IntPtr OpenDatabase(IntPtr dbPathPtr)
    {
        string dbPath = Marshal.PtrToStringUTF8(dbPathPtr);

        var connectionString = new ConnectionString
        {
            Filename = dbPath,
            Upgrade = true
        };

        var db = new LiteDatabase(connectionString);

        // Crea un GCHandle per mantenere vivo l'oggetto
        var handle = GCHandle.Alloc(db);

        // Ritorna come IntPtr
        return (IntPtr)handle;
    }

    [UnmanagedCallersOnly(EntryPoint = "ListCollections")]
    public static IntPtr ListCollections(IntPtr dbHandle)
    {
        var handle = (GCHandle)dbHandle;
        var db = (LiteDatabase)handle.Target;

        var collectionNames = db.GetCollectionNames();

        var sb = new StringBuilder();
        foreach (var name in collectionNames)
        {
            sb.AppendLine(name);
        }

        string resultString = sb.ToString();
        byte[] utf8Bytes = Encoding.UTF8.GetBytes(resultString + '\0'); // null-terminated

        IntPtr unmanagedPtr = Marshal.AllocHGlobal(utf8Bytes.Length);
        Marshal.Copy(utf8Bytes, 0, unmanagedPtr, utf8Bytes.Length);

        return unmanagedPtr;
    }

    [UnmanagedCallersOnly(EntryPoint = "CloseDatabase")]
    public static void CloseDatabase(IntPtr dbHandle)
    {
        var handle = (GCHandle)dbHandle;
        var db = (LiteDatabase)handle.Target;

        db.Dispose(); // chiude il DB
        handle.Free(); // libera il GCHandle
    }

    [UnmanagedCallersOnly(EntryPoint = "FreeMemory")]
    public static void FreeMemory(IntPtr ptr)
    {
        Marshal.FreeHGlobal(ptr);
    }
}
