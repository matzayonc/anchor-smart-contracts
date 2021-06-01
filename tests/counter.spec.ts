import * as anchor from '@project-serum/anchor';


describe('counter', () => {

  anchor.setProvider(anchor.Provider.env());
  const program = anchor.workspace.Counter;
  const myAccount = anchor.web3.Keypair.generate();

  it('Initialization', async () => {
    await program.rpc.initialize({
      accounts: {
        owner: myAccount.publicKey,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      },
      signers: [myAccount],
      instructions: [await program.account.myAccount.createInstruction(myAccount)],
    });
  });


  it('Update', async () => {
    await program.rpc.update({
      accounts: {
        owner: myAccount.publicKey
      }
    });
  });
});
