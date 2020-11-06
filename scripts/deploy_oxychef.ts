import { ethers } from "hardhat";
import { BigNumber } from '@ethersproject/bignumber';
import { printToFile } from './utils'

const fs = require('fs');
const path = require('path');
const { exec } = require("child_process");

let name = process.env.CONTRACT_NAME ? process.env.CONTRACT_NAME : 'OxyChef';
let network = process.env.NETWORK ? process.env.NETWORK : 'rinkeby';
let tokenAddr = process.env.TOKEN_ADDR ? process.env.TOKEN_ADDR : '';
let devAddr = process.env.DEV_ADDR ? process.env.DEV_ADDR : '';
let startBlock = process.env.START_BLOCK ? Number(process.env.START_BLOCK) : 0;
let bonusEndBlock = startBlock + 46500;
let oxyPerBlock = BigNumber.from('27208000000000000000');
//                                     1   51   51   5  

if (tokenAddr == '' || devAddr == '' || startBlock <= 0) {
  console.log('get invalid parameters!');
  process.exit(-1);
}

async function main() {
  console.log('name:', name);
  const factory = await ethers.getContractFactory(name);
  let contract = await factory.deploy(tokenAddr, devAddr, startBlock, bonusEndBlock, oxyPerBlock);
  
  await contract.deployed();
  printToFile(name, network, contract, [tokenAddr, devAddr, startBlock, bonusEndBlock, oxyPerBlock]);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
