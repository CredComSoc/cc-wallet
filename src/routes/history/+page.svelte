<script lang="ts">
	import { user } from '../../stores/user';
	import { ArrowDownTray, ArrowUpTray, ChevronRight, Icon } from 'svelte-hero-icons';
	import type { FrontCCTransaction } from '../../types/types';
	import { transactionsToFrontTransactions } from '$lib/transactions';
	import { onDestroy } from 'svelte';

	let txs: FrontCCTransaction[] = [];

	const unsubscribe = user.subscribe((u) => {
		if (u.id !== '') {
			fetch(`${u.node}/transactions?involving=${u.id}&state=completed`, {
				headers: {
					'cc-user': u.id,
					'cc-auth': u.pass
				}
			})
				.then((res) => res.json())
				.then((json) => {
					txs = transactionsToFrontTransactions(json.data, u);
				});
		}
	});
	onDestroy(() => unsubscribe());
</script>

{#if txs.length > 0}
	{#each txs as t}
		<a href="/t/{t.uuid}" title="view transaction">
			<div class="w-full bg-amber-200 flex items-center p-4 gap-2 rounded-xl shadow-md mb-2">
				<div class="h-8">
					<Icon src={t.userRole === 'payee' ? ArrowDownTray : ArrowUpTray} />
				</div>
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
{/if}
