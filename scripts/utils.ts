const fs = require('fs');
const path = require('path');

function printToFile(name: string, network: string, contract: any, args: any[]) {
  let fpath = path.resolve(__dirname, name + '_' + network + '.addr');
  fs.writeFileSync(fpath, contract.address);
  fs.appendFileSync(fpath, '\nnpx hardhat verify --network ' + network + ' ' + contract.address + ' ' + args.join(' '));
  console.log(contract.address);
  console.log(contract.deployTransaction.hash);
}

export {
    printToFile,
}