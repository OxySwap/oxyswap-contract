const artifact = require('../build/artifacts/contracts/UniswapV2Factory.sol/UniswapV2Pair.json')

let Web3 = require('web3')

const initCodeHash = Web3.utils.keccak256(artifact.bytecode)

console.log('initCodeHash:' + initCodeHash)
