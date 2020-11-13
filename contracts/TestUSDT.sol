// SPDX-License-Identifier: MIT

pragma solidity ^0.6.12;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TestUSDT is ERC20("TestUSDT Token", "TUSDT"), Ownable {

    constructor() public {
        _mint(msg.sender, 10 ** 9 * 10 ** 6);
        _setupDecimals(6);
    }
}
