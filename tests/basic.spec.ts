import * as anchor from '@project-serum/anchor';
import { assert } from 'chai'



anchor.setProvider(anchor.Provider.env());
const program = anchor.workspace.Manager;


describe('tokens', () => {

  const mintKeys = anchor.web3.Keypair.generate();

  it(('Mint'), async () => {
    await program.rpc.createMint({
      accounts: {
        mint: mintKeys.publicKey,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      },
      instructions: [await program.account.myAccount.createInstruction(mintKeys)],
      signers: [mintKeys],
    });
  });

  it(('Token'), async () => {
        // Calculate the associated token address.
    const authority = program.provider.wallet.publicKey;
    const associatedToken = await program.account.token.associatedAddress(
      authority,
      mintKeys.publicKey
    );

    // Execute the transaction to create the associated token account.
    await program.rpc.createToken(new anchor.BN(42), {
      accounts: {
        token: associatedToken,
        authority,
        mint: mintKeys.publicKey,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
    });

    // Fetch the new associated account.
    const account = await program.account.token.associated(
      authority,
      mintKeys.publicKey
    );
      assert.ok(account.amount == 42)
  });
});



describe('basic', () => {

  const myAccount = anchor.web3.Keypair.generate();

  it('Initialization', async () => {
    await program.rpc.initialize(new anchor.BN(42), {
      accounts: {
        user: myAccount.publicKey,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      },
      signers: [myAccount],
      instructions: [await program.account.myAccount.createInstruction(myAccount)],
    });
  });

  it('Update', async () => {
    await program.rpc.update(new anchor.BN(44), {
      accounts: {
        user: myAccount.publicKey
      }
    });
  });
});

describe('counter', () => {

  it(('CountInit'), async () => {
    await program.state.rpc.new({
      accounts: {
        authority: anchor.Provider.env().wallet.publicKey,
      },
    });

    const {count} = await program.state.fetch()
    assert.ok(count.eq(new anchor.BN(0)))
  })

  it(('Counter'), async () => {

    let expectedCount = Math.floor(Math.random() * 2) + 2

    for(let i = 0; i < expectedCount; i++){
      await program.state.rpc.increment({
        accounts: {
          authority: anchor.Provider.env().wallet.publicKey,
        },
      });
    }

    const {count} = await program.state.fetch()
    assert.ok(count.eq(new anchor.BN(expectedCount)))
  })
});
