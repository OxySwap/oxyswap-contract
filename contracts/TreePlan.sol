// SPDX-License-Identifier: MIT

pragma solidity ^0.6.12;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "./OxyToken.sol";

contract TreePlan is Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    IERC20 usdtToken;

    OxyToken oxyToken;

    uint256 decimalUsdt = 1e6;

    uint256 fixed_fee = 1000 * decimalUsdt;

    using SafeMath for uint256;

    struct User {
        address payable inviter;
        address payable self;
    }
    mapping(address => User) public root_mapping;
    mapping(address => User) public direct_mapping;
    mapping(address => uint256) public balances;

    function usdtBalanceOf(address payable user) public view returns (uint256) {
        return balances[user];
    }

    address payable public feeAdmin;

    constructor(IERC20 _usdtToken, OxyToken _oxyToken) public {
        usdtToken = _usdtToken;
        oxyToken = _oxyToken;
        feeAdmin = msg.sender;
    }

    function setAdmin(address payable _feeAdmin) external onlyOwner {
        feeAdmin = _feeAdmin;
    }

    function add_root(address payable _user) external onlyOwner {
        require(_user != address(0), "_user is invalid");
        require(
            root_mapping[_user].inviter == address(0),
            "Sender can't already exist in root_mapping"
        );

        User memory user = User(_user, _user);

        root_mapping[_user] = user;
        direct_mapping[_user] = user;
    }

    event Deposit(
        address indexed user,
        address indexed inviter,
        address indexed rootInviter,
        uint256 amount
    );

    function safeOxyTransfer(address _to, uint256 _amount) internal {
        uint256 oxyBal = oxyToken.balanceOf(address(this));
        if (_amount > oxyBal) {
            oxyToken.transfer(_to, oxyBal);
        } else {
            oxyToken.transfer(_to, _amount);
        }
    }

    function deposit(uint256 amount) public {

        // fixed_fee == 1000 U;
        require(amount == fixed_fee, "only 1000u is accepted");

        require(balances[msg.sender] <= fixed_fee, "no more than 1000u");

        require(
            direct_mapping[msg.sender].self != address(0),
            "<deposit> Sender should be in direct_mapping"
        );

        address payable inviter = direct_mapping[msg.sender].inviter;
        address payable rootInviter = root_mapping[msg.sender].inviter;

        if (inviter != rootInviter) {
            require(msg.sender != inviter);

            // inviter get 0.2 amt bonus. rootInviter get 0.1 amt bonus.
            uint256 inviter_bonus = amount.mul(2).div(10);
            uint256 rootInviter_bonus = amount.mul(1).div(10);
            uint256 reserved = amount.sub(inviter_bonus).sub(rootInviter_bonus);
            usdtToken.safeTransferFrom(
                address(msg.sender),
                inviter,
                inviter_bonus
            );
            usdtToken.safeTransferFrom(
                address(msg.sender),
                rootInviter,
                rootInviter_bonus
            );
            usdtToken.safeTransferFrom(
                address(msg.sender),
                feeAdmin,
                reserved
            );
        } else {

            // rootInviter get 0.3 amt bonus.
            uint256 rootInviter_bonus = amount.mul(3).div(10);
            uint256 reserved = amount.sub(rootInviter_bonus);
            usdtToken.safeTransferFrom(
                address(msg.sender),
                rootInviter,
                rootInviter_bonus
            );
            usdtToken.safeTransferFrom(
                address(msg.sender),
                address(this),
                reserved
            );
        }

        balances[msg.sender] = balances[msg.sender].add(fixed_fee);

        emit Deposit(msg.sender, inviter, rootInviter, amount);
    }

    function bind(address payable inviter) external {

        require(
            direct_mapping[msg.sender].inviter == address(0),
            "<bind> Sender should not exist in direct_mapping"
        );
        require(direct_mapping[inviter].self == inviter, "Inviter must exist");
        require(
            root_mapping[inviter].self == inviter,
            "root Inviter must exist"
        );

        direct_mapping[msg.sender] = User(inviter, msg.sender);
        root_mapping[msg.sender] = User(
            root_mapping[inviter].inviter,
            msg.sender
        );
    }

    function getRootInviter(address payable user)
        public
        view
        returns (address)
    {
        return root_mapping[user].inviter;
    }

    function getInviter(address payable user) public view returns (address) {
        return direct_mapping[user].inviter;
    }

    function fetchAll() external onlyOwner {
        feeAdmin.transfer(address(this).balance);
    }

}
