import React from "react"
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter'
import json from 'react-syntax-highlighter/dist/cjs/languages/hljs/json'
import docco from 'react-syntax-highlighter/dist/cjs/styles/hljs/docco'

SyntaxHighlighter.registerLanguage('json', json);


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

	return (
		<div className="p-6">
					{ transaction === undefined &&
						<span className="text-2xl flex font-semibold text-gray-900">
							Select a transaction from the list to the left to inspect it
						</span>
					}
					{ transactionHash !== undefined &&
						<React.Fragment>
							<span className="text-2xl flex font-semibold text-gray-900">Transaction</span>
							<SyntaxHighlighter language="json" style={docco} customStyle={{borderRadius: "0.25rem", background: "#D3FDF9", margin: "1rem"}}>
								{JSON.stringify(transaction, null, 2)}
							</SyntaxHighlighter>
						</React.Fragment>
					}
		</div>
	)
}

export default Transaction