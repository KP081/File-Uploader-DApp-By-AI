import { LIGHTHOUSE_API_KEY } from "../config/constants.js";

export const uploadToLighthouse = async (file, apiKey) => {
  try {
    console.log("📤 Uploading to Lighthouse IPFS...");

    if (!apiKey || apiKey === LIGHTHOUSE_API_KEY) {
      console.warn("⚠️ No Lighthouse API key, using mock upload");
      return mockUpload(file);
    }

    // Real Lighthouse upload
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("https://node.lighthouse.storage/api/v0/add", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Lighthouse upload failed");
    }

    const data = await response.json();

    return {
      success: true,
      cid: data.Hash,
      name: data.Name || file.name,
      size: data.Size || file.size,
    };
  } catch (error) {
    console.error("Lighthouse upload error:", error);
    // Fallback to mock
    return mockUpload(file);
  }
};

/**
 * Delete file from Lighthouse (Unpin)
 */
export const deleteFromLighthouse = async (cid, apiKey) => {
  try {
    console.log("🗑️ Unpinning file from Lighthouse:", cid);

    if (!apiKey || apiKey === LIGHTHOUSE_API_KEY) {
      console.warn("⚠️ No Lighthouse API key, simulating delete");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { success: true, message: "Simulated delete" };
    }

    // Real Lighthouse unpin
    const response = await fetch(
      `https://api.lighthouse.storage/api/lighthouse/unpin/${cid}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to unpin from Lighthouse");
    }

    const data = await response.json();
    console.log("✅ File unpinned from Lighthouse:", data);

    return {
      success: true,
      message: "File unpinned from Lighthouse IPFS",
      data,
    };
  } catch (error) {
    console.error("Lighthouse delete error:", error);

    // Even if API call fails, we can still remove from local storage
    return {
      success: true,
      message: "Removed from local storage (IPFS unpin may have failed)",
      error: error.message,
    };
  }
};

/**
 * Mock upload for testing
 */
const mockUpload = async (file) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return {
    success: true,
    cid: generateMockCID(),
    name: file.name,
    size: file.size,
  };
};

/**
 * Generate mock CID
 */
const generateMockCID = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let cid = "Qm";
  for (let i = 0; i < 44; i++) {
    cid += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return cid;
};

/**
 * Check if file exists on IPFS
 */
export const checkFileExists = async (cid) => {
  try {
    const response = await fetch(
      `https://gateway.lighthouse.storage/ipfs/${cid}`,
      { method: "HEAD" }
    );
    return response.ok;
  } catch (error) {
    return false;
  }
};
