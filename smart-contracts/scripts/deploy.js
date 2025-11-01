const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying HealthDataRegistry...");

  const HealthDataRegistry = await ethers.getContractFactory(
    "contracts/HealthDataRegistry.sol:HealthDataRegistry"
  );
  const contract = await HealthDataRegistry.deploy();

  await contract.waitForDeployment();
  console.log(`✅ Contract deployed at: ${contract.target}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
