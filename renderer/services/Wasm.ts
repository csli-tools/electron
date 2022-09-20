import { CosmWasmClient, SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate"
import { DirectSecp256k1Wallet } from "@cosmjs/proto-signing"

import KeyHelper from "./KeyHelper"

export default class Wasm {
  private static instance: Wasm
  rpcEndpoint: string = `${process.env.RPC_PROTOCOL ?? 'http'}://${process.env.RPC_URL ?? 'localhost:8888/wasm'}`

  client: CosmWasmClient | undefined
  private constructor() {
    this.client = undefined
  }

  static sharedInstance() {
    if (!Wasm.instance) {
      Wasm.instance = new Wasm()
    }
    return Wasm.instance
  }
  
  async signingClient(key: string) {
    const keyBytes = await KeyHelper.getPrivateKey(key)
    const signer = await DirectSecp256k1Wallet.fromKey(keyBytes, "wasm")
    return await SigningCosmWasmClient.connectWithSigner(this.rpcEndpoint, signer)
  }

  async connect() {
    try {
      this.client = await CosmWasmClient.connect(this.rpcEndpoint)
      return this.client
    } catch (error: any) {
      if (error && error.code) {
        switch (error.code) {
          case 'ECONNREFUSED':
            console.log(`Couldn't connect. Is your ${'wasmd'} (or preferred daemon) running?\nWe're trying to connect to ${this.rpcEndpoint}\nPlease update environment variables in the ${'.env'} file. (You may need to copy ${'.env.example'} » ${'.env'} if it doesn't exist.)`)
            break
          case 'ERR_SOCKET_BAD_PORT':
            console.log(`Couldn't connect and it seems your port is the problem. The typical RPC port is ${'26657'}\nWe're trying to connect to ${this.rpcEndpoint}\nPlease update environment variables in the ${'.env'} file. (You may need to copy ${'.env.example'} » ${'.env'} if it doesn't exist.)`)
            break
          case 'EPROTO':
            console.log(`Couldn't connect and it seems your protocol is the problem. Check the ${'RPC_PROTOCOL'} environment variable.\nWe're trying to connect to ${this.rpcEndpoint}\nPlease update it in the ${'.env'} file. (You may need to copy ${'.env.example'} » ${'.env'} if it doesn't exist.)`)
            if (process.env.RPC_PROTOCOL === 'https') {
              console.log(`Consider changing to ${'http'}`)
            }
            break
          default:
            console.error(`Issue connecting to RPC at ${this.rpcEndpoint}\nWanna file a ticket, ol' buddy ol' pal?`)
            console.log('https://github.com/csli-tools/electron/issues/new')
            break
        }
      }
    }
  }
}

