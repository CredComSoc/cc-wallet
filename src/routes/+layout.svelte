<script lang="ts">
	import '../app.postcss';
	import { onMount } from 'svelte';
	import { user } from '../stores/user';
	import { Icon, ChevronRight, ArrowRightOnRectangle, User } from 'svelte-hero-icons';

	let mounted = false;

	onMount(() => {
		user.useLocalStorage();

		mounted = true;
		// console.log(localStorage.getItem('country'));
	});

	function logIn() {
		console.log({ id: localUserId, pass: localUserPass, node: localUserNode, isLoggedIn: true });

		localUserIdHasError = localUserId === null || localUserId === '';
		localUserPassHasError = localUserPass === null || localUserPass === '';
		localUserNodeHasError = localUserNode === null || localUserNode === '';
		if (!localUserIdHasError && !localUserNodeHasError && !localUserPassHasError) {
			user.set({ id: localUserId, pass: localUserPass, node: localUserNode, isLoggedIn: true });
		}
	}

	function logOut() {
		user.set({ id: '', pass: '', node: '', isLoggedIn: false });
	}

	let localUserId = '';
	let localUserIdHasError = false;
	let localUserPass = '';
	let localUserPassHasError = false;
	let localUserNode = '';
	let localUserNodeHasError = false;

	let nodeName = '';

	user.subscribe((u) => {
		if (u.isLoggedIn) {
			fetch(u.node + '/absolutepath', {
				headers: {
					'cc-user': u.id,
					'cc-auth': u.pass
				}
			})
				.then((res) => res.json())
				.then((r) => (nodeName = r.data.slice(-1)));
		}
	});
</script>

<div class="m-auto max-w-xl flex items-center h-screen p-4">
	{#if $user.isLoggedIn}
		<div class="w-full h-full bg-white shadow-lg rounded flex flex-col">
			<div class="h-24 flex items-center p-4">
				<img src="cc-logo.png" class="h-12 my-2 mx-4" alt="Logo of the Credit Commons" />
				<div>{nodeName}</div>
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
				<img src="cc-logo.png" alt="Logo of the Credit Commons" />
			</div>
			<div class="mb-4">
				<label class="block text-gray-700 text-sm font-bold mb-2" for="node"> Node URL </label>
				<input
					class="shadow appearance-none border rounded w-full py-2 px-3 mb-1 text-gray-700 leading-tight ring-ccgreen focus:ring-ccgreen focus:border-ccgreen focus:outline-none focus:shadow-outline"
					id="node"
					type="text"
					required
					bind:value={localUserNode}
					placeholder="https://thun.cc"
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
		<img src="cc-logo.png" alt="cc logo" class="animate-spin" />
	{/if}
</div>
