import * as anchor from '@project-serum/anchor';
import { assert } from 'chai'



anchor.setProvider(anchor.Provider.env());
const program = anchor.workspace.Manager;
const mintKeys = anchor.web3.Keypair.generate();
const authority = program.provider.wallet.publicKey;



describe('counter', () => {

  it(('CountInit'), async () => {
    await program.state.rpc.new({
      accounts: {
        mint: mintKeys.publicKey,
        authority: authority,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      },
      instructions: [await program.account.myAccount.createInstruction(mintKeys)],
      signers: [mintKeys],
    });

    const {count} = await program.state.fetch()
    assert.ok(count.eq(new anchor.BN(0)))
  })

  it(('Counter'), async () => {

    //let expectedCount = Math.floor(Math.random() * 2) + 2

    /*for(let i = 0; i < expectedCount; i++){ //worked the stopped (This transaction has already been processed)
      await program.state.rpc.increment({
        accounts: {
          authority: authority,
        },
      });
    }*/
    await program.state.rpc.increment({
      accounts: {
        authority: authority,
      },
    });
    


    const {count} = await program.state.fetch()
    assert.ok(count.eq(new anchor.BN(1)))
  })
});



describe('tokens', () => {


/*
  it(('Mint'), async () => {
    await program.rpc.createMint({
      accounts: {
        mint: mintKeys.publicKey,
        authority: authority,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      },
      instructions: [await program.account.myAccount.createInstruction(mintKeys)],
      signers: [mintKeys],
    });
  });
*/

  it(('Token'), async () => {
    const associatedToken = await program.account.token.associatedAddress(
      authority,
      mintKeys.publicKey
    );

    await program.rpc.createToken(new anchor.BN(42), {
      accounts: {
        token: associatedToken,
        authority,
        mint: mintKeys.publicKey,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
    });

    const account = await program.account.token.associated(
      authority,
      mintKeys.publicKey
    );
    assert.ok(account.amount == 42)
  });


  /*
  it(('Withdraw'), async () => {
    await program.rpc.withdrawToken(new anchor.BN(44), {
      accounts: {
        token: await program.account.token.associated(
          authority,
          mintKeys.publicKey
        ),
      }
    });

  });*/

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
