import { ethers } from "hardhat";

const fs = require('fs');
const path = require('path');
const { exec } = require("child_process");

const name = process.env.CONTRACT_NAME ? process.env.CONTRACT_NAME : 'OxyToken';

async function main() {
  console.log('name:', name);
  const factory = await ethers.getContractFactory(name);
  // If we had constructor arguments, they would be passed into deploy()
  let contract = await factory.deploy();
  // The address the Contract WILL have once mined
  let res = await exec('ls -a');
  console.log(res);
  console.log(contract.address);
  // The transaction that was sent to the network to deploy the Contract
  console.log(contract.deployTransaction.hash);
  // The contract is NOT deployed yet; we must wait until it is mined
  await contract.deployed();
  fs.writeFileSync(path.resolve(__dirname, name + '.addr'), contract.address);
}
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
