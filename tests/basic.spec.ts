import * as anchor from '@project-serum/anchor'
import { assert, expect } from 'chai'
import {
  initializeMint,
  mintTokensToStaking,
  getAmountInStaking,


  mainProgram,
  generateUser,
  initMint,
  generateToken,
  getTokenAmount,
  getTokenWithdrawable,
  recalculateToken
} from './utils'

import {
  parseNumber,
} from './otherUtils'

let fourthUsersKeys: anchor.web3.Keypair

before(async () => {
  await initializeMint()
})

describe('IDK', async () => {
  it('mint to staking account', async () => {
    await mintTokensToStaking(10e8) // 100 with 6 decimal places
    const amount = await getAmountInStaking()
    assert.ok(amount.eq(parseNumber(100 * 10e6)))
  })
})

/*
describe('Mint', () => {
  it('init', async () => {
    await initMint()

    const { count } = (await mainProgram.state.fetch()) as anchor.BN
    assert.ok(count.eq(new anchor.BN(0)))
  })
})

describe('Users', () => {
  it('creation', async () => {
    for (let i = 0; i < 4; i++) fourthUsersKeys = await generateUser()
  })
})

describe('Token', () => {
  it('creation', async () => {
    await generateToken(42, fourthUsersKeys.publicKey)

    const amount = await getTokenAmount(fourthUsersKeys.publicKey)
    assert.ok(amount == 210)
  })

  it('recalculation of value', async () => {
    await recalculateToken(fourthUsersKeys.publicKey)

    const withdrawable = await getTokenWithdrawable(fourthUsersKeys.publicKey)
    assert.ok(withdrawable == 42)
  })

  it('change in value', async () => {
    await generateUser()
    await recalculateToken(fourthUsersKeys.publicKey)
    const withdrawable = await getTokenWithdrawable(fourthUsersKeys.publicKey)
    assert.ok(withdrawable == 63)
  })
})

describe('Users', () => {
  it('limit', async () => {
    try {
      expect(await generateUser()).to.throw() //FIXME: errors print to console
    } catch (err: unknown) {
      const { msg } = err as { msg: string }
      assert.ok(msg == "There can't be more than 5 users.")
    }
  })
})
*/