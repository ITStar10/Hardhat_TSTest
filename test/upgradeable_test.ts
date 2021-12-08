import chai from "chai"
import chaiAsPromised from "chai-as-promised"
import { solidity } from 'ethereum-waffle'
import { expect } from "chai"
import { ethers } from "hardhat"

import { upgrades } from "hardhat"

import { DateTime, AvgPrice } from "../typechain";
import { AvgPriceV2, AvgPriceV3 } from "../typechain";

chai.use(solidity)
chai.use(chaiAsPromised)

const days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

let deployedProxyAddress : string

describe("AvgPrice", function() {
  let avgPrice : AvgPrice;

  this.beforeAll(async function () {
    const signers = await ethers.getSigners()
    const dateTimeFactory = await ethers.getContractFactory('DateTime', signers[0])
    const dateTime = await dateTimeFactory.deploy()
    await dateTime.deployed()

    const avgPriceFactory = await ethers.getContractFactory('AvgPrice', signers[0])
    avgPrice = await upgrades.deployProxy(
        avgPriceFactory,
        [dateTime.address],
        {initializer: 'initialize'}) as AvgPrice
    await avgPrice.deployed()

    deployedProxyAddress = avgPrice.address

    // Store initial values
    for (let mon = 1; mon < 5; mon++){
      for (let day = 1; day <= days[mon - 1]; day++) {
        await avgPrice.setDayPrice(mon, day, day)
      }
    }
  })

  beforeEach(async function(){    
  });

  // it('get day prices', async function() {
  //   expect(await avgPrice.getDayPrice(1,1)).to.eq(1)
  //   expect(await avgPrice.getDayPrice(2,3)).to.eq(3)
  //   expect(await avgPrice.getDayPrice(3,31)).to.eq(31)
  // })

  it('set day price on invalid dates', async () => {
    // expect(avgPrice.setDayPrice(1,0,10)).to.eventually.be.rejectedWith(Error, 'Invalid Date')
    expect(avgPrice.setDayPrice(1,0,10)).to.eventually.be.rejectedWith('Invalid Date')
    expect(avgPrice.setDayPrice(2,29,10)).to.eventually.be.rejectedWith('Invalid Date')
    
    // it('should fail due to invalid date', () => {
    //   expect(avgPrice.setDayPrice(1,0,10)).to.eventually.be.rejectedWith('Invalid Date')
    //   // return expect(avgPrice.setDayPrice(1,0,10)).to.eventually.be.rejectedWith(Error, '')
    // })

    // it('should fail due to leap year', () => {
    //   return expect(avgPrice.setDayPrice(2,29,10)).to.eventually.be.rejectedWith(Error, '')
    // })
  })

  it('get day prices', async function() {
    expect(await avgPrice.getDayPrice(1,1)).to.eq(1)
    expect(await avgPrice.getDayPrice(2,3)).to.eq(3)
    expect(await avgPrice.getDayPrice(3,31)).to.eq(31)
  })
})

describe("Version 2.0 Test", function() {
    let avgPriceV2 : AvgPriceV2;

    this.beforeAll(async function () {
        const signers = await ethers.getSigners()
        const avgPriceV2Factory = await ethers.getContractFactory('AvgPriceV2', signers[0])

        avgPriceV2 = await upgrades.upgradeProxy(
            deployedProxyAddress,
            avgPriceV2Factory
        ) as AvgPriceV2;
        await avgPriceV2.deployed()
    })

    it('Check state value kept', async function () {
        for (let day=5; day<15; day++) {
            expect(await avgPriceV2.getDayPrice(1, day)).to.eq(day)
        }
    })

    it('Ownerable test', async function () {
        const signers = await ethers.getSigners()
        //Set & get price of day
        await avgPriceV2.setDayPrice(1,5,15);
        expect(await avgPriceV2.getDayPrice(1,5)).to.eq(15)

        await expect(avgPriceV2.connect(signers[1]).setDayPrice(1,6,20)).to.be.revertedWith('Ownable: caller is not the owner')
    })
})

describe("Version 3.0 Test", function() {
    let avgPriceV3 : AvgPriceV3;

    this.beforeAll(async function () {
        const signers = await ethers.getSigners()
        const avgPriceV3Factory = await ethers.getContractFactory('AvgPriceV3', signers[0])

        avgPriceV3 = await upgrades.upgradeProxy(
            deployedProxyAddress,
            avgPriceV3Factory
        ) as AvgPriceV3;
        await avgPriceV3.deployed()
    })

    it('Setting price on another day is not allowed', async function () {
        let date = new Date()

        const curMonth = date.getUTCMonth()
        const curDate = date.getUTCDate()
        console.log("Current Day is %d/%d", curMonth, curDate)

        await avgPriceV3.setDayPrice(curMonth,curDate,20);
        expect(await avgPriceV3.getDayPrice(curMonth,curDate)).to.eq(20)

        // await expect(avgPriceV2.connect(signers[1]).setDayPrice(1,6,20)).to.be.revertedWith('Ownable: caller is not the owner')
        // expect(await avgPriceV3.setDayPrice((curMonth + 1) % 12 + 1, 1, 100)).to.be.revertedWith('Not able to set price on another day.');
    })
})