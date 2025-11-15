import lighthouse from "@lighthouse-web3/sdk";
import { ethers } from "ethers";
import axios from "axios";
import {
  CONTRACT_ADDRESS,
  LIGHTHOUSE_API_KEY,
  CONTRACT_ABI,
} from "../config/constants";
import {
  createBiconomySmartAccount,
  executeGaslessTransaction,
  getSmartAccountAddress,
} from "../services/biconomyService";

/**
 * Storage helpers
 */
const hasClaudeStorage = () => {
  return (
    typeof window !== "undefined" &&
    typeof window.storage !== "undefined" &&
    typeof window.storage.get === "function"
  );
};

const getFromStorage = async (key) => {
  if (hasClaudeStorage()) {
    try {
      const result = await window.storage.get(key);
      return result && result.value ? result.value : null;
    } catch (error) {
      return null;
    }
  } else {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }
};

const setToStorage = async (key, value) => {
  if (hasClaudeStorage()) {
    try {
      await window.storage.set(key, value);
      return true;
    } catch (error) {
      return false;
    }
  } else {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      return false;
    }
  }
};

/**
 * Sign authentication message for Lighthouse
 */
const signAuthMessage = async (walletAddress) => {
  if (!window.ethereum) {
    throw new Error("MetaMask not found");
  }

  try {
    const { message } = (await lighthouse.getAuthMessage(walletAddress)).data;

    const signature = await window.ethereum.request({
      method: "personal_sign",
      params: [message, walletAddress],
    });

    return { signature, signerAddress: walletAddress };
  } catch (error) {
    console.error("❌ Error signing message:", error);
    throw error;
  }
};

/**
 * Progress callback for upload
 */
const createProgressCallback = (setProgress) => {
  return (progressData) => {
    const percentage = Math.round(
      (progressData.uploaded / progressData.total) * 100
    );
    setProgress(percentage);
  };
};

/**
 * Upload encrypted file to Lighthouse + Smart Contract (WITH FALLBACK)
 */
export const uploadFileToStorage = async (
  file,
  address,
  smartAccount,
  currentFiles,
  setProgress,
  showToast
) => {
  try {
    if (!LIGHTHOUSE_API_KEY) {
      throw new Error("Lighthouse API key not configured");
    }

    setProgress(10);

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const eoaAddress = await signer.getAddress();

    const encryptionAuth = await signAuthMessage(eoaAddress);
    if (!encryptionAuth) {
      throw new Error("Signature failed");
    }

    const { signature, signerAddress } = encryptionAuth;

    setProgress(30);

    const progressCallback = createProgressCallback(setProgress);

    const output = await lighthouse.uploadEncrypted(
      [file],
      LIGHTHOUSE_API_KEY,
      signerAddress,
      signature,
      progressCallback
    );

    const cid = output.data[0].Hash;
    setProgress(70);

    const accountAddress = await getSmartAccountAddress(smartAccount);

    setProgress(75);

    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      signer
    );
    const data = contract.interface.encodeFunctionData("uploadFile", [
      cid,
      file.name,
    ]);

    const transaction = {
      to: CONTRACT_ADDRESS,
      data: data,
    };

    setProgress(80);

    const result = await executeGaslessTransaction(
      smartAccount,
      transaction,
      async () => await contract.uploadFile(cid, file.name)
    );

    if (!result.success) {
      throw new Error("Transaction failed");
    }

    setProgress(90);

    const newFile = {
      cid: cid,
      name: file.name,
      size: file.size,
      type: file.type,
      timestamp: Date.now(),
      owner: accountAddress,
      uploadedAt: new Date().toISOString(),
      encrypted: true,
      txHash: result.hash,
      gasless: result.gasless,
    };

    const updatedFiles = [newFile, ...currentFiles];

    const storageKey = `files:${accountAddress}`;
    const eoaStorageKey = `files:${eoaAddress}`;

    await setToStorage(storageKey, JSON.stringify(updatedFiles));
    if (accountAddress !== eoaAddress) {
      await setToStorage(eoaStorageKey, JSON.stringify(updatedFiles));
    }

    setProgress(100);

    return {
      success: true,
      files: updatedFiles,
      file: newFile,
      gasless: result.gasless,
    };
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};

/**
 * Decrypt and download file from Lighthouse
 */
export const downloadFileFromStorage = async (file, setProgress, showToast) => {
  try {
    setProgress(10);

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    const messageRequested = (await lighthouse.getAuthMessage(address)).data
      .message;
    const signedMessage = await signer.signMessage(messageRequested);

    setProgress(40);

    const keyObject = await lighthouse.fetchEncryptionKey(
      file.cid,
      address,
      signedMessage
    );

    setProgress(60);

    const metadata = await lighthouse.getFileInfo(file.cid);
    const fileType =
      metadata?.mimeType || file.type || "application/octet-stream";

    setProgress(75);

    const decrypted = await lighthouse.decryptFile(
      file.cid,
      keyObject.data.key,
      fileType
    );

    setProgress(90);

    const url = URL.createObjectURL(decrypted);

    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => URL.revokeObjectURL(url), 100);

    setProgress(100);
    showToast("Download successful!", "success");

    return {
      success: true,
      url: url,
      name: file.name,
    };
  } catch (error) {
    console.error("Download error:", error);
    throw new Error("Failed to download file");
  }
};

/**
 * View file in new tab
 */
export const viewFileInNewTab = async (file) => {
  try {
    if (!window.ethereum) throw new Error("MetaMask not found");

    const newTab = window.open("", "_blank");
    if (!newTab) {
      throw new Error("Popup blocked! Please allow popups for this site.");
    }

    newTab.document.write(`
      <html>
        <head>
          <title>${file.name}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
            }
            .loader {
              width: 50px;
              height: 50px;
              border: 4px solid rgba(255,255,255,0.3);
              border-top: 4px solid white;
              border-radius: 50%;
              animation: spin 1s linear infinite;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            h2 { margin-top: 20px; font-weight: 600; }
            p { opacity: 0.9; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="loader"></div>
          <h2>Decrypting ${file.name}</h2>
          <p>Please wait...</p>
        </body>
      </html>
    `);
    newTab.document.close();

    await window.ethereum.request({ method: "eth_requestAccounts" });
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const publicKey = await signer.getAddress();

    const { message } = (await lighthouse.getAuthMessage(publicKey)).data;
    const signedMessage = await signer.signMessage(message);

    const keyResponse = await lighthouse.fetchEncryptionKey(
      file.cid,
      publicKey,
      signedMessage
    );
    const decryptionKey = keyResponse.data.key;

    const decryptedFile = await lighthouse.decryptFile(file.cid, decryptionKey);

    const extension = file.name.split(".").pop().toLowerCase();
    const mimeTypeMap = {
      pdf: "application/pdf",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
      mp4: "video/mp4",
      mp3: "audio/mpeg",
      txt: "text/plain",
      html: "text/html",
      json: "application/json",
      zip: "application/zip",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      xls: "application/vnd.ms-excel",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };
    const mimeType = mimeTypeMap[extension] || "application/octet-stream";

    const blob = new Blob([decryptedFile], { type: mimeType });
    const fileURL = URL.createObjectURL(blob);

    newTab.location.href = fileURL;

    return { success: true, url: fileURL };
  } catch (error) {
    console.error("View error:", error);
    alert("Failed to view file");
    throw error;
  }
};

/**
 * Get all uploads from Lighthouse
 */
const getUploads = async () => {
  try {
    const response = await lighthouse.getUploads(LIGHTHOUSE_API_KEY, null);
    return response.data.fileList;
  } catch (error) {
    console.error("Get uploads error:", error);
    return [];
  }
};

/**
 * Delete file from Lighthouse + Smart Contract (WITH GASLESS + FALLBACK)
 */
export const deleteFileFromStorage = async (
  cid,
  smartAccount,
  currentFiles,
  setProgress,
  showToast
) => {
  try {
    setProgress(10);

    const filesInfo = await getUploads();

    setProgress(30);

    const fileToDelete = filesInfo.find((file) => file.cid === cid);

    if (!fileToDelete) {
      throw new Error("File not found");
    }

    setProgress(50);

    const url = `https://api.lighthouse.storage/api/user/delete_file?id=${fileToDelete.id}`;
    await axios.delete(url, {
      headers: {
        Authorization: `Bearer ${LIGHTHOUSE_API_KEY}`,
      },
    });

    setProgress(70);

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const eoaAddress = await signer.getAddress();
    const accountAddress = await getSmartAccountAddress(smartAccount);

    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      signer
    );
    const data = contract.interface.encodeFunctionData("deleteFile", [cid]);

    const transaction = {
      to: CONTRACT_ADDRESS,
      data: data,
    };

    setProgress(80);

    const result = await executeGaslessTransaction(
      smartAccount,
      transaction,
      async () => await contract.deleteFile(cid)
    );

    if (!result.success) {
      throw new Error("Transaction failed");
    }

    setProgress(90);

    const updatedFiles = currentFiles.filter((f) => f.cid !== cid);

    const storageKey = `files:${accountAddress}`;
    const eoaStorageKey = `files:${eoaAddress}`;

    await setToStorage(storageKey, JSON.stringify(updatedFiles));
    if (accountAddress !== eoaAddress) {
      await setToStorage(eoaStorageKey, JSON.stringify(updatedFiles));
    }

    setProgress(100);
    showToast("File deleted successfully!", "success");

    return {
      success: true,
      files: updatedFiles,
      gasless: result.gasless,
    };
  } catch (error) {
    console.error("Delete error:", error);
    throw error;
  }
};

/**
 * Load user files from Smart Contract with multiple fallback strategies
 */
export const loadUserFiles = async (accountAddress) => {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      provider
    );

    let eoaAddress = null;
    try {
      const signer = await provider.getSigner();
      eoaAddress = await signer.getAddress();
    } catch (e) {
      // Silent fail
    }

    // Strategy 1: Load from Smart Contract
    try {
      const files = await contract.getFiles(accountAddress);

      if (files && files.length > 0) {
        const formatted = files.map((f) => ({
          name: f.name,
          cid: f.cid,
          timestamp: Number(f.timestamp) * 1000,
          owner: f.owner,
          uploadedAt: new Date(Number(f.timestamp) * 1000).toISOString(),
          encrypted: true,
        }));

        const storageKey = `files:${accountAddress}`;
        const eoaStorageKey = `files:${eoaAddress}`;

        await setToStorage(storageKey, JSON.stringify(formatted));
        if (eoaAddress && accountAddress !== eoaAddress) {
          await setToStorage(eoaStorageKey, JSON.stringify(formatted));
        }

        return formatted;
      }
    } catch (contractError) {
      // Try storage fallback
    }

    // Strategy 2: Load from storage using account address
    try {
      const storageKey = `files:${accountAddress}`;
      const data = await getFromStorage(storageKey);

      if (data) {
        const files = JSON.parse(data);
        if (files && files.length > 0) {
          return files.sort((a, b) => b.timestamp - a.timestamp);
        }
      }
    } catch (storageError) {
      // Try EOA fallback
    }

    // Strategy 3: Load from storage using EOA address
    if (eoaAddress && eoaAddress !== accountAddress) {
      try {
        const eoaStorageKey = `files:${eoaAddress}`;
        const data = await getFromStorage(eoaStorageKey);

        if (data) {
          const files = JSON.parse(data);
          if (files && files.length > 0) {
            const storageKey = `files:${accountAddress}`;
            await setToStorage(storageKey, JSON.stringify(files));

            return files.sort((a, b) => b.timestamp - a.timestamp);
          }
        }
      } catch (eoaStorageError) {
        // All strategies failed
      }
    }

    return [];
  } catch (error) {
    console.error("Load files error:", error);
    return [];
  }
};
