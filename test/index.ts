import chai from "chai"
import chaiAsPromised from "chai-as-promised"
import { solidity } from 'ethereum-waffle'
import { expect } from "chai"
import { ethers } from "hardhat"

import { AvgPrice, DateTime } from "../typechain";

chai.use(solidity)
chai.use(chaiAsPromised)

describe("AvgPrice", function() {
  const days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  // let dateTime: DateTime
  // let avgPrice : AvgPrice
  let dateTime : DateTime;
  let avgPrice : AvgPrice;

  this.beforeAll(async function () {
    const signers = await ethers.getSigners()

    const dateTimeFactory = await ethers.getContractFactory('DateTime', signers[0])
    dateTime = await dateTimeFactory.deploy()
    // dateTime = await upgrades.deployProxy(dateTimeFactory)
    await dateTime.deployed()

    const avgPriceFactory = await ethers.getContractFactory('AvgPrice', signers[0])
    avgPrice = await avgPriceFactory.deploy(dateTime.address)
    // avgPrice = await upgrades.deployProxy(avgPriceFactory, [dateTime.address])
    await avgPrice.deployed()

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

  // // iteration 2
  // describe('ownerable test', async function() {

  // })

  // // iteration 3
  // describe('date check on set price', async function() {
    
  // })
})