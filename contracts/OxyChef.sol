// SPDX-License-Identifier: MIT

/*

website: oxy.finance

This project was forked from SUSHI and YUNO projects.

Unless those projects have severe vulnerabilities, this contract will be fine

*/

pragma solidity ^0.6.12;

import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./OxyToken.sol";

contract OxyChef is Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    // Info of each user.
    struct UserInfo {
        uint256 amount;     // How many LP tokens the user has provided.
        uint256 rewardDebt; // Reward debt. See explanation below.
        //
        // We do some fancy math here. Basically, any point in time, the amount of OXYs
        // entitled to a user but is pending to be distributed is:
        //
        //   pending reward = (user.amount * pool.accOxyPerShare) - user.rewardDebt
        //
        // Whenever a user deposits or withdraws LP tokens to a pool. Here's what happens:
        //   1. The pool's `accOxyPerShare` (and `lastRewardBlock`) gets updated.
        //   2. User receives the pending reward sent to his/her address.
        //   3. User's `amount` gets updated.
        //   4. User's `rewardDebt` gets updated.
    }

    // Info of each pool.
    struct PoolInfo {
        IERC20 lpToken;           // Address of LP token contract.
        uint256 allocPoint;       // How many allocation points assigned to this pool. OXYs to distribute per block.
        uint256 lastRewardBlock;  // Last block number that OXYs distribution occurs.
        uint256 accOxyPerShare; // Accumulated OXYs per share, times 1e12. See below.
    }

    // The OXY TOKEN!
    OxyToken public oxy;
    // Dev address.
    address public devAddr;
    // Block number when bonus OXY period ends.
    uint256 public bonusEndBlock;
    // OXY tokens created per block.
    uint256 public oxyPerBlock;
    // blocks of per period
    uint256 public blockPerPeriod;
    // Bonus muliplier for early oxy makers.
    uint256 public constant BONUS_MULTIPLIER = 2; // no bonus

    // Info of each pool.
    PoolInfo[] public poolInfo;
    // Info of each user that stakes LP tokens.
    mapping(uint256 => mapping(address => UserInfo)) public userInfo;
    // Total allocation poitns. Must be the sum of all allocation points in all pools.
    uint256 public totalAllocPoint = 0;
    // The block number when OXY mining starts.
    uint256 public startBlock;

    event Deposit(address indexed user, uint256 indexed pid, uint256 amount);
    event Withdraw(address indexed user, uint256 indexed pid, uint256 amount);
    event EmergencyWithdraw(address indexed user, uint256 indexed pid, uint256 amount);

    constructor(
        OxyToken _oxy,
        address _devAddr,
        uint256 _startBlock,
        uint256 _bonusEndBlock,
        uint256 _oxyPerBlock
    ) public {
        oxy = _oxy;
        devAddr = _devAddr;
        oxyPerBlock = _oxyPerBlock;
        blockPerPeriod = _bonusEndBlock.sub(_startBlock);
        bonusEndBlock = _bonusEndBlock;
        startBlock = _startBlock;
    }

    function poolLength() external view returns (uint256) {
        return poolInfo.length;
    }

    // Add a new lp to the pool. Can only be called by the owner.
    // XXX DO NOT add the same LP token more than once. Rewards will be messed up if you do.
    function add(uint256 _allocPoint, IERC20 _lpToken, bool _withUpdate) public onlyOwner {
        if (_withUpdate) {
            massUpdatePools();
        }
        uint256 lastRewardBlock = block.number > startBlock ? block.number : startBlock;
        totalAllocPoint = totalAllocPoint.add(_allocPoint);
        poolInfo.push(PoolInfo({
            lpToken : _lpToken,
            allocPoint : _allocPoint,
            lastRewardBlock : lastRewardBlock,
            accOxyPerShare : 0
            }));
    }

    // Update the given pool's OXY allocation point. Can only be called by the owner.
    function set(uint256 _pid, uint256 _allocPoint, bool _withUpdate) public onlyOwner {
        if (_withUpdate) {
            massUpdatePools();
        }
        totalAllocPoint = totalAllocPoint.sub(poolInfo[_pid].allocPoint).add(_allocPoint);
        poolInfo[_pid].allocPoint = _allocPoint;
    }



    // Return reward multiplier over the given _from to _to block.
    function getMultiplier(uint256 _from, uint256 _to, uint baseRatio) public view returns (uint256) {
        // init decay factor
        uint base = baseRatio;
        uint canAwardBlockNum;
        if (_to <= bonusEndBlock) {
            return _to.sub(_from).mul(BONUS_MULTIPLIER).mul(base);
        } else if (_from >= bonusEndBlock) {
            {
                for (uint i = bonusEndBlock; i < _to; i = i + blockPerPeriod) {
                    // after 4 period do not mint award
                    if (i >= bonusEndBlock.add(blockPerPeriod.mul(3))) {
                        break;
                    }
                    // after 4 period do not decay
                    if (i < bonusEndBlock.add(blockPerPeriod.mul(3))) {
                        base = base.mul(4).div(5);
                    }
                    if (i.add(blockPerPeriod) < _from) {
                        continue;
                    }
                    if (i < _from && i.add(blockPerPeriod) >= _from) {
                        // cross the blocks is (i + blockPerPeriod - _from)
                        // and if _to < i.add(blockPerPeriod) the blocks is _to.sub(_from)
                        if (i.add(blockPerPeriod) > _to) {
                            canAwardBlockNum = canAwardBlockNum.add(base.mul(_to.sub(_from)));
                        } else {
                            canAwardBlockNum = canAwardBlockNum.add(base.mul(i.add(blockPerPeriod).sub(_from)));
                        }
                        continue;
                    }
                    if (i.add(blockPerPeriod) > _to) {
                        // cross the blocks is (_to - i)
                        canAwardBlockNum = canAwardBlockNum.add(_to.sub(i).mul(base));
                        continue;
                    }
                    // cross the blocks is the whole period and it is mean blocks = blockPerPeriod;
                    canAwardBlockNum = canAwardBlockNum.add(blockPerPeriod.mul(base));
                }
            }
            return canAwardBlockNum;

        } else {
            uint first = bonusEndBlock.sub(_from).mul(BONUS_MULTIPLIER).mul(base);
            {
                for (uint j = bonusEndBlock; j < _to; j = j + blockPerPeriod) {
                    // after 4 period do not mint award
                    if (j >= bonusEndBlock.add(blockPerPeriod.mul(3))) {
                        break;
                    }
                    // after 4 period do not decay
                    if (j < bonusEndBlock.add(blockPerPeriod.mul(3))) {
                        base = base.mul(4).div(5);
                    }
                    if (j.add(blockPerPeriod) > _to) {
                        // cross the blocks is (_to - j)
                        canAwardBlockNum = canAwardBlockNum.add(_to.sub(j).mul(base));
                        continue;
                    }
                    // cross the blocks is the whole period and it is mean blocks = blockPerPeriod;
                    canAwardBlockNum = canAwardBlockNum.add(blockPerPeriod.mul(base));
                }
            }
            return first.add(canAwardBlockNum);
        }
    }

    // View function to see pending OXYs on frontend.
    function pendingOxy(uint256 _pid, address _user) external view returns (uint256) {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][_user];
        uint256 accOxyPerShare = pool.accOxyPerShare;
        uint256 lpSupply = pool.lpToken.balanceOf(address(this));
        if (block.number > pool.lastRewardBlock && lpSupply != 0) {
            uint baseRatio = 1e12;
            uint256 multiplier = getMultiplier(pool.lastRewardBlock, block.number, baseRatio);
            uint256 oxyReward = multiplier.mul(oxyPerBlock).mul(pool.allocPoint).div(totalAllocPoint).div(baseRatio);
            accOxyPerShare = accOxyPerShare.add(oxyReward.mul(1e12).div(lpSupply));
        }
        return user.amount.mul(accOxyPerShare).div(1e12).sub(user.rewardDebt);
    }

    // Update reward vairables for all pools. Be careful of gas spending!
    function massUpdatePools() public {
        uint256 length = poolInfo.length;
        for (uint256 pid = 0; pid < length; ++pid) {
            updatePool(pid);
        }
    }

    // Update reward variables of the given pool to be up-to-date.
    function updatePool(uint256 _pid) public {
        PoolInfo storage pool = poolInfo[_pid];
        if (block.number <= pool.lastRewardBlock) {
            return;
        }
        uint256 lpSupply = pool.lpToken.balanceOf(address(this));
        if (lpSupply == 0) {
            pool.lastRewardBlock = block.number;
            return;
        }
        uint baseRatio = 1e12;
        uint256 multiplier = getMultiplier(pool.lastRewardBlock, block.number, baseRatio);
        uint256 oxyReward = multiplier.mul(oxyPerBlock).mul(pool.allocPoint).div(totalAllocPoint).div(baseRatio);
        pool.accOxyPerShare = pool.accOxyPerShare.add(oxyReward.mul(1e12).div(lpSupply));
        pool.lastRewardBlock = block.number;
    }

    // Deposit LP tokens to MasterChef for OXY allocation.
    function deposit(uint256 _pid, uint256 _amount) public {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        updatePool(_pid);
        if (user.amount > 0) {
            uint256 pending = user.amount.mul(pool.accOxyPerShare).div(1e12).sub(user.rewardDebt);
            safeOxyTransfer(msg.sender, pending);
        }
        pool.lpToken.safeTransferFrom(address(msg.sender), address(this), _amount);
        user.amount = user.amount.add(_amount);
        user.rewardDebt = user.amount.mul(pool.accOxyPerShare).div(1e12);
        emit Deposit(msg.sender, _pid, _amount);
    }

    // Withdraw LP tokens from MasterChef.
    function withdraw(uint256 _pid, uint256 _amount) public {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        require(user.amount >= _amount, "withdraw: not good");
        updatePool(_pid);
        uint256 pending = user.amount.mul(pool.accOxyPerShare).div(1e12).sub(user.rewardDebt);
        safeOxyTransfer(msg.sender, pending);
        user.amount = user.amount.sub(_amount);
        user.rewardDebt = user.amount.mul(pool.accOxyPerShare).div(1e12);
        pool.lpToken.safeTransfer(address(msg.sender), _amount);
        emit Withdraw(msg.sender, _pid, _amount);
    }

    // Withdraw without caring about rewards. EMERGENCY ONLY.
    function emergencyWithdraw(uint256 _pid) public {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        pool.lpToken.safeTransfer(address(msg.sender), user.amount);
        emit EmergencyWithdraw(msg.sender, _pid, user.amount);
        user.amount = 0;
        user.rewardDebt = 0;
    }

    // Safe oxy transfer function, just in case if rounding error causes pool to not have enough OXYs.
    function safeOxyTransfer(address _to, uint256 _amount) internal {
        uint256 oxyBal = oxy.balanceOf(address(this));
        if (_amount > oxyBal) {
            oxy.transfer(_to, oxyBal);
        } else {
            oxy.transfer(_to, _amount);
        }
    }

    // Update dev address by the previous dev.
    function dev(address _devAddr) public {
        require(msg.sender == devAddr, "dev: wut?");
        devAddr = _devAddr;
    }
}
