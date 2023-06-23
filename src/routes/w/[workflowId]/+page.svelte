<script lang="ts">
	import { user } from '../../../stores/user';
	import { page } from '$app/stores';
	import { ArrowDownTray, ArrowPath, ArrowUpTray, ChevronRight, Icon } from 'svelte-hero-icons';
	import { goto } from '$app/navigation';
	import { onDestroy } from 'svelte';

	let workflowId: string | null = null;
	let amount: number = 0;
	let amountError = false;
	let otherParty: string = '';
	let otherPartyError = false;
	let message: string = '';
	let isLoading = false;
	let postError = '';

	const unsubscribe = page.subscribe((p) => {
		if (p.params.workflowId === 'bill' || p.params.workflowId === 'credit') {
			workflowId = p.params.workflowId;
		} else {
			goto('/');
		}
	});

	function onKeyUp(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			nextStep();
		}
	}

	async function nextStep() {
		if (amount < 0.05) {
			amountError = true;
		} else {
			amountError = false;
		}
		if (otherParty === '' || !otherParty) {
			otherPartyError = true;
		} else {
			otherPartyError = false;
		}
		if (!amountError && !otherPartyError) {
			const payer = workflowId === 'credit' ? $user.id : otherParty;
			const payee = workflowId === 'credit' ? otherParty : $user.id;

			isLoading = true;
			const data = await fetch(`${$user.node}/transaction`, {
				method: 'POST',
				headers: {
					'cc-user': $user.id,
					'cc-auth': $user.pass
				},
				body: JSON.stringify({
					quant: amount,
					payer,
					payee,
					description: message,
					type: workflowId ?? ''
				})
			});
			const json = await data.json();
			if (data.ok) {
				postError = '';
				goto(`/t/${json.data.uuid}`);
			} else {
				if (json.errors[0].class === 'PathViolation') {
					postError = `Account ${otherParty} not found (${json.errors[0].node})`;
				} else if (json.errors[0].class === 'MaxLimitViolation') {
					postError = `Limit violation (${json.errors[0].node})`;
				} else {
					postError = `${json.errors[0].class} (${json.errors[0].node})`;
				}
			}
			isLoading = false;
		}
	}
	onDestroy(unsubscribe);
</script>

{#if workflowId}
	{#if workflowId === 'credit'}
		<!-- Confirming bill request from someone else -->
		<div class="h-8 flex items-center gap-4 mb-4">
			<div class="h-8"><Icon src={ArrowUpTray} /></div>
			<span class="flex-grow">Send</span>
		</div>
	{:else if workflowId === 'bill'}
		<!-- Confirming a bill before sending to someone else -->
		<div class="h-8 flex items-center gap-4 mb-4">
			<div class="h-8"><Icon src={ArrowDownTray} /></div>
			<span class="flex-grow">Receive</span>
		</div>
	{/if}

	<div class="mb-6">
		<label class="block text-gray-700 text-sm font-bold mb-2" for="password"
			>Amount<span class="text-red-500">*</span></label
		>
		<input
			class="h-24 text-6xl shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-1 leading-tight ring-ccgreen focus:ring-ccgreen focus:border-ccgreen focus:outline-none focus:shadow-outline text-center"
			style="text-align: center;"
			id="amount"
			type="number"
			required
			bind:value={amount}
			on:keydown={(e) => {
				if (/^[\.,]$/i.test(e.key)) {
					e.preventDefault();
				}
			}}
			min="0"
			on:keyup={onKeyUp}
		/>
		{#if amountError}
			<p class="text-red-500 text-xs italic">Amount error.</p>
		{/if}
	</div>
	<div class="mb-6">
		<label class="block text-gray-700 text-sm font-bold mb-2" for="password">
			{workflowId === 'credit' ? 'Recipient' : 'Payer'} (full path)<span class="text-red-500"
				>*</span
			>
		</label>
		<input
			class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-1 leading-tight ring-ccgreen focus:ring-ccgreen focus:border-ccgreen focus:outline-none focus:shadow-outline"
			id="amount"
			type="text"
			required
			bind:value={otherParty}
			on:keydown={() => false}
			min="0"
			on:keyup={onKeyUp}
		/>
		{#if otherPartyError}
			<p class="text-red-500 text-xs italic">
				{workflowId === 'credit' ? 'Recipient' : 'Payer'} error.
			</p>
		{/if}
	</div>
	<div class="mb-6">
		<label class="block text-gray-700 text-sm font-bold mb-2" for="password">Message</label>
		<input
			class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-1 leading-tight ring-ccgreen focus:ring-ccgreen focus:border-ccgreen focus:outline-none focus:shadow-outline"
			id="amount"
			type="text"
			required
			bind:value={message}
			on:keydown={() => false}
			min="0"
			on:keyup={onKeyUp}
		/>
		<!--{#if localUserPassHasError}
			<p class="text-red-500 text-xs italic">Enter a password.</p>
		{/if}-->
	</div>
	<div class="flex items-center justify-center">
		<button
			class="bg-ccgreen inline-flex items-center justify-center gap-2 hover:bg-ccblack text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
			type="button"
			on:click={nextStep}
		>
			Next
			{#if isLoading}
				<Icon src={ArrowPath} size="24" class="animate-spin px-0" />
			{:else}
				<Icon src={ChevronRight} size="24" class="px-0" />
			{/if}
		</button>
	</div>
	<div class="w-full flex items-center justify-center">
		{#if postError !== ''}
			<span class="block text-red-700 text-sm font-bold mb-2">
				Error: {postError}
			</span>
		{/if}
	</div>
{/if}
