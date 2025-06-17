using System;
using System.Runtime.InteropServices;
using System.Text;
using LiteDB;
using System.Runtime.InteropServices.JavaScript;

public class Program
{
   static void Main() {}
}

public partial class LiteDBBridge
{
    [JSExport]
    internal static IntPtr OpenDatabase(IntPtr dbPathPtr)
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

    [JSExport]
    internal static IntPtr ListCollections(IntPtr dbHandle)
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

    [JSExport]
    internal static void CloseDatabase(IntPtr dbHandle)
    {
        var handle = (GCHandle)dbHandle;
        var db = (LiteDatabase)handle.Target;

        db.Dispose(); // chiude il DB
        handle.Free(); // libera il GCHandle
    }

    [JSExport]
    internal static void FreeMemory(IntPtr ptr)
    {
        Marshal.FreeHGlobal(ptr);
    }
}
