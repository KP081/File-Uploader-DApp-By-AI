import abi from "./abi.json";

// Smart Contract Configuration
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
export const CHAIN_ID = 421614; // Arbitrum Sepolia
export const CHAIN_NAME = "Arbitrum Sepolia";
export const RPC_URL = "https://sepolia-rollup.arbitrum.io/rpc";
export const BLOCK_EXPLORER = "https://sepolia.arbiscan.io";

// Lighthouse API
export const LIGHTHOUSE_API_KEY = import.meta.env.VITE_LIGHTHOUSE_API_KEY;
export const LIGHTHOUSE_GATEWAY = "https://gateway.lighthouse.storage/ipfs/";

// Storage Keys
export const STORAGE_KEYS = {
  CONNECTED_ACCOUNT: "connectedAccount",
  ACCOUNT_TYPE: "accountType",
  FILES_PREFIX: "files:",
};

// File Upload
export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

// Smart Contract ABI - Updated to match your deployed contract
export const CONTRACT_ABI = abi;
