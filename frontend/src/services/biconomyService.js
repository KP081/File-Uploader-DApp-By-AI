import { ethers } from "ethers";
import { createSmartAccountClient } from "@biconomy/account";

const BUNDLER_URL = import.meta.env.VITE_BICONOMY_BUNDLER_URL;
const PAYMASTER_API_KEY = import.meta.env.VITE_BICONOMY_PAYMASTER_API_KEY;
const CHAIN_ID = 421614; // Arbitrum Sepolia

// Create Biconomy Smart Account

export const createBiconomySmartAccount = async () => {
  try {
    if (!window.ethereum) {
      throw new Error("MetaMask not found");
    }

    if (!BUNDLER_URL || !PAYMASTER_API_KEY) {
      console.error("Biconomy credentials missing");
      return null;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const network = await provider.getNetwork();
    if (Number(network.chainId) !== CHAIN_ID) {
      console.error("Wrong network");
      return null;
    }

    const smartAccount = await createSmartAccountClient({
      signer: signer,
      bundlerUrl: BUNDLER_URL,
      biconomyPaymasterApiKey: PAYMASTER_API_KEY,
      chainId: CHAIN_ID,
    });

    const accountAddress = await smartAccount.getAccountAddress();
    if (!accountAddress) {
      throw new Error("Failed to get Smart Account address");
    }

    return smartAccount;
  } catch (error) {
    console.error("Smart Account creation failed:", error);
    return null;
  }
};

// Execute gasless transaction with automatic fallbacks

export const executeGaslessTransaction = async (
  smartAccount,
  transaction,
  contractFunction = null
) => {
  // No smart account = use regular transaction
  if (!smartAccount) {
    return await executeRegularTransaction(transaction, contractFunction);
  }

  try {
    if (!transaction || !transaction.to || !transaction.data) {
      throw new Error("Invalid transaction structure");
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const feeData = await provider.getFeeData();

    const txWithGas = {
      to: transaction.to,
      data: transaction.data,
      maxFeePerGas: "0x" + feeData.maxFeePerGas.toString(16),
      maxPriorityFeePerGas: "0x" + feeData.maxPriorityFeePerGas.toString(16),
    };

    const userOpResponse = await smartAccount.sendTransaction(txWithGas, {
      paymasterServiceData: {
        mode: "SPONSORED",
      },
    });

    const { transactionHash } = await userOpResponse.waitForTxHash();

    if (!transactionHash) {
      throw new Error("No transaction hash received");
    }

    const receipt = await userOpResponse.wait();

    return {
      success: true,
      hash: transactionHash,
      receipt: receipt,
      gasless: true,
      message: "Transaction completed",
    };
  } catch (error) {
    console.error("Gasless transaction failed:", error);

    // Comprehensive error detection for fallback
    const shouldFallback =
      // Rate limit errors
      error.message?.includes("429") ||
      error.message?.includes("rate limit") ||
      error.message?.includes("Too many requests") ||
      // Server errors
      error.message?.includes("500") ||
      error.message?.includes("Internal Server") ||
      // Bundler errors
      error.message?.includes("400") ||
      error.message?.includes("520") ||
      error.message?.includes("bundler") ||
      error.message?.includes("Bundler") ||
      // Paymaster errors
      error.message?.includes("paymaster") ||
      error.message?.includes("Paymaster") ||
      error.message?.includes("sponsor") ||
      // Gas errors
      error.message?.includes("gas estimator") ||
      error.message?.includes("maxFeePerGas") ||
      // Generic errors
      error.message?.includes("parse error") ||
      error.message?.includes("failed");

    if (shouldFallback) {
      console.log("Falling back to regular transaction...");
      return await executeRegularTransaction(transaction, contractFunction);
    }

    // User rejection
    if (error.message?.includes("user rejected") || error.code === 4001) {
      throw new Error("Transaction rejected by user");
    }

    // Unknown error - still try fallback
    console.log("Unknown error, attempting fallback...");
    return await executeRegularTransaction(transaction, contractFunction);
  }
};

// Execute regular transaction (fallback)

const executeRegularTransaction = async (
  transaction,
  contractFunction = null
) => {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    let txResponse;

    if (contractFunction) {
      txResponse = await contractFunction();
    } else {
      const feeData = await provider.getFeeData();

      const gasEstimate = await provider.estimateGas({
        to: transaction.to,
        data: transaction.data,
        from: await signer.getAddress(),
      });

      txResponse = await signer.sendTransaction({
        to: transaction.to,
        data: transaction.data,
        gasLimit: gasEstimate,
        maxFeePerGas: feeData.maxFeePerGas,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
      });
    }

    const receipt = await txResponse.wait();

    if (!receipt) {
      throw new Error("Transaction receipt not received");
    }

    return {
      success: true,
      hash: receipt.hash,
      receipt: receipt,
      gasless: false,
      message: "Transaction completed",
    };
  } catch (error) {
    console.error("Regular transaction failed:", error);

    if (error.code === 4001) {
      throw new Error("Transaction rejected by user");
    }

    if (error.message?.includes("Failed to fetch")) {
      throw new Error("Network error. Please try again");
    }

    if (error.message?.includes("insufficient funds")) {
      throw new Error("Insufficient funds for gas");
    }

    throw new Error(error.message || "Transaction failed");
  }
};

// Get Smart Account address

export const getSmartAccountAddress = async (smartAccount) => {
  try {
    if (!smartAccount) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      return await signer.getAddress();
    }

    const address = await smartAccount.getAccountAddress();

    if (!address) {
      throw new Error("No address returned");
    }

    return address;
  } catch (error) {
    console.error("Get address error:", error);

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return await signer.getAddress();
  }
};
