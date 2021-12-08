// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";

async function main() {
  const DateTime = await ethers.getContractFactory('DateTime');
  console.log('Deploying DateTime');
  const dateTime = await DateTime.deploy();
  await dateTime.deployed();
  console.log('DateTime deployed to:', dateTime.address);
  //Localhost : 
  // 0x050c5DfA3A709972cB4eBf598637A34AdfcEfCE9
  // 0x16c8DF2EB385b220e1AB77981673Dd53862F65bd
  //RinkeBy deployed : 0x6CFa5500FE15055d2C54897dEB2deA6030650856
  
  const AvgPrice = await ethers.getContractFactory('AvgPrice');
  console.log('Deploying AvgPrice...');
  const avgPrice = await AvgPrice.deploy(dateTime.address);
  await avgPrice.deployed();
  console.log('AvgPrice deployed to:', avgPrice.address);  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
