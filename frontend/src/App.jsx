import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Header from "./components/Header";
import WelcomeScreen from "./components/WelcomeScreen";
import UploadArea from "./components/UploadArea";
import FilesList from "./components/FilesList";
import Footer from "./components/Footer";
import Toast from "./components/Toast";
import {
  uploadFileToStorage,
  deleteFileFromStorage,
  loadUserFiles,
  downloadFileFromStorage,
  viewFileInNewTab,
} from "./utils/fileManager";
import {
  createBiconomySmartAccount,
  getSmartAccountAddress,
} from "./services/biconomyService";
import { isMetaMaskInstalled } from "./utils/web3Utils";
import { STORAGE_KEYS, MAX_FILE_SIZE } from "./config/constants";

export default function App() {
  const [account, setAccount] = useState(null);
  const [smartAccount, setSmartAccount] = useState(null);
  const [smartAccountAddress, setSmartAccountAddress] = useState(null);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const showToast = (message, type = "info") => {
    setToast({ message, type });
  };

  const connectWallet = async () => {
    try {
      if (!isMetaMaskInstalled()) {
        showToast("Please install MetaMask", "error");
        return;
      }

      setLoading(true);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const eoaAddress = await signer.getAddress();

      const biconomySmartAccount = await createBiconomySmartAccount();
      const accountAddress = await getSmartAccountAddress(biconomySmartAccount);

      setAccount(eoaAddress);
      setSmartAccount(biconomySmartAccount);
      setSmartAccountAddress(accountAddress);

      sessionStorage.setItem(STORAGE_KEYS.CONNECTED_ACCOUNT, eoaAddress);
      sessionStorage.setItem("smartAccountAddress", accountAddress);

      showToast("Wallet connected successfully", "success");

      await loadFiles(accountAddress);

      setLoading(false);
    } catch (error) {
      console.error("Connection error:", error);
      setLoading(false);

      if (error.code === 4001) {
        showToast("Connection rejected", "error");
      } else {
        showToast("Failed to connect wallet", "error");
      }
    }
  };

  const loadFiles = async (address) => {
    try {
      setLoading(true);
      const loadedFiles = await loadUserFiles(address);
      setFiles(loadedFiles);
      setLoading(false);
    } catch (error) {
      console.error("Load files error:", error);
      setFiles([]);
      setLoading(false);
    }
  };

  const uploadFile = async (file) => {
    if (!account) {
      showToast("Please connect wallet first", "error");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      showToast("File too large (max 100MB)", "error");
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      const result = await uploadFileToStorage(
        file,
        account,
        smartAccount,
        files,
        setUploadProgress,
        showToast
      );

      if (result.success) {
        setFiles(result.files);
        showToast("File uploaded successfully", "success");
      }

      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 500);
    } catch (error) {
      console.error("Upload error:", error);
      setUploading(false);
      setUploadProgress(0);

      if (error.code === 4001) {
        showToast("Transaction cancelled", "error");
      } else if (
        error.message?.includes("network") ||
        error.message?.includes("fetch")
      ) {
        showToast("Network error. Please try again", "error");
      } else {
        showToast("Upload failed. Please try again", "error");
      }
    }
  };

  const deleteFile = async (cid) => {
    if (!account) {
      showToast("Please connect wallet first", "error");
      return;
    }

    try {
      setUploadProgress(0);

      const result = await deleteFileFromStorage(
        cid,
        smartAccount,
        files,
        setUploadProgress,
        showToast
      );

      if (result.success) {
        setFiles(result.files);
      }

      setUploadProgress(0);
    } catch (error) {
      console.error("Delete error:", error);
      setUploadProgress(0);

      if (error.code === 4001) {
        showToast("Transaction cancelled", "error");
      } else if (
        error.message?.includes("network") ||
        error.message?.includes("fetch")
      ) {
        showToast("Network error. Please try again", "error");
      } else {
        showToast("Delete failed. Please try again", "error");
      }
    }
  };

  const downloadFile = async (file) => {
    try {
      setUploadProgress(0);
      await downloadFileFromStorage(file, setUploadProgress, showToast);
      setUploadProgress(0);
    } catch (error) {
      console.error("Download error:", error);
      setUploadProgress(0);
      showToast("Download failed", "error");
    }
  };

  const viewFile = async (file) => {
    try {
      await viewFileInNewTab(file);
    } catch (error) {
      console.error("View error:", error);
      showToast("Failed to open file", "error");
    }
  };

  const disconnect = () => {
    setAccount(null);
    setSmartAccount(null);
    setSmartAccountAddress(null);
    setFiles([]);
    sessionStorage.removeItem(STORAGE_KEYS.CONNECTED_ACCOUNT);
    sessionStorage.removeItem("smartAccountAddress");
    showToast("Wallet disconnected", "info");
  };

  useEffect(() => {
    const savedAccount = sessionStorage.getItem(STORAGE_KEYS.CONNECTED_ACCOUNT);
    const savedSmartAccount = sessionStorage.getItem("smartAccountAddress");

    if (savedAccount && savedSmartAccount) {
      connectWallet();
    }
  }, []);

  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          disconnect();
        } else if (
          account &&
          accounts[0].toLowerCase() !== account.toLowerCase()
        ) {
          disconnect();
          showToast("Account changed. Please reconnect", "info");
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener(
            "accountsChanged",
            handleAccountsChanged
          );
          window.ethereum.removeListener("chainChanged", handleChainChanged);
        }
      };
    }
  }, [account]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <Header
        account={account}
        smartAccount={smartAccountAddress}
        loading={loading}
        onConnectWallet={connectWallet}
        onDisconnect={disconnect}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!account ? (
          <WelcomeScreen loading={loading} onConnectWallet={connectWallet} />
        ) : (
          <div className="space-y-8">
            <UploadArea
              uploading={uploading}
              uploadProgress={uploadProgress}
              onUpload={uploadFile}
              disabled={!account}
            />

            <FilesList
              files={files}
              loading={loading}
              onDelete={deleteFile}
              onDownload={downloadFile}
              onView={viewFile}
              currentUserAddress={smartAccountAddress}
            />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
