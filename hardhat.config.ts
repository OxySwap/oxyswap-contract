import { HardhatUserConfig } from "hardhat/types";
import "@nomiclabs/hardhat-waffle";
import "hardhat-typechain";
import "hardhat-spdx-license-identifier";
import "@nomiclabs/hardhat-etherscan";

const fs = require('fs');

const infura_apikey = 'e98ef4d01e674347ac1ab57e2a572acf';

let pk = process.env.SECRET ? process.env.SECRET : fs.existsSync('.secret') ? fs.readFileSync(".secret").toString().trim() : '';
let etherscan_key = process.env.ETHERSCAN_KEY ? process.env.ETHERSCAN_KEY : fs.existsSync('.etherscan_key') ? fs.readFileSync(".etherscan_key").toString().trim(): '';

console.log('infura_apikey:', infura_apikey);
console.log('etherscan_key:', etherscan_key);

const settings = {
          "outputSelection": {
            "*": {
              "*": [
                "evm.bytecode.object",
                "evm.deployedBytecode.object",
                "abi",
                "evm.bytecode.sourceMap",
                "evm.deployedBytecode.sourceMap",
                "metadata"
              ],
              "": ["ast"],
            },
        },
        "evmVersion": "istanbul",
        "optimizer": {
          "enabled": true,
          "runs": 99999
        }
      };

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  solidity: {
    compilers: [
      { 
        version: "0.6.12", 
        settings: settings,
    }],
    overrides: {
      "contracts/UniswapV2Factory.sol": {
        version: "0.5.16",
        settings: settings,
      },
      "contracts/UniswapV2Route.sol": {
        version: "0.6.6",
        settings: settings,
      }
  }
  },
  networks: {
    hardhat: {},
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${infura_apikey}`,
      accounts: [pk],
    },
    ropsten: {
      url: `https://ropsten.infura.io/v3/${infura_apikey}`,
      accounts: [pk],
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${infura_apikey}`,
      accounts: [pk],
    },
  },
  spdxLicenseIdentifier: {
    overwrite: true,
    runOnCompile: true,
  },
  etherscan: {
    apiKey: etherscan_key,
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './build/cache',
    artifacts: './build/artifacts'
  }
};
export default config;
