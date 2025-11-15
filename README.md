# 🚀 Decentralized File Uploader DApp

A production-ready decentralized file storage application built on **Arbitrum Sepolia** that enables users to upload, encrypt, store, and manage files on IPFS with blockchain-backed metadata storage. Features **Account Abstraction** via Biconomy for gasless transactions with automatic fallback.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Solidity](https://img.shields.io/badge/Solidity-0.8.28-orange.svg)
![React](https://img.shields.io/badge/React-18-blue.svg)
![Network](https://img.shields.io/badge/Network-Arbitrum%20Sepolia-purple.svg)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [Smart Contract](#-smart-contract)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### **Core Functionality**
- 📤 **Upload Files** - Drag & drop or click to upload (up to 100MB)
- 🔒 **End-to-End Encryption** - AES-256 encryption via Lighthouse SDK
- 📥 **Download Files** - Client-side decryption and download
- 👁️ **View Files** - Preview in browser (PDF, images, videos, documents)
- 🗑️ **Delete Files** - Remove from IPFS and blockchain
- 🔍 **Search & Filter** - Real-time file search by name or CID

### **Web3 Features**
- ⚡ **Gasless Transactions** - Account Abstraction via Biconomy (when available)
- 🔄 **Automatic Fallback** - Falls back to regular transactions if gasless fails
- 🔐 **Access Control** - Owner-only file operations
- 💾 **Persistent Storage** - Multi-strategy file loading (blockchain + local storage)
- 🌐 **Decentralized Storage** - Files stored on IPFS via Lighthouse
- 🔗 **Smart Contract Metadata** - On-chain file metadata storage

### **User Experience**
- 🎨 **Modern UI** - Beautiful gradient design with Tailwind CSS
- 📱 **Responsive** - Works on desktop, tablet, and mobile
- 🔔 **Toast Notifications** - User-friendly feedback messages
- ⚡ **Fast HMR** - Instant development updates with Vite
- 🎯 **Progress Indicators** - Real-time upload/download progress
- 🔌 **MetaMask Integration** - Seamless wallet connection

---

## 🛠️ Tech Stack

### **Frontend**
- **React 18** - Modern UI library
- **Vite** - Lightning-fast build tool
- **Tailwind CSS 3** - Utility-first CSS framework
- **ethers.js v6** - Ethereum library
- **Lucide React** - Beautiful icons

### **Blockchain**
- **Solidity 0.8.28** - Smart contract language
- **Hardhat** - Development environment
- **OpenZeppelin** - Secure contract libraries
- **Arbitrum Sepolia** - Layer-2 testnet (ChainID: 421614)

### **Web3 Services**
- **Biconomy SDK v4** - Account Abstraction
- **Lighthouse SDK** - IPFS storage with encryption
- **MetaMask** - Wallet provider

### **Storage**
- **IPFS** - Decentralized file storage
- **Claude Storage API** - Persistent key-value storage
- **LocalStorage** - Browser fallback storage

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│         Frontend (React + Vite)         │
│  - UI Components (Tailwind CSS)        │
│  - State Management (React Hooks)      │
│  - Web3 Integration (ethers.js v6)     │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│      Middleware Services Layer          │
│  - Biconomy Account Abstraction         │
│  - Lighthouse Storage (IPFS)            │
│  - MetaMask Wallet Integration          │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│    Blockchain Layer (Arbitrum Sepolia)  │
│  - Smart Contract (Solidity 0.8.28)    │
│  - File Metadata Storage                │
│  - On-chain Access Control              │
└─────────────────────────────────────────┘
```

---

## 📦 Prerequisites

Before you begin, ensure you have:

- **Node.js** (v18+ recommended)
- **npm** or **yarn**
- **MetaMask** browser extension
- **Arbitrum Sepolia testnet ETH** (get from faucets)

### Get Testnet ETH:
- [QuickNode Faucet](https://faucet.quicknode.com/arbitrum/sepolia)
- [Alchemy Faucet](https://www.alchemy.com/faucets/arbitrum-sepolia)

---

## 🚀 Installation

### **1. Clone the Repository**
```bash
git clone https://github.com/yourusername/file-uploader-dapp.git
cd file-uploader-dapp
```

### **2. Install Dependencies**
```bash
npm install
```

### **3. Set Up Environment Variables**
Create a `.env` file in the root directory:

```env
# Smart Contract
VITE_CONTRACT_ADDRESS=0xA779c57a79a76baC441f760E4F12037e1f51CaD9

# Lighthouse Storage (Required)
VITE_LIGHTHOUSE_API_KEY=your_lighthouse_api_key_here

# Biconomy Account Abstraction (Optional - app works without these)
VITE_BICONOMY_BUNDLER_URL=https://bundler.biconomy.io/api/v2/421614/YOUR_KEY
VITE_BICONOMY_PAYMASTER_API_KEY=your_paymaster_api_key_here
```

### **4. Get API Keys**

#### **Lighthouse API Key (Required):**
1. Go to [Lighthouse Dashboard](https://files.lighthouse.storage/)
2. Sign up / Log in
3. Generate API key
4. Copy to `.env` file

#### **Biconomy Keys (Optional):**
1. Go to [Biconomy Dashboard](https://dashboard.biconomy.io/)
2. Create a new project
3. Select Arbitrum Sepolia (421614)
4. Copy Bundler URL and Paymaster API key
5. Paste into `.env` file

**Note:** If Biconomy keys are not provided, the app automatically uses regular transactions (user pays gas).

---

## ⚙️ Configuration

### **Network Configuration**

The app is configured for **Arbitrum Sepolia** by default:

```javascript
{
  chainId: 421614,
  chainName: "Arbitrum Sepolia",
  rpcUrls: ["https://sepolia-rollup.arbitrum.io/rpc"],
  blockExplorerUrls: ["https://sepolia.arbiscan.io"],
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18
  }
}
```

### **Smart Contract**

Deployed at: `0xA779c57a79a76baC441f760E4F12037e1f51CaD9`

[View on Arbiscan](https://sepolia.arbiscan.io/address/0xA779c57a79a76baC441f760E4F12037e1f51CaD9)

---

## 💻 Usage

### **Start Development Server**
```bash
npm run dev
```

Visit: `http://localhost:5173`

### **Build for Production**
```bash
npm run build
```

### **Preview Production Build**
```bash
npm run preview
```

---

## 📱 How to Use the DApp

### **1. Connect Wallet**
- Click "Connect Wallet" button
- Approve MetaMask connection
- Ensure you're on Arbitrum Sepolia network

### **2. Upload Files**
- Drag & drop a file or click to browse
- Maximum file size: 100MB
- Progress bar shows upload status
- File appears in your list after upload

### **3. Manage Files**
- **View** - Click eye icon to preview in new tab
- **Download** - Click download icon to save locally
- **Delete** - Click trash icon (confirmation required)
- **Search** - Use search bar to filter files

### **4. Gasless Transactions**
- If Biconomy is configured and has credits:
  - First upload deploys your Smart Account (may require gas)
  - Subsequent uploads/deletes are gasless!
- If gasless fails or is not configured:
  - Automatic fallback to regular transactions
  - You pay gas fees, but everything still works

---

## 📜 Smart Contract

### **FileUploaderV3.sol**

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract FileUploaderV3 is Ownable, ReentrancyGuard {
    struct FileMetadata {
        string cid;           // IPFS Content ID
        string name;          // Original filename
        uint256 timestamp;    // Upload time
        address owner;        // File owner
    }
    
    mapping(address => FileMetadata[]) private userFiles;
    
    event FileUploaded(address indexed user, string cid, string name, uint256 timestamp);
    event FileDeleted(address indexed user, string cid);
    
    function uploadFile(string calldata cid, string calldata name) external;
    function deleteFile(string calldata cid) external;
    function getFiles(address user) external view returns (FileMetadata[] memory);
}
```

### **Key Features:**
- ✅ Owner-only access control
- ✅ ReentrancyGuard protection
- ✅ Gas-optimized with `calldata`
- ✅ Event emissions for indexing
- ✅ Duplicate upload prevention

---

## 📁 Project Structure

```
file-uploader-dapp/
├── public/                  # Static assets
├── src/
│   ├── components/         # React components
│   │   ├── Header.jsx
│   │   ├── WelcomeScreen.jsx
│   │   ├── UploadArea.jsx
│   │   ├── FilesList.jsx
│   │   ├── FileCard.jsx
│   │   ├── Footer.jsx
│   │   └── Toast.jsx
│   ├── services/           # Web3 services
│   │   └── biconomyService.js
│   ├── utils/              # Utility functions
│   │   ├── fileManager.js
│   │   └── web3Utils.js
│   ├── config/             # Configuration
│   │   └── constants.js
│   ├── App.jsx             # Main app component
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
├── contracts/              # Smart contracts
│   └── FileUploaderV3.sol
├── scripts/                # Deployment scripts
│   └── deploy.js
├── .env                    # Environment variables
├── .env.example            # Example env file
├── package.json
├── vite.config.js
├── tailwind.config.js
├── hardhat.config.js
└── README.md
```

---

## 🔧 Development

### **Available Scripts**

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run preview         # Preview production build

# Smart Contract
npm run compile         # Compile contracts
npm run deploy          # Deploy to network
npm run verify          # Verify on Arbiscan
```

### **Environment Variables**

```env
# Required
VITE_CONTRACT_ADDRESS=0x...
VITE_LIGHTHOUSE_API_KEY=your_key

# Optional (for gasless transactions)
VITE_BICONOMY_BUNDLER_URL=https://...
VITE_BICONOMY_PAYMASTER_API_KEY=your_key
```

---

## 🚢 Deployment

### **Frontend Deployment**

#### **Vercel (Recommended)**
```bash
npm run build
vercel --prod
```

#### **Netlify**
```bash
npm run build
netlify deploy --prod --dir=dist
```

#### **GitHub Pages**
```bash
npm run build
# Deploy dist folder to gh-pages branch
```

### **Smart Contract Deployment**

```bash
# Compile
npx hardhat compile

# Deploy to Arbitrum Sepolia
npx hardhat run scripts/deploy.js --network arbitrumSepolia

# Verify on Arbiscan
npx hardhat verify --network arbitrumSepolia <CONTRACT_ADDRESS>
```

---

## 🐛 Troubleshooting

### **Common Issues**

#### **"Please install MetaMask"**
- Install MetaMask browser extension
- Refresh the page

#### **"Wrong network"**
- Switch to Arbitrum Sepolia in MetaMask
- Or click the network switch prompt

#### **"Transaction failed"**
- Check you have enough testnet ETH
- Get ETH from faucets listed above

#### **"Upload failed"**
- Verify Lighthouse API key is correct
- Check file size (max 100MB)
- Try uploading a smaller file

#### **"Gasless transaction failed"**
- This is normal! App automatically falls back
- MetaMask will prompt for gas approval
- If you want gasless, add funds to Biconomy gas tank

#### **Files not loading after reconnect**
- This is now fixed with multi-strategy loading
- Files load from blockchain or local storage
- Reconnect wallet if needed

---

## 🔐 Security

### **Smart Contract Security**
- ✅ OpenZeppelin's `Ownable` and `ReentrancyGuard`
- ✅ Input validation on all functions
- ✅ Owner-only access control
- ✅ No private data stored on-chain

### **File Security**
- ✅ End-to-end AES-256 encryption
- ✅ Client-side encryption before upload
- ✅ Wallet-based key management
- ✅ No plaintext data leaves client

### **Best Practices**
- ✅ Never commit `.env` file
- ✅ Use testnet for development
- ✅ Audit smart contracts before mainnet
- ✅ Keep dependencies updated

---

## 🎯 Roadmap

### **Phase 1: Core Features** ✅
- [x] File upload/download/delete
- [x] IPFS storage with encryption
- [x] Smart contract integration
- [x] Account Abstraction

### **Phase 2: Enhancements** 🚧
- [ ] File sharing with other addresses
- [ ] Folder organization
- [ ] Batch operations
- [ ] Multi-chain support

### **Phase 3: Advanced** 📋
- [ ] NFT minting for files
- [ ] File versioning
- [ ] Analytics dashboard
- [ ] Mobile app

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### **Code Style**
- Use ESLint configuration
- Follow React best practices
- Write clean, commented code
- Test before submitting

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **Your Name** - *Initial work* - [GitHub](https://github.com/yourusername)

---

## 🙏 Acknowledgments

- [Biconomy](https://biconomy.io/) - Account Abstraction infrastructure
- [Lighthouse](https://lighthouse.storage/) - IPFS storage and encryption
- [OpenZeppelin](https://openzeppelin.com/) - Secure smart contract libraries
- [Arbitrum](https://arbitrum.io/) - Layer-2 scaling solution
- [ethers.js](https://docs.ethers.org/) - Ethereum library

---

## 📞 Support

- **Documentation**: [Project Wiki](https://github.com/yourusername/file-uploader-dapp/wiki)
- **Issues**: [GitHub Issues](https://github.com/yourusername/file-uploader-dapp/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/file-uploader-dapp/discussions)

---

## 🌟 Star History

If you find this project helpful, please consider giving it a star ⭐

[![Star History Chart](https://api.star-history.com/svg?repos=yourusername/file-uploader-dapp&type=Date)](https://star-history.com/#yourusername/file-uploader-dapp&Date)

---

## 📊 Stats

![GitHub stars](https://img.shields.io/github/stars/yourusername/file-uploader-dapp?style=social)
![GitHub forks](https://img.shields.io/github/forks/yourusername/file-uploader-dapp?style=social)
![GitHub issues](https://img.shields.io/github/issues/yourusername/file-uploader-dapp)
![GitHub pull requests](https://img.shields.io/github/issues-pr/yourusername/file-uploader-dapp)

---

<div align="center">

**Built with ❤️ using React, Solidity, and Web3**

[⬆ back to top](#-decentralized-file-uploader-dapp)

</div>