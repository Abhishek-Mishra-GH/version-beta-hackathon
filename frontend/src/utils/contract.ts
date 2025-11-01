// src/utils/contract.ts
import { ethers } from "ethers";
// import { MEDICAL_RECORDS_ABI } from "../abi/MedicalRecordsABI";
// import {  abi } from "../abi/HealthDataRegistry.json"
export const abi = [
  {
    "inputs": [
      { "internalType": "string", "name": "patientId", "type": "string" },
      { "internalType": "string", "name": "cid", "type": "string" },
      { "internalType": "string", "name": "metadata", "type": "string" }
    ],
    "name": "addRecord",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "string", "name": "patientId", "type": "string" }],
    "name": "getRecords",
    "outputs": [
      {
        "components": [
          { "internalType": "string", "name": "cid", "type": "string" },
          { "internalType": "string", "name": "metadata", "type": "string" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" }
        ],
        "internalType": "struct HealthDataRegistry.Record[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "patientId", "type": "string" },
      { "internalType": "string", "name": "doctorId", "type": "string" }
    ],
    "name": "requestAccess",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "patientId", "type": "string" },
      { "internalType": "string", "name": "doctorId", "type": "string" },
      { "internalType": "uint256", "name": "durationSeconds", "type": "uint256" }
    ],
    "name": "grantAccess",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "patientId", "type": "string" },
      { "internalType": "string", "name": "doctorId", "type": "string" }
    ],
    "name": "revokeAccess",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "patientId", "type": "string" },
      { "internalType": "string", "name": "doctorId", "type": "string" }
    ],
    "name": "isAccessGranted",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "patientId", "type": "string" },
      { "internalType": "string", "name": "doctorId", "type": "string" }
    ],
    "name": "getAccessExpiry",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "string", "name": "patientId", "type": "string" },
      { "indexed": false, "internalType": "string", "name": "cid", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "RecordAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "string", "name": "patientId", "type": "string" },
      { "indexed": false, "internalType": "string", "name": "doctorId", "type": "string" }
    ],
    "name": "AccessRequested",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "string", "name": "patientId", "type": "string" },
      { "indexed": false, "internalType": "string", "name": "doctorId", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "expiry", "type": "uint256" }
    ],
    "name": "AccessGranted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "string", "name": "patientId", "type": "string" },
      { "indexed": false, "internalType": "string", "name": "doctorId", "type": "string" }
    ],
    "name": "AccessRevoked",
    "type": "event"
  }
]

const CONTRACT_ADDRESS = "0x2444B22aff2E98d36D31aF42E2979eF809E2d836";

export async function getContract() {
  if (!window.ethereum) throw new Error("MetaMask not installed");
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
  return contract;
}
