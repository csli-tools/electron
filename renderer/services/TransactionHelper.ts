import { CosmWasmClient, isMsgExecuteEncodeObject } from '@cosmjs/cosmwasm-stargate'
import { isMsgSendEncodeObject } from '@cosmjs/stargate'
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx"
import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx'
import { toHex, toBase64 } from '@cosmjs/encoding'
import { sha256 } from '@cosmjs/crypto'
import { decodeTxRaw, DecodedTxRaw, decodePubkey } from '@cosmjs/proto-signing'

import { getStore } from '../store'
import { Block, blockActions } from '../store/blocks'
import { DecodedTransaction, transactionActions } from '../store/transactions'

const getJSON = (stuff: any): any | undefined => {
  try {
    return JSON.parse(stuff)
  } catch (_) {
    return undefined
  }
}

export default class TransactionHelper {
  private static instance: TransactionHelper

  client: CosmWasmClient
  timer: number
  private constructor(client: CosmWasmClient) {
    this.client = client
  }

  static sharedInstance(client?: CosmWasmClient) {
    if (!TransactionHelper.instance) {
      TransactionHelper.instance = new TransactionHelper(client)
    }
    return TransactionHelper.instance
  }

  start() {
    this.timer = window.setInterval(async () => {
      await this.checkForNewBlock()
    }, 5000)
  }

  async checkForNewBlock() {
    try {
      const latestHeight = await this.client.getHeight()
      const latestBlockDetails = await this.client.getBlock(latestHeight)

      const block: Block = {
        height: latestHeight,
        transactionHashes: latestBlockDetails.txs.map(tx => toHex(sha256(tx)))
      }
      getStore().dispatch(blockActions.upsert(block))
    } catch (error) {
      console.log('failed to check for new block', error)
    }
  }

  async fetchTransaction(hash: string) {
    const indexedTx = await this.client.getTx(hash)
    const deserializedTx: DecodedTxRaw = decodeTxRaw(indexedTx.tx)
    deserializedTx.body.messages.forEach( (message, index) => {
      let msg: any
      if (isMsgSendEncodeObject(message)) {
        msg = MsgSend.decode(message.value)
        deserializedTx.body.messages[index].value = msg
      } else if (isMsgExecuteEncodeObject(message)) {
        msg = MsgExecuteContract.decode(message.value)
        msg.msg = JSON.parse(Buffer.from(msg.msg).toString())
        deserializedTx.body.messages[index].value = msg
      }
      console.log('message decoded', msg)
    })

    if (indexedTx) {
      let decodedTransaction: DecodedTransaction = {
        ...indexedTx,
        tx: {
          ...deserializedTx,
          signatures: deserializedTx.signatures.map(signatureBytes => toBase64(Buffer.from(signatureBytes))),
          authInfo: {
            ...deserializedTx.authInfo,
            signerInfos: deserializedTx.authInfo.signerInfos.map(info => {
              return {
                ...info,
                publicKey: info.publicKey ? { ...info.publicKey, value: decodePubkey(info.publicKey) } : undefined,
                sequence: info.sequence.toString()
              }
            }),
            fee: deserializedTx.authInfo.fee ? {
              ...deserializedTx.authInfo.fee,
              gasLimit: deserializedTx.authInfo.fee.gasLimit.toString(),
            } : undefined
          },
          body: {
            ...deserializedTx.body,
            timeoutHeight: deserializedTx.body.timeoutHeight.toString()
          }
        }
      }
      if (indexedTx.rawLog) {
        // Wasm messages may not have this
        const json = getJSON(indexedTx.rawLog)
        if (!!json) {
          console.log('rawlog', indexedTx.rawLog)
          decodedTransaction.rawLog = json
        }
      }

      return decodedTransaction
    }

    return undefined
  }

  async saveTransaction(hash: string) {
    const transaction = await this.fetchTransaction(hash)

    if (transaction) {
      getStore().dispatch(transactionActions.upsert(transaction))
    }
  }
}
