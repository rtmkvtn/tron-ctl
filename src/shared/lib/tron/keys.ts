import TronWeb from 'tronweb'

export function generateKeypair(): { privateKey: string; address: string } {
  const account = TronWeb.utils.accounts.generateAccount()
  return {
    privateKey: account.privateKey,
    address: account.address.base58,
  }
}
