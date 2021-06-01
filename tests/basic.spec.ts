import * as anchor from '@project-serum/anchor';

const myAccount = anchor.web3.Keypair.generate();


describe('basic', () => {

  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());

  it('Creation', async () => {
    // Add your test here.
    const program = anchor.workspace.Basic;
    const myAccount = anchor.web3.Keypair.generate();

    // Atomically create the new account and initialize it with the program.
    await program.rpc.initialize(new anchor.BN(5), {
      accounts: {
        myAccount: myAccount.publicKey,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      },
      signers: [myAccount],
      instructions: [await program.account.myAccount.createInstruction(myAccount)],
    });
  });
});
