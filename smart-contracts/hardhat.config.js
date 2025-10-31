require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
          arbitrumSepolia: {
               url: process.env.ARBITRUM_SEPOLIA_RPC,
               accounts: [`0x${process.env.PRIVATE_KEY}`],
          },
  },
};
