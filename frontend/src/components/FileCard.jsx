import { useState } from "react";
import {
  FileText,
  Trash2,
  Download,
  Clock,
  Loader2,
  Copy,
  Lock,
  Eye,
} from "lucide-react";
import { formatFileSize, formatTimestamp } from "../utils/web3Utils";

const FileCard = ({
  file,
  onDelete,
  onDownload,
  onView,
  currentUserAddress,
}) => {
  const [deleting, setDeleting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [viewing, setViewing] = useState(false);
  const [copied, setCopied] = useState(false);

  const isOwner =
    currentUserAddress &&
    file.owner &&
    currentUserAddress.toLowerCase() === file.owner.toLowerCase();

  const handleDelete = async () => {
    if (!isOwner) {
      alert("You can only delete your own files!");
      return;
    }

    if (
      window.confirm(
        "Delete this file permanently from Lighthouse and Blockchain?"
      )
    ) {
      setDeleting(true);
      try {
        await onDelete(file.cid);
      } catch (error) {
        alert("Failed to delete file. Please try again.");
      }
      setDeleting(false);
    }
  };

  const handleDownload = async () => {
    if (!isOwner) {
      alert("Access Denied: You can only download files you uploaded!");
      return;
    }

    setDownloading(true);
    try {
      await onDownload(file);
    } catch (error) {
      alert("Failed to download file. Please try again.");
    }
    setDownloading(false);
  };

  const handleView = async () => {
    if (!isOwner) {
      alert("Access Denied: You can only view files you uploaded!");
      return;
    }

    setViewing(true);
    try {
      await onView(file);
    } catch (error) {
      alert("Failed to view file. Please try again.");
    }
    setViewing(false);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(file.cid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`group bg-white rounded-2xl border-2 p-6 hover:shadow-2xl transition-all ${
        isOwner
          ? "border-gray-200 hover:border-blue-300"
          : "border-gray-300 opacity-75"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div
            className={`p-3 rounded-xl group-hover:scale-110 transition-transform ${
              isOwner
                ? "bg-gradient-to-br from-blue-500 to-purple-600"
                : "bg-gray-400"
            }`}
          >
            {isOwner ? (
              <FileText className="w-6 h-6 text-white" />
            ) : (
              <Lock className="w-6 h-6 text-white" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3
                className={`text-lg font-bold truncate transition-colors ${
                  isOwner
                    ? "text-gray-900 group-hover:text-blue-600"
                    : "text-gray-500"
                }`}
              >
                {file.name}
              </h3>
              {file.encrypted && (
                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-lg font-bold">
                  🔐 Encrypted
                </span>
              )}
              {!isOwner && (
                <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-lg font-bold">
                  🔒 Private
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mb-3">
              <p className="text-xs text-gray-500 font-mono truncate max-w-[250px]">
                {file.cid}
              </p>
              <button
                onClick={handleCopy}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                title="Copy CID"
              >
                {copied ? (
                  <span className="text-xs text-emerald-600 font-bold">✓</span>
                ) : (
                  <Copy className="w-3.5 h-3.5 text-gray-400" />
                )}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 text-gray-600">
                <Clock className="w-3.5 h-3.5" />
                <span className="font-medium">
                  {formatTimestamp(file.timestamp)}
                </span>
              </div>
              {file.size && (
                <div className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg font-bold">
                  {formatFileSize(file.size)}
                </div>
              )}
              <div className="px-2 py-1 bg-purple-50 text-purple-700 rounded-lg font-bold text-xs">
                Owner: {file.owner.slice(0, 6)}...{file.owner.slice(-4)}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {isOwner ? (
            <>
              <button
                onClick={handleView}
                disabled={viewing}
                className="p-3 text-green-600 hover:bg-green-50 rounded-xl transition-all hover:scale-110 disabled:opacity-50"
                title="View File"
              >
                {viewing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-all hover:scale-110 disabled:opacity-50"
                title="Download File"
              >
                {downloading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Download className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="p-3 text-rose-600 hover:bg-rose-50 rounded-xl transition-all hover:scale-110 disabled:opacity-50"
                title="Delete File"
              >
                {deleting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Trash2 className="w-5 h-5" />
                )}
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl">
              <Lock className="w-4 h-4 text-gray-500" />
              <span className="text-xs text-gray-600 font-medium">
                Access Denied
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileCard;
