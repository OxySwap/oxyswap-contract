import chai, { expect } from 'chai'
import { Contract, constants, Signer, Wallet, providers } from 'ethers'
import { utils } from 'ethers'

import { BigNumber } from '@ethersproject/bignumber'

require("@nomiclabs/hardhat-waffle");

import { waffle } from "hardhat";
const { createFixtureLoader, deployContract } = waffle;

import TreePlan from '../../build/artifacts/contracts/TreePlan.sol/TreePlan.json'
import OxyToken from '../../build/artifacts/contracts/OxyToken.sol/OxyToken.json'
import TestUSDT from '../../build/artifacts/contracts/TestUSDT.sol/TestUSDT.json'

interface FactoryFixture {
  my_c: Contract
  tusdt: Contract
  oxy: Contract
}

const overrides = {
  gasLimit: 9000000
}

export async function factoryFixture([wallet]: Wallet[], _: providers.Web3Provider): Promise<FactoryFixture> {
  const tusdt = await deployContract(wallet, TestUSDT, [], overrides)
  const oxy = await deployContract(wallet, OxyToken, [], overrides)
  const my_c = await deployContract(wallet, TreePlan, [tusdt.address, oxy.address], overrides)
  return { my_c, tusdt, oxy }
}

const TEST_ADDRESSES: [string, string, string] = [
  '0x0000000000000000000000000000000000000000',
  '0x1000000000000000000000000000000000000000',
  '0x2000000000000000000000000000000000000000'
]

const Usdt1000 = 1000 * 10 ** 6
const Usdt1001 = 1001 * 10 ** 6
const Usdt1 = 1 * 10 ** 6

const Oxy1 = BigNumber.from('1000000000000000000')

describe('TreePlan', () => {
  const provider = waffle.provider;
  /*
  const provider = new MockProvider({
    ganacheOptions:{
      hardfork: 'istanbul',
      mnemonic: 'horn horn horn horn horn horn horn horn horn horn horn horn',
      gasLimit: 9999999
  }})
  */

  const [wallet1, wallet2, wallet3, wallet4, wallet5, wallet6, wallet7] = provider.getWallets()
  let wallet1_signer = provider.getSigner(0)
  let wallet2_signer = provider.getSigner(1)
  let wallet3_signer = provider.getSigner(2)
  let wallet4_signer = provider.getSigner(3)
  let wallet5_signer = provider.getSigner(4)
  let wallet6_signer = provider.getSigner(5)
  let wallet7_signer = provider.getSigner(6)

  console.log('wallet:', wallet1.address, '\n other:', wallet2.address, '\n third:', wallet3.address)

  const loadFixture = createFixtureLoader([wallet1], provider)

  let tx;

  let multi = 5;

  let my_c: Contract
  let tusdt: Contract
  let oxy: Contract

  beforeEach(async () => {
    const fixture = await loadFixture(factoryFixture)
    my_c = fixture.my_c
    tusdt = fixture.tusdt
    oxy = fixture.oxy
    await oxy.transfer(my_c.address, Oxy1.mul(10000))

    await tusdt.transfer(wallet2.address, Usdt1000 * multi)
    await tusdt.transfer(wallet3.address, Usdt1000 * multi)
    await tusdt.transfer(wallet4.address, Usdt1000 * multi)
    await tusdt.transfer(wallet5.address, Usdt1000 * multi)
    tx = ''
  })

  it('dump infos', async () => {
    let balance = await provider.getBalance(wallet1.address)
    console.log('wallet1 balance:', utils.formatEther(balance))
    balance = await provider.getBalance(wallet2.address)
    console.log('wallet2 balance:', utils.formatEther(balance))
    balance = await provider.getBalance(wallet3.address)
    console.log('wallet3 balance:', utils.formatEther(balance))
  })

  it('add_root test', async () => {

    tx = await my_c.add_root(wallet2.address)
    expect(await my_c.getInviter(wallet2.address)).to.equal(wallet2.address)
    expect(await my_c.getRootInviter(wallet2.address)).to.equal(wallet2.address)

  })

  it('bind test', async () => {

    await my_c.add_root(wallet2.address)

    // root { w2:w2 } direct { w2: w2 }
    // w3 bind w2. 

    await my_c.connect(wallet3_signer).bind(wallet2.address)

    expect(await my_c.getInviter(wallet3.address)).to.equal(wallet2.address)
    expect(await my_c.getRootInviter(wallet2.address)).to.equal(wallet2.address)

    await my_c.connect(wallet4_signer).bind(wallet3.address)

    expect(await my_c.getInviter(wallet4.address)).to.equal(wallet3.address)
    expect(await my_c.getRootInviter(wallet2.address)).to.equal(wallet2.address)

  })

  it('bind test complexed', async () => {

    await my_c.add_root(wallet2.address)
    await my_c.add_root(wallet3.address)
    await my_c.connect(wallet4_signer).bind(wallet2.address)
    await my_c.connect(wallet5_signer).bind(wallet2.address)
    await my_c.connect(wallet6_signer).bind(wallet3.address)
    await my_c.connect(wallet7_signer).bind(wallet6.address)

    expect(await my_c.getInviter(wallet2.address)).to.equal(wallet2.address)
    expect(await my_c.getRootInviter(wallet2.address)).to.equal(wallet2.address)

    expect(await my_c.getInviter(wallet3.address)).to.equal(wallet3.address)
    expect(await my_c.getRootInviter(wallet3.address)).to.equal(wallet3.address)

    expect(await my_c.getInviter(wallet4.address)).to.equal(wallet2.address)
    expect(await my_c.getRootInviter(wallet4.address)).to.equal(wallet2.address)

    expect(await my_c.getInviter(wallet5.address)).to.equal(wallet2.address)
    expect(await my_c.getRootInviter(wallet5.address)).to.equal(wallet2.address)

    expect(await my_c.getInviter(wallet6.address)).to.equal(wallet3.address)
    expect(await my_c.getRootInviter(wallet6.address)).to.equal(wallet3.address)

    expect(await my_c.getInviter(wallet7.address)).to.equal(wallet6.address)
    expect(await my_c.getRootInviter(wallet7.address)).to.equal(wallet3.address)

  })

  it('error add_root', async () => {

    await my_c.add_root(wallet2.address)
    await expect(my_c.add_root(wallet2.address)).to.be.reverted

  })

  it('error binding', async () => {

    await my_c.add_root(wallet2.address)

    await expect(my_c.connect(wallet2_signer).bind(wallet2.address)).to.be.revertedWith('<bind> Sender should not exist in direct_mapping')
    await expect(my_c.connect(wallet3_signer).bind(wallet4.address)).to.be.revertedWith('Inviter must exist')

  })

  it('deposit test', async () => {

    await my_c.add_root(wallet2.address)
    await my_c.add_root(wallet3.address)
    await my_c.connect(wallet4_signer).bind(wallet2.address)
    await my_c.connect(wallet5_signer).bind(wallet2.address)
    await my_c.connect(wallet6_signer).bind(wallet3.address)
    await my_c.connect(wallet7_signer).bind(wallet6.address)

  })

  it('error deposit test 1', async () => {

    await my_c.add_root(wallet2.address)
    await my_c.connect(wallet4_signer).bind(wallet2.address)

    await tusdt.connect(wallet3_signer).approve(my_c.address, Usdt1000)
    await expect(my_c.connect(wallet3_signer).deposit(Usdt1000)).to.be.revertedWith('<deposit> Sender should be in direct_mapping')
    
    await tusdt.connect(wallet4_signer).approve(my_c.address, Usdt1001)

    let allowance = await tusdt.allowance(wallet4.address, my_c.address)
    expect(allowance).to.equal(Usdt1001)

    let balanceOf = await tusdt.balanceOf(wallet4.address)
    expect(balanceOf).to.equal(Usdt1000 * multi)

    await expect(my_c.connect(wallet4_signer).deposit(Usdt1001)).to.be.revertedWith('only 1000u is accepted')

    await my_c.connect(wallet4_signer).deposit(Usdt1000)
    await tusdt.connect(wallet4_signer).decreaseAllowance(my_c.address, Usdt1)

    allowance = await tusdt.allowance(wallet4.address, my_c.address)
    expect(allowance).to.equal(0, 'wallet4')

    let balance = await my_c.usdtBalanceOf(wallet4.address)
    expect(balance).to.equal(Usdt1000, 'wallet4')

  })

})
