import React from "react";
import { useAppSelector } from '../store/'
import { transactionSelectors } from '../store/transactions'

interface TransactionProps {
	transactionHash: string
}

const Transaction: React.FC<TransactionProps> = ({ transactionHash }) => {

	const transaction = useAppSelector((state) => {
		const hash = transactionHash.toUpperCase()
		return transactionSelectors.selectById(state, hash)
	})

	// const transactions = useAppSelector((state) => {
	// 	return transactionSelectors.selectAll(state)
	// })

	return (
		<React.Fragment>
			<h3 className="text-white">Transaction {transactionHash}</h3>
			{
				transaction &&
				<React.Fragment>
					{
						transaction.tx.body &&
						<h3>{JSON.stringify(transaction.tx.body)}</h3>
					}
					{/* <ul>
						{
							transactions.map(tx => {
								return (
									<li>
										{tx.hash}
									</li>
								)
							})
						}
					</ul> */}
				</React.Fragment>
			}
		</React.Fragment>
	)
}

export default Transaction