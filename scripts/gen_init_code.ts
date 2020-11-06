const fs = require('fs');
const path = require('path');
const artifact = require('../build/artifacts/contracts/UniswapV2Factory.sol/UniswapV2Pair.json')

let Web3 = require('web3')

const initCodeHash = Web3.utils.keccak256(artifact.bytecode)

fs.writeFileSync(path.resolve(__dirname, 'initCodeHash.code'), initCodeHash);
console.log('initCodeHash:' + initCodeHash)
