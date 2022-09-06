import React from "react"
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter'
import json from 'react-syntax-highlighter/dist/cjs/languages/hljs/json'
import docco from 'react-syntax-highlighter/dist/cjs/styles/hljs/docco'
import bash from 'react-syntax-highlighter/dist/cjs/languages/hljs/bash'

SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('bash', bash);

import { useAppSelector } from '../store/'
import { transactionSelectors } from '../store/transactions'

interface TransactionProps {
  transactionHash: string | undefined
}

const Transaction: React.FC<TransactionProps> = ({ transactionHash }) => {

  const transaction = useAppSelector((state) => {
    if (transactionHash !== undefined) {
      const hash = transactionHash.toUpperCase()
      return transactionSelectors.selectById(state, hash)
    } else {
      return undefined
    }
  })

  const snippet = "wasmd tx bank send \\\n$(wasmd keys show [key1] -a)  $(wasmd keys show [key2] -a) \\\n1stake --chain-id [chain-23] -y --output json"

  return (
    <div className="p-6 h-full">
      { transaction === undefined &&
        <div className="flex flex-col justify-center items-center h-full w-full space-y-4 text-center">
          <p>
            Select a transaction from the list to the left to inspect it. <br />If there are no transactions, send a transation using the following command, inserting your own key names and chain id:
          </p>
          <div className="text-left mt-4">
            <SyntaxHighlighter language="bash" style={docco} customStyle={{borderRadius: "0.25rem", background: "#D3FDF9"}}>
              {snippet}
            </SyntaxHighlighter>
          </div>
        </div>
      }
      { transactionHash !== undefined &&
        <React.Fragment>
          <span className="text-2xl flex font-semibold text-gray-900 mx-4">Transaction</span>
          <SyntaxHighlighter language="json" style={docco} customStyle={{borderRadius: "0.25rem", background: "#D3FDF9", margin: "1rem"}}>
            {JSON.stringify(transaction, null, 2)}
          </SyntaxHighlighter>
        </React.Fragment>
      }
    </div>
  )
}

export default Transaction
