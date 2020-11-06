import { ethers } from "hardhat";
import { printToFile } from './utils';

const fs = require('fs');
const path = require('path');

const NID_MAPPING = {
  mainnet: '1',
  ropsten: '3',
  rinkeby: '4',
  goerli: '5',
  kovan: '42',
};

const WETH: any = {
  mainnet: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  ropsten: '0xc778417E063141139Fce010982780140Aa0cD5Ab',
  rinkeby: '0xc778417E063141139Fce010982780140Aa0cD5Ab',
  goerli: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
  kovan: '0xd0A1E359811322d97991E03f863a0C30C2cF029C'
};

let name = process.env.CONTRACT_NAME ? process.env.CONTRACT_NAME : 'UniswapV2Router02';
let factoryAddr = process.env.FACTORY_ADDR ? process.env.FACTORY_ADDR : '';
let network: string = process.env.NETWORK ? process.env.NETWORK : 'rinkeby';

if (factoryAddr == '') {
  console.log('get invalid parameters!');
  process.exit(-1);
}

console.log(WETH[network]);

async function main() {
  console.log('name:', name);
  const factory = await ethers.getContractFactory(name);
  let contract = await factory.deploy(factoryAddr, WETH[network]);
  
  await contract.deployed();
  printToFile(name, network, contract, [factoryAddr, WETH[network]]);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
