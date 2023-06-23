import type { User } from '../stores/user';
import type { CCTransaction, CCEntry, FrontCCTransaction } from '../types/types';

export function transactionsToFrontTransactions(
	txs: CCTransaction[],
	user: User,
) {
	return txs.map((t) => {
		return {
			...t,
			totalAmountForUser: Math.abs(
								t.entries
									.filter((e) => isUserEntryPayee(e, user))
									.reduce((total, e) => total + e.quant, 0) -
									t.entries
										.filter((e) => isUserEntryPayer(e, user))
										.reduce((total, e) => total + e.quant, 0)),
			userRole: isUserTransactionMainPayer(t, user) ? 'payer' : 'payee'
			// TODO possibleNextSteps????
		} as FrontCCTransaction;
	});
}

// TODO more checks if tree is bigger, may need to pass another variable <nodePath>?

export function isUserTransactionMainPayer(transaction: CCTransaction, user: User) {
	return (
		transaction.entries[0].payer === user.id ||
		transaction.entries[0].payer === user.nodeName + '/' + user.id
	);
}

export function isUserTransactionMainPayee(transaction: CCTransaction, user: User) {
	return (
		transaction.entries[0].payee === user.id ||
		transaction.entries[0].payee === user.nodeName + '/' + user.id
	);
}

export function isUserEntryPayer(entry: CCEntry, user: User) {
	return (
		entry.payer === user.id ||
		entry.payer === user.nodeName + '/' + user.id
	);
}

export function isUserEntryPayee(entry: CCEntry, user: User) {
	return (
		entry.payee === user.id ||
		entry.payee === user.nodeName + '/' + user.id
	);
}
