const fs = require('fs');
const path = require('path');
const artifact = require('../build/artifacts/contracts/UniswapV2Factory.sol/UniswapV2Pair.json')

let Web3 = require('web3')

const initCodeHash = Web3.utils.keccak256(artifact.bytecode)
const permitHash = Web3.utils.keccak256('Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)')

fs.writeFileSync(path.resolve(__dirname, 'initCodeHash.code'), initCodeHash + '\n');
fs.writeFileSync(path.resolve(__dirname, 'permitHash.code'), permitHash + '\n');
console.log('initCodeHash:' + initCodeHash)
console.log('permitHash:' + permitHash)
