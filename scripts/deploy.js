// import ContractArtifact from "../src/artifacts/contracts/WarrantyCard.sol/WarrantyCard.json";
const hre = require("hardhat");

async function main() {

  const Lock = await hre.ethers.getContractFactory("WarrantyCard");
  const lock = await Lock.deploy();

  await lock.deployed();

  console.log(
    `Lock with 1 ETH and unlock timestamp deployed to ${lock.address}`
  );

  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // const contract = await deployContract(deployer, ContractArtifact);
  // console.log("Contract deployed at address:", contract.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
