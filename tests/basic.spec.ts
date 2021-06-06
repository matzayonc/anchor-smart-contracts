import * as anchor from '@project-serum/anchor'
import { assert, expect } from 'chai'
import {
  initializeMint,
  mintTokensToStaking,
  getAmountInStaking,
  mintTokensTo,
  getAmountIn,
  initializeState,
  createUser,
  deposit,
  amountOfSharesOf,
  mainProgram,
  someToken,
  withdraw,
  parseNumber
} from './utils'

import { Keypair, PublicKey } from '@solana/web3.js'

describe('Mint', async () => {
  it('initialize', async () => {
    await initializeMint()
  })

  it('mint to staking account', async () => {
    await mintTokensToStaking(10e4) // 1 with 4 decimal places
    const amount = await getAmountInStaking()
    assert.ok(amount.eq(parseNumber(1 * 10e4)))
  })

  it('mint to account', async () => {
    const owner = Keypair.generate()
    const ownersTokens = await someToken.createAccount(owner.publicKey)

    assert.ok((await getAmountIn(ownersTokens)).eq(parseNumber(0)))
    await mintTokensTo(ownersTokens, 42)
    assert.ok((await getAmountIn(ownersTokens)).eq(parseNumber(42)))
    await mintTokensTo(ownersTokens, 2)
    assert.ok((await getAmountIn(ownersTokens)).eq(parseNumber(44)))
  })
})

describe('State', async () => {
  it('initialize', async () => {
    await initializeState()
    const { count } = (await mainProgram.state.fetch()) as { count: number }
    assert.ok(count == 0)
  })
})

describe('Users', async () => {
  const user = anchor.web3.Keypair.generate()
  let tokens: PublicKey

  it('creation', async () => {
    await createUser(user)
    const shares = await amountOfSharesOf(user)
    assert.ok(shares.eq(parseNumber(0)))
  })

  it('creating tokens', async () => {
    tokens = await someToken.createAccount(user.publicKey)
    await mintTokensTo(tokens, 42)
    assert.ok((await getAmountIn(tokens)).eq(parseNumber(42)))
  })

  it('buy shares', async () => {
    await deposit(user, tokens)
    const shares = await amountOfSharesOf(user)

    assert.ok((await getAmountIn(tokens)).eq(parseNumber(0)))
    assert.ok(shares.eq(parseNumber(420)))
  })

  it('create more users', async () => {
    for (let i = 0; i < 3; i++) await createUser()
  })

  it('minting additional tokens', async () => {
    await createUser()
    await mintTokensToStaking(5 * 10e3)
    assert.ok((await getAmountInStaking()).eq(parseNumber(15 * 10e3 + 42)))
  })

  it('limit', async () => {
    try {
      expect(await createUser()).to.throw() //FIXME: errors print to console
    } catch (err: unknown) {
      const { msg } = err as { msg: string }
      assert.ok(msg == "There can't be more than 5 users.")
    }
  })

  it('sell shares', async () => {
    await withdraw(user, tokens)
    const shares = await amountOfSharesOf(user)
    assert.ok(shares.eq(parseNumber(0)))
    assert.ok((await getAmountIn(tokens)).eq(parseNumber(63)))
  })
})
