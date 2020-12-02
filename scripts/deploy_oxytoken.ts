import { ethers } from "hardhat";
import { printToFile } from './utils'

let name = process.env.CONTRACT_NAME ? process.env.CONTRACT_NAME : 'OxyToken';
let network = process.env.NETWORK ? process.env.NETWORK : 'rinkeby';

async function main() {
  console.log('name:', name);
  const factory = await ethers.getContractFactory(name);
  let contract = await factory.deploy();
  
  await contract.deployed();
  
  printToFile(name, network, contract, []);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
