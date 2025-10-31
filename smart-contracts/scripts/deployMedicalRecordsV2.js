const hre = require("hardhat");

async function main() {
  const MedicalRecordsV2 = await hre.ethers.getContractFactory(
    "MedicalRecordsV2"
  );
  const contract = await MedicalRecordsV2.deploy();
  await contract.waitForDeployment();

  console.log("MedicalRecords deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
