<script>
	import { createPortal } from '../utils';
	import '../app.postcss';
	import Authentication from '$lib/auth-dialog/';
  import { onMount } from 'svelte';
  import { browser } from '$app/env';
  import { user } from "../stores";
  import { goto } from '$app/navigation';
	
  function handleUserAction(action) {
    goto(`/${action}`);
	}

	$: isLoggedIn = browser && !!$user;
	onMount(() => {
		browser && Authentication.externalLoginListener();
	});
</script>
<div class="flex flex-wrap">
  {#if !isLoggedIn}
			<button class="max-w-sm md:max-w-lg text-center pl-5 pr-5 m-1 font-medium text-black text-md rounded-md border-green-300 " on:click={() => handleUserAction('login')}>LOG IN</button>
			<button class="max-w-sm md:max-w-lg text-center pl-5 pr-5 m-1 font-medium bg-yellow-400 text-black text-md rounded-md border-white-100" on:click={() => handleUserAction('signup')}>SIGN UP</button>
		{/if}
	<div class="w-full inline-flex flex-col">
		<div class="flexor-content flex-1 mt-16">
			<div use:createPortal={'portal'}>
				<slot />
			</div>
		</div>
	</div>
</div>
