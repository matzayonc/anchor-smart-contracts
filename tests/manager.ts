import * as anchor from '@project-serum/anchor'


const program = anchor.workspace.Manager as Program
const mintKeys = anchor.web3.Keypair.generate()
const authority = program.provider.wallet.publicKey

export async function generateUser(){
    const userKeys = anchor.web3.Keypair.generate()

    await program.state.rpc.initUser(userKeys.publicKey, {
      accounts: {
        user: userKeys.publicKey,
        authority: authority,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      },
      instructions: [await program.account.user.createInstruction(userKeys)],
      signers: [userKeys],
    })
    return userKeys
}
