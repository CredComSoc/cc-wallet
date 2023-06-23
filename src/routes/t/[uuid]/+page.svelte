<script lang="ts">
	import { user } from '../../../stores/user';
	import type { FrontCCTransaction } from '../../../types/types';
	import { page } from '$app/stores';
	import { ArrowDownTray, ArrowRight, ArrowUpCircle, ArrowUpTray, Icon } from 'svelte-hero-icons';
	import {
		isUserEntryPayee,
		isUserEntryPayer,
		transactionsToFrontTransactions
	} from '$lib/transactions';
	import { goto } from '$app/navigation';
	import { onDestroy } from 'svelte';

	let t: FrontCCTransaction | null = null;
	let transitions: any | null = null;
	let isLoading = false;
	let transactionSucceeded = false;
	let patchError = '';
	let timeout: number | undefined = undefined;

	const unsubscribe = page.subscribe((p) => {
		if (p.params.uuid) {
			fetch(`${$user.node}/transaction/${p.params.uuid}`, {
				headers: {
					'cc-user': $user.id,
					'cc-auth': $user.pass
				}
			})
				.then((res) => res.json())
				.then((json) => {
					t = transactionsToFrontTransactions([json.data], $user)[0];
					transitions = json.meta.transitions[p.params.uuid];
				});
		}
	});

	async function makeTransition(transition: string) {
		isLoading = true;
		const data = await fetch(`${$user.node}${transition}`, {
			method: 'PATCH',
			headers: {
				'cc-user': $user.id,
				'cc-auth': $user.pass
			}
		});
		if (data.ok) {
			patchError = '';
			transactionSucceeded = true;
			timeout = setTimeout(() => goto('/'), 2000);
		} else {
			const json = await data.json();
			if (json.errors[0].class === 'MaxLimitViolation') {
				patchError = `Limit violation (${json.errors[0].node})`;
			} else {
				patchError = `${json.errors[0].class} (${json.errors[0].node})`;
			}
		}
		isLoading = false;
	}
	onDestroy(() => {
		clearTimeout(timeout);
		unsubscribe();
	});
</script>

{#if transactionSucceeded}
	<div class="w-full h-[20rem] flex flex-col items-centerjustify-center gap-8">
		<div class="h-48"><Icon src={ArrowUpCircle} class="text-green-500" /></div>
		<span class="text-4xl text-center">Transaction transitioned!</span>
		<span class="text-xl text-center">Redirecting...</span>
	</div>
{:else if t}
	<div class="flex flex-col gap-4">
		{#if t.userRole === 'payer'}
			<!-- Confirming bill request from someone else -->
			<div class="h-8 flex items-center gap-4 mb-4">
				<div class="h-8"><Icon src={ArrowUpTray} /></div>
				<span class="flex-grow">Send</span>
			</div>
		{:else if t.userRole === 'payee'}
			<!-- Confirming a bill before sending to someone else -->
			<div class="h-8 flex items-center gap-4 mb-4">
				<div class="h-8"><Icon src={ArrowDownTray} /></div>
				<span class="flex-grow">Receive</span>
			</div>
		{/if}
		{#if t.entries[0].description}
			<span class="ml-4 text-xs uppercase text-gray-700 -mb-4">Description</span>
			<span class="bg-gray-200 p-4 rounded-md">
				{t.entries[0].description}
			</span>
		{/if}
		<table class="w-full">
			{#each t.entries.filter((e) => isUserEntryPayee(e, $user) || isUserEntryPayer(e, $user)) as e, i}
				{#if i === 0}
					<tr class="h-12 font-bold">
						<td>{e.payer}</td>
						<td><div class="h-4 mx-2"><Icon src={ArrowRight} /></div></td>
						<td>{e.payee}</td>
						<td class="text-right">{isUserEntryPayer(e, $user) ? '-' : ''}{e.quant.toFixed(2)}</td>
					</tr>
				{:else}
					<tr>
						<td>{e.payer}</td>
						<td><div class="h-4 mx-2"><Icon src={ArrowRight} /></div></td>
						<td>{e.payee}</td>
						<td class="text-right">{isUserEntryPayer(e, $user) ? '-' : ''}{e.quant.toFixed(2)}</td>
					</tr>
				{/if}
			{/each}
			<tr class="h-4" />
			<tr class="border-t-2">
				<td colspan="3" />
				<td class="text-right font-bold">
					{(
						t.entries
							.filter((e) => isUserEntryPayee(e, $user))
							.reduce((acc, e) => acc + e.quant, 0) -
						t.entries.filter((e) => isUserEntryPayer(e, $user)).reduce((acc, e) => acc + e.quant, 0)
					).toFixed(2)}
				</td>
			</tr>
		</table>

		{#each Object.keys(transitions) as t}
			{#if t === 'completed'}
				<div class="w-full p-2">
					<button
						class="w-full p-4 bg-green-500 uppercase text-xl rounded shadow-md"
						on:click={() => makeTransition(transitions[t])}>Confirm</button
					>
				</div>
			{:else if t === 'validated'}
				<div class="w-full p-2">
					<button
						class="w-full p-4 bg-green-500 uppercase text-xl rounded shadow-md"
						on:click={() => makeTransition(transitions[t])}>Validate</button
					>
				</div>
			{:else if t === 'erased'}
				<div class="w-full p-2">
					<button
						class="w-full p-4 bg-red-400 uppercase text-xl rounded shadow-md"
						on:click={() => makeTransition(transitions[t])}>Cancel</button
					>
				</div>
			{:else if t === 'pending'}
				<div class="w-full p-2">
					<button
						class="w-full p-4 bg-green-500 uppercase text-xl rounded shadow-md"
						on:click={() => makeTransition(transitions[t])}>Send</button
					>
				</div>
			{:else if t === 'null'}
				<div class="w-full p-2">
					<button
						class="w-full p-4 bg-red-400 uppercase text-xl rounded shadow-md"
						on:click={() => makeTransition(transitions[t])}>Cancel</button
					>
				</div>
			{:else}
				Unhandled transition: {t}
			{/if}
		{/each}
		<div class="w-full flex items-center justify-center">
			{#if patchError !== ''}
				<span class="block text-red-700 text-sm font-bold mb-2">
					Error: {patchError}
				</span>
			{/if}
		</div>
	</div>
{/if}
