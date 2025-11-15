import { ExternalLink } from "lucide-react";
import { BLOCK_EXPLORER } from "../config/constants.js";

const CONTRACT_ADDRESS = import.meta.env.CONTRACT_ADDRESS;

const Footer = () => {
  return (
    <footer className="mt-24 py-12 border-t-2 border-gray-200 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <div className="mb-6">
          <p className="text-sm font-bold text-gray-700 mb-3">
            Powered by <span className="text-blue-600">Biconomy AA</span> •{" "}
            <span className="text-purple-600">Lighthouse Storage</span> •{" "}
            <span className="text-emerald-600">Arbitrum Sepolia</span>
          </p>
          <p className="text-xs text-gray-600 flex items-center justify-center gap-2">
            🔒 All transactions are gasless and sponsored
          </p>
        </div>

        {CONTRACT_ADDRESS && (
          <a
            href={`${BLOCK_EXPLORER}/address/${CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-mono font-bold bg-white rounded-xl border-2 border-blue-200 hover:border-blue-300 transition-all"
          >
            {CONTRACT_ADDRESS.slice(0, 10)}...{CONTRACT_ADDRESS.slice(-8)}
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>
    </footer>
  );
};

export default Footer;
