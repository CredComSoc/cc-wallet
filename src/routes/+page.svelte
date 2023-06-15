<script lang="ts">
	import { ArrowDownTray, ArrowUpTray, Icon, QueueList } from 'svelte-hero-icons';
	import { user } from '../stores/user';

	let balance: number | null = null;
	let positiveLimit: number | null = null;
	let negativeLimit: number | null = null;

	user.subscribe(async (u) => {
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
		}
	});
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

Pending transactions...

<div class="w-full flex p-4 mb-8 justify-around items-center">
	<div class="flex flex-col items-center bg-red-200 py-8 px-12 rounded-lg shadow-md">
		<Icon src={ArrowUpTray} class="h-12 text-cc-black" />
		<span>Send</span>
	</div>
	<div class="flex flex-col items-center bg-red-200 py-8 px-12 rounded-lg shadow-md">
		<Icon src={ArrowDownTray} class="h-12 text-cc-black" />
		<span>Receive</span>
	</div>
</div>

<div class="w-full bg-amber-50 h-12 rounded-lg shadow-md flex justify-center items-center">
	<span class="flex text-xl items-center">
		<Icon src={QueueList} class="text-amber-900 h-8 text-cc-black px-6" />
		Transactions
	</span>
</div>
