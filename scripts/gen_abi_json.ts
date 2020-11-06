const fs = require('fs');
const path = require('path');

let path_map = {
    './../build/artifacts/@openzeppelin/contracts/token/ERC20/ERC20.sol/ERC20.json': '../../oxyswap_miningpool/src/sushi/lib/abi/erc20.json',
    './../build/artifacts/contracts/OxyChef.sol/OxyChef.json': '../../oxyswap_miningpool/src/sushi/lib/abi/masterchef.json',
    './../build/artifacts/contracts/OxyToken.sol/OxyToken.json': '../../oxyswap_miningpool/src/sushi/lib/abi/sushi.json',
    './../build/artifacts/contracts/UniswapV2Factory.sol/UniswapV2Pair.json': '../../oxyswap_miningpool/src/sushi/lib/abi/uni_v2_lp.json',
};

for (var key in path_map) {
    console.log(path_map[key]);
    const data = require(key).abi;
    let output_path = path.resolve(__dirname, path_map[key])
    fs.writeFileSync(output_path, JSON.stringify(data, null, 4))
}
