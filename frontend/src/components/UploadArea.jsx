import { useState } from "react";
import { Upload } from "lucide-react";

const UploadArea = ({ uploading, uploadProgress, onUpload, disabled }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (disabled || uploading) return;
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) onUpload(droppedFiles[0]);
  };

  const handleFileInput = (e) => {
    if (disabled || uploading) return;
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 0) onUpload(selectedFiles[0]);
    e.target.value = "";
  };

  return (
    <div
      className={`relative border-3 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer ${
        dragActive
          ? "border-blue-500 bg-blue-50 scale-[1.02] shadow-2xl"
          : "border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50/50 hover:shadow-xl"
      } ${uploading || disabled ? "pointer-events-none opacity-60" : ""}`}
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled && !uploading) setDragActive(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setDragActive(false);
      }}
      onClick={() =>
        !disabled &&
        !uploading &&
        document.getElementById("file-upload").click()
      }
    >
      <input
        type="file"
        id="file-upload"
        className="hidden"
        onChange={handleFileInput}
        disabled={uploading || disabled}
      />

      {uploading ? (
        <div className="space-y-6">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur-md opacity-75 animate-pulse"></div>
            <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-bounce">
              <Upload className="w-10 h-10 text-white" />
            </div>
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900 mb-2">
              Uploading & Encrypting...
            </p>
            <p className="text-sm text-gray-600">
              Securing your file with encryption
            </p>
          </div>
          <div className="max-w-md mx-auto space-y-3">
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500 rounded-full relative overflow-hidden"
                style={{ width: `${uploadProgress}%` }}
              >
                <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-gray-900">
                {uploadProgress}% complete
              </span>
              <span className="text-xs text-gray-500 font-medium">
                ⚡ Gasless transaction
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur-md opacity-50"></div>
            <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center transform hover:scale-110 transition-transform">
              <Upload className="w-10 h-10 text-white" />
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {dragActive
                ? "📂 Drop it here!"
                : "Drop your file or click to browse"}
            </h3>
            <p className="text-gray-600">
              Files are encrypted before upload. Only you can access them.
            </p>
          </div>

          <button
            type="button"
            disabled={disabled}
            className="inline-flex items-center gap-3 px-8 py-4 text-white font-bold bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl hover:shadow-2xl hover:scale-105 transition-all disabled:opacity-50"
          >
            <Upload className="w-5 h-5" />
            Select File
          </button>
          <p className="text-xs text-gray-500">
            Supports all file types • Max 100MB
          </p>
        </div>
      )}
    </div>
  );
};

export default UploadArea;
