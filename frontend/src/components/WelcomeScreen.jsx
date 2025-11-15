import {
  Upload,
  Wallet,
  Shield,
  Sparkles,
  Zap,
  FileText,
  Loader2,
} from "lucide-react";

const WelcomeScreen = ({ loading, onConnectWallet, onCreateGuest }) => {
  const features = [
    {
      icon: Shield,
      title: "End-to-End Encrypted",
      desc: "Files encrypted before upload",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Zap,
      title: "Gasless Transactions",
      desc: "No gas fees, all sponsored",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: FileText,
      title: "Decentralized Storage",
      desc: "Stored on IPFS network",
      color: "from-emerald-500 to-teal-500",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] text-center px-4">
      {/* Hero Icon */}
      <div className="relative mb-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl blur-2xl opacity-40 animate-pulse"></div>
        <div className="relative p-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl shadow-2xl transform hover:scale-105 transition-transform">
          <Upload className="w-20 h-20 text-white" />
        </div>
      </div>

      {/* Hero Text */}
      <div className="space-y-4 mb-12">
        <h2 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-fade-in">
          Secure File Storage
        </h2>
        <p className="text-lg md:text-xl text-gray-600 max-w-3xl leading-relaxed">
          Upload encrypted files to IPFS with{" "}
          <span className="font-bold text-purple-600">zero gas fees</span>. Your
          files are encrypted, decentralized, and only accessible by you.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mb-16">
        <button
          onClick={onConnectWallet}
          disabled={loading}
          className="relative group px-10 py-5 text-lg font-bold text-white rounded-2xl hover:shadow-2xl hover:scale-105 transition-all disabled:opacity-50 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <span className="relative flex items-center justify-center gap-3">
            <Wallet className="w-5 h-5" />
            Connect Wallet
          </span>
        </button>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl">
        {features.map((feature, idx) => (
          <div key={idx} className="group relative">
            <div
              className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity`}
            ></div>
            <div className="relative p-6 bg-white rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all">
              <div
                className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}
              >
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600">{feature.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WelcomeScreen;
