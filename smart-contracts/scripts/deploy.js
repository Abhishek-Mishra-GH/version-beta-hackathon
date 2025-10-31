const hre = require("hardhat");

async function main() {
      const MedicalRecords = await hre.ethers.getContractFactory("MedicalRecords");
      const contract = await MedicalRecords.deploy();
      await contract.waitForDeployment();

      console.log("MedicalRecords deployed to:", await contract.getAddress());
}

main().catch((error) => {
      console.error(error);
      process.exitCode = 1;
});

