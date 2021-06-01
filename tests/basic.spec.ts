import * as anchor from '@project-serum/anchor';


describe('basic', () => {

  anchor.setProvider(anchor.Provider.env());
  const program = anchor.workspace.Manager;
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
