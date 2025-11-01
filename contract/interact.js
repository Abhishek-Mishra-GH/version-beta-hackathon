import { ethers } from "ethers";
import { MEDICAL_RECORDS_ABI } from "./MedicalRecordsABI.js"; // your ABI file

const CONTRACT_ADDRESS = "0xYourContractAddressHere";
const RPC_URL = "https://sepolia-rollup.arbitrum.io/rpc"; // Example: Arbitrum Sepolia RPC
const PRIVATE_KEY = "your-private-key"; // only for testing, never expose in frontend

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, MEDICAL_RECORDS_ABI, wallet);

  // Example read call
  const count = await contract.getRecordCount(wallet.address);
  console.log("Record count:", count.toString());

  // Example write transaction
  const tx = await contract.uploadRecord("bafyExampleCID");
  console.log("Transaction hash:", tx.hash);

  await tx.wait();
  console.log("Record uploaded!");
}

main().catch(console.error);
