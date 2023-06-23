<script lang="ts">
	import { ArrowDownTray, ArrowUpTray, ChevronRight, Icon, ListBullet } from 'svelte-hero-icons';
	import { user } from '../stores/user';
	import type { FrontCCTransaction } from '../types/types';
	import { transactionsToFrontTransactions } from '$lib/transactions';
	import { onDestroy } from 'svelte';

	let balance: number | null = null;
	let positiveLimit: number | null = null;
	let negativeLimit: number | null = null;
	let pendingTransactions: FrontCCTransaction[] = [];
	let transactionsToBeSigned: FrontCCTransaction[] = [];

	const unsubscribe = user.subscribe((u) => {
		if (u.isLoggedIn) {
			fetch(`${u.node}/account/summary?acc_path=${u.id}`, {
				headers: {
					'cc-user': u.id,
					'cc-auth': u.pass
				}
			})
				.then((res) => res.json())
				.then((json) => (balance = json.data[u.id].completed.balance.toFixed(2)));
			fetch(`${u.node}/account/limits?acc_path=${u.id}`, {
				headers: {
					'cc-user': u.id,
					'cc-auth': u.pass
				}
			})
				.then((res) => res.json())
				.then((json) => {
					negativeLimit = json.data[u.id].min.toFixed(2);
					positiveLimit = json.data[u.id].max.toFixed(2);
				});
			fetch(`${u.node}/transactions?involving=${u.id}&state=validated`, {
				headers: {
					'cc-user': u.id,
					'cc-auth': u.pass
				}
			})
				.then((res) => res.json())
				.then((json) => {
					transactionsToBeSigned = transactionsToFrontTransactions(json.data, u);
				});
			fetch(`${u.node}/transactions?involving=${u.id}&state=pending`, {
				headers: {
					'cc-user': u.id,
					'cc-auth': u.pass
				}
			})
				.then((res) => res.json())
				.then((json) => {
					pendingTransactions = transactionsToFrontTransactions(json.data, u);
				});
		}
	});
	onDestroy(unsubscribe);
</script>

<div class="w-full bg-amber-50 h-40 rounded-lg shadow-md flex flex-col p-4 mb-8">
	<div class="h-6 w-full flex justify-between mb-4">
		<span class="uppercase text-amber-900">Balance</span>
		<span class="uppercase text-amber-900">Limits</span>
	</div>

	<div class="flex-grow flex">
		<div class="flex-grow text-6xl">
			{#if balance}
				{balance}
			{:else}
				Loading...
			{/if}
		</div>
		<div class="flex flex-col text-xl">
			{#if positiveLimit && negativeLimit}
				<span class="text-green-600 w-full text-right">{positiveLimit}</span>
				<span class="text-red-600 w-full text-right">{negativeLimit}</span>
			{:else}
				Loading...
			{/if}
		</div>
	</div>
</div>

{#if transactionsToBeSigned.length > 0}
	<div class="mb-8">
		<span class="ml-4 uppercase text-amber-900">To be signed</span>
		{#each transactionsToBeSigned as t}
			<a href="/t/{t.uuid}" title="view transaction">
				<div class="w-full bg-amber-200 flex items-center p-4 gap-2 rounded-xl shadow-md mb-2">
					<div class="h-8"><Icon src={t.userRole === 'payee' ? ArrowDownTray : ArrowUpTray} /></div>
					<div class="flex flex-col flex-grow">
						<span class="text-xl"
							>{t.userRole === 'payer'
								? t.entries[0].payee.split('/').splice(-1)
								: t.entries[0].payer.split('/').splice(-1)}</span
						>
						<span class="text-xs"
							>{t.userRole === 'payer' ? t.entries[0].payee : t.entries[0].payer}</span
						>
					</div>

					<div class="flex flex-col items-center mr-8">
						<span class="text-sm">Amount</span>
						<span
							class="mx-4 text-2xl font-bold"
							class:text-green-600={t.userRole === 'payee'}
							class:text-red-600={t.userRole === 'payer'}
						>
							{t.totalAmountForUser.toFixed(2)}
						</span>
					</div>
					<div class="h-8"><Icon src={ChevronRight} /></div>
				</div></a
			>
		{/each}
	</div>
{/if}

<!-- TODO refactor in a component -->
{#if pendingTransactions.length > 0}
	<div>
		<span class="ml-4 uppercase text-amber-900">Pending</span>
		{#each pendingTransactions as t}
			<a href="/t/{t.uuid}" title="view transaction">
				<div class="w-full bg-amber-200 flex items-center p-4 gap-2 rounded-xl shadow-md mb-2">
					<div class="h-8"><Icon src={t.userRole === 'payee' ? ArrowDownTray : ArrowUpTray} /></div>
					<div class="flex flex-col flex-grow">
						<span class="text-xl"
							>{t.userRole === 'payer'
								? t.entries[0].payee.split('/').splice(-1)
								: t.entries[0].payer.split('/').splice(-1)}</span
						>
						<span class="text-xs"
							>{t.userRole === 'payer' ? t.entries[0].payee : t.entries[0].payer}</span
						>
					</div>

					<div class="flex flex-col items-center mr-8">
						<span class="text-sm">Amount</span>
						<span
							class="mx-4 text-2xl font-bold"
							class:text-green-600={t.userRole === 'payee'}
							class:text-red-600={t.userRole === 'payer'}
						>
							{t.totalAmountForUser.toFixed(2)}
						</span>
					</div>
					<div class="h-8"><Icon src={ChevronRight} /></div>
				</div></a
			>
		{/each}
	</div>
{/if}

<div class="w-full flex p-4 mb-8 justify-around items-center">
	<a href="/w/credit">
		<div class="flex flex-col items-center bg-amber-50 py-8 px-12 rounded-lg shadow-md">
			<Icon src={ArrowUpTray} class="h-12 text-cc-black" />
			<span>Send</span>
		</div>
	</a>
	<a href="/w/bill">
		<div class="flex flex-col items-center bg-amber-50 py-8 px-12 rounded-lg shadow-md">
			<Icon src={ArrowDownTray} class="h-12 text-cc-black" />
			<span>Receive</span>
		</div>
	</a>
</div>

<a href="/history">
	<div class="w-full bg-amber-200 h-12 rounded-lg shadow-md flex justify-center items-center">
		<span class="flex text-xl items-center">
			<div class="h-8 px-4"><Icon src={ListBullet} class="h-8 text-cc-black" /></div>
			Transactions
		</span>
	</div>
</a>
