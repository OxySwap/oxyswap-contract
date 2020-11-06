import { ethers } from "hardhat";
import { printToFile } from './utils';

let name = process.env.CONTRACT_NAME ? process.env.CONTRACT_NAME : 'UniswapV2Factory';
let network = process.env.NETWORK ? process.env.NETWORK : 'rinkeby';
let feeToSetter = process.env.FEE_TO_SETTER ? process.env.FEE_TO_SETTER : '';

if (feeToSetter == '') {
  console.log('get invalid parameters!');
  process.exit(-1);
}

async function main() {
  console.log('name:', name);
  const factory = await ethers.getContractFactory(name);
  let contract = await factory.deploy(feeToSetter);
  
  await contract.deployed();
  printToFile(name, network, contract, [feeToSetter]);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
