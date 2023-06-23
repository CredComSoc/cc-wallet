<script lang="ts">
	import '../app.postcss';
	import { onMount } from 'svelte';
	import { user } from '../stores/user';
	import { Icon, ChevronRight, ArrowRightOnRectangle, User } from 'svelte-hero-icons';
	import { goto } from '$app/navigation';

	let mounted = false;

	onMount(() => {
		user.useLocalStorage();
		mounted = true;
	});

	async function logIn() {
		localUserIdHasError = localUserId === null || localUserId === '';
		localUserPassHasError = localUserPass === null || localUserPass === '';
		localUserNodeHasError = localUserNode === null || localUserNode === '';
		if (!localUserIdHasError && !localUserNodeHasError && !localUserPassHasError) {
			const res = await fetch(localUserNode + '/absolutepath', {
				headers: {
					'cc-user': localUserId,
					'cc-auth': localUserPass
				}
			});
			const json = await res.json();
			const nodeName = json.data.slice(-1);

			user.set({
				id: localUserId,
				pass: localUserPass,
				node: localUserNode,
				nodeName,
				isLoggedIn: true
			});

			localUserId = '';
			localUserIdHasError = false;
			localUserPass = '';
			localUserPassHasError = false;
			localUserNode = '';
			localUserNodeHasError = false;
		}
	}

	function onKeyUp(event: KeyboardEvent) {
		if (event.key === 'Enter') logIn();
	}

	function logOut() {
		user.set({ id: '', pass: '', node: '', nodeName: '', isLoggedIn: false });
		goto('/');
	}

	let localUserId = '';
	let localUserIdHasError = false;
	let localUserPass = '';
	let localUserPassHasError = false;
	let localUserNode = '';
	let localUserNodeHasError = false;
</script>

<div class="m-auto max-w-xl flex items-center h-full p-4">
	{#if $user.isLoggedIn}
		<div class="w-full h-full bg-white shadow-lg rounded flex flex-col">
			<div class="h-24 flex items-center p-4">
				<a href="/">
					<img src="/cc-logo.png" class="h-12 my-2 mx-4" alt="Logo of the Credit Commons" />
				</a>
				<a href="/"><div class="h-12 flex items-center">{$user.nodeName}</div></a>
				<div class="flex-grow" />
				<a href="/"
					><div class="flex flex-col items-center mx-4">
						<Icon src={User} class="h-12 text-cc-black" />{$user.id}
					</div></a
				>
				<div class="mx-4 cursor-pointer" on:click={logOut} on:keyup={logOut}>
					<Icon src={ArrowRightOnRectangle} class="h-12 text-cc-black" />
				</div>
			</div>

			<div class="flex-grow p-8">
				<slot />
			</div>
		</div>
	{:else if !$user.isLoggedIn && mounted}
		<form class="bg-white shadow-md w-full rounded px-8 pt-6 pb-8 mb-4">
			<div class="flex justify-center my-6">
				<img src="/cc-logo.png" alt="Logo of the Credit Commons" />
			</div>
			<div class="mb-4">
				<label class="block text-gray-700 text-sm font-bold mb-2" for="node"> Node URL </label>
				<input
					class="shadow appearance-none border rounded w-full py-2 px-3 mb-1 text-gray-700 leading-tight ring-ccgreen focus:ring-ccgreen focus:border-ccgreen focus:outline-none focus:shadow-outline"
					id="node"
					type="text"
					required
					bind:value={localUserNode}
					on:keyup={onKeyUp}
					placeholder="http://localhost:8002"
				/>
				{#if localUserNodeHasError}
					<p class="text-red-500 text-xs italic">Invalid node.</p>
				{/if}
			</div>
			<div class="mb-4">
				<label class="block text-gray-700 text-sm font-bold mb-2" for="userid"> User ID </label>
				<input
					class="shadow appearance-none border rounded w-full py-2 px-3 mb-1 text-gray-700 leading-tight ring-ccgreen focus:ring-ccgreen focus:border-ccgreen focus:outline-none focus:shadow-outline focus:border-ccgreen????"
					id="userid"
					type="text"
					required
					bind:value={localUserId}
					on:keyup={onKeyUp}
					placeholder="User ID"
				/>
				{#if localUserIdHasError}
					<p class="text-red-500 text-xs italic">Enter a user ID.</p>
				{/if}
			</div>
			<div class="mb-6">
				<label class="block text-gray-700 text-sm font-bold mb-2" for="password"> Password </label>
				<input
					class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-1 leading-tight ring-ccgreen focus:ring-ccgreen focus:border-ccgreen focus:outline-none focus:shadow-outline"
					id="password"
					type="password"
					required
					bind:value={localUserPass}
					on:keyup={onKeyUp}
					placeholder="******************"
				/>
				{#if localUserPassHasError}
					<p class="text-red-500 text-xs italic">Enter a password.</p>
				{/if}
			</div>
			<div class="flex items-center justify-center">
				<button
					class="bg-ccgreen inline-flex items-center justify-center gap-2 hover:bg-ccblack text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
					type="button"
					on:click={logIn}
				>
					Sign In
					<Icon src={ChevronRight} size="24" class="px-0" />
				</button>
			</div>
		</form>
	{:else}
		<div class="absolute top-0 left-0 w-full h-screen flex items-center justify-center">
			<img src="/cc-logo.png" alt="cc logo" class="animate-bounce" />
		</div>
	{/if}
</div>
