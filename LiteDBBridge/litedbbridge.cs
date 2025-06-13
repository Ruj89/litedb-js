using System;
using System.Runtime.InteropServices;
using System.Text;
using LiteDB;

public static class LiteDBBridge
{
    [UnmanagedCallersOnly(EntryPoint = "GetCollectionNames")]
    public static IntPtr GetCollectionNames(IntPtr dbPathPtr)
    {
        string dbPath = Marshal.PtrToStringUTF8(dbPathPtr);
        
        var connectionString = new ConnectionString
        {
            Filename = dbPath,
            Upgrade = true
        };

        using (var db = new LiteDatabase(connectionString))
        {
            var collectionNames = db.GetCollectionNames();

            // Concatena tutti i nomi in una stringa separata da '\n'
            var sb = new StringBuilder();
            foreach (var name in collectionNames)
            {
                sb.AppendLine(name);
            }

            // Converte in UTF8 e alloca unmanaged memory
            string resultString = sb.ToString();
            byte[] utf8Bytes = Encoding.UTF8.GetBytes(resultString + '\0'); // null-terminated string

            IntPtr unmanagedPtr = Marshal.AllocHGlobal(utf8Bytes.Length);
            Marshal.Copy(utf8Bytes, 0, unmanagedPtr, utf8Bytes.Length);

            // Il C++ riceverà un const char* e potrà leggerlo
            return unmanagedPtr;
        }
    }
}
