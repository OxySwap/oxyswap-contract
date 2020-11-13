// SPDX-License-Identifier: MIT

pragma solidity ^0.6.12;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CoCoCard is ERC721("CoCoCard", "CCC"), Ownable {

    constructor() public {
    }

}
