import { useEffect } from "react";
import { CheckCircle, AlertCircle, X } from "lucide-react";

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className="fixed top-4 right-4 z-[9999] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl animate-fade-in border"
      style={{ zIndex: 9999 }}
    >
      <div
        className={`flex items-center gap-3 ${
          type === "success"
            ? "bg-emerald-500 text-white"
            : type === "error"
            ? "bg-rose-500 text-white"
            : "bg-blue-500 text-white"
        } px-6 py-4 rounded-2xl shadow-2xl`}
      >
        {type === "success" && <CheckCircle className="w-5 h-5" />}
        {type === "error" && <AlertCircle className="w-5 h-5" />}
        {type === "info" && <AlertCircle className="w-5 h-5" />}
        <p className="font-semibold">{message}</p>
        <button
          onClick={onClose}
          className="ml-2 hover:opacity-80 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
