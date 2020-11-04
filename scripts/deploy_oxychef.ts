import { ethers } from "hardhat";

const fs = require('fs');
const path = require('path');
const { exec } = require("child_process");

const name = process.env.CONTRACT_NAME ? process.env.CONTRACT_NAME : 'OxyToken';

async function main() {
  console.log('name:', name);
  // If we had constructor arguments, they would be passed into deploy()
  // The address the Contract WILL have once mined
  let res = await exec('ls -a');
  console.log('res:', res);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
