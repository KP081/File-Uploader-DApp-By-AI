import { Wallet, Shield, Loader2, LogOut, Lock, Zap } from "lucide-react";

const Header = ({
  account,
  smartAccount,
  loading,
  onConnectWallet,
  onDisconnect,
}) => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-gray-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur-md opacity-75 animate-pulse"></div>
              <div className="relative p-2.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl">
                <Shield className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                File Uploader DApp
              </h1>
              <p className="text-xs text-gray-600 flex items-center gap-1.5">
                <Lock className="w-3 h-3" />
                Encrypted • Gasless • Decentralized
              </p>
            </div>
          </div>

          {!account ? (
            <button
              onClick={onConnectWallet}
              disabled={loading}
              className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Wallet className="w-4 h-4" />
              )}
              Connect Wallet
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl blur-sm opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl">
                  <Zap className="w-4 h-4 text-emerald-600" />
                  <div className="flex flex-col">
                    <span className="text-xs text-emerald-600 font-bold">
                      Smart Account
                    </span>
                    <span className="text-sm font-mono font-bold text-emerald-700">
                      {smartAccount.slice(0, 6)}...{smartAccount.slice(-4)}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={onDisconnect}
                className="p-2.5 text-gray-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                title="Disconnect"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
