import { useState } from "react";
import { FileText, Loader2, Search } from "lucide-react";
import FileCard from "./FileCard";

const FilesList = ({
  files,
  loading,
  onDelete,
  onDownload,
  onView,
  currentUserAddress,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFiles = files.filter(
    (file) =>
      file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.cid.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            My Files
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            All your encrypted files in one place
          </p>
        </div>
        <div className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold shadow-lg">
          {files.length} {files.length === 1 ? "file" : "files"}
        </div>
      </div>

      {files.length > 0 && (
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search files by name or CID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-20">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-bold text-lg">
            Loading your files...
          </p>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl border-2 border-dashed border-gray-300">
          <FileText className="w-20 h-20 text-gray-400 mx-auto mb-4" />
          {searchTerm ? (
            <>
              <p className="text-gray-900 font-bold text-lg">No files found</p>
              <p className="text-gray-600 mt-1 mb-4">Try different keywords</p>
              <button
                onClick={() => setSearchTerm("")}
                className="px-6 py-2 text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline"
              >
                Clear search
              </button>
            </>
          ) : (
            <>
              <p className="text-gray-900 font-bold text-lg">
                No files uploaded yet
              </p>
              <p className="text-gray-600 mt-1">
                Upload your first encrypted file to get started
              </p>
            </>
          )}
        </div>
      ) : (
        <>
          {searchTerm && (
            <p className="text-sm text-gray-600 mb-4">
              Found {filteredFiles.length}{" "}
              {filteredFiles.length === 1 ? "file" : "files"}
            </p>
          )}
          <div className="grid gap-4">
            {filteredFiles.map((file, idx) => (
              <FileCard
                key={`${file.cid}-${idx}`}
                file={file}
                onDelete={onDelete}
                onDownload={onDownload}
                onView={onView}
                currentUserAddress={currentUserAddress}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default FilesList;
