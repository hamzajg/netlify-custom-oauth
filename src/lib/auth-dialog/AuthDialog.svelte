<script>
  import { browser } from '$app/env';
  import { onMount } from 'svelte';
  import Authentication from './Authentication.js';
  import { user } from "../../stores";
  import { goto } from '$app/navigation';
  
  export let action;
  let email, fullName, companyName, password, confirmPassword, errorMessage = "", successMessage = "";

  const cleanMessages = ()=>{
    errorMessage = "";
    successMessage = "";
  }

  export const open = (actionName)=> {
      cleanMessages();
      
      action = actionName;
  }

  export const logout = ()=> {
		goto('/');
		user.logout();
  }

  const oauth = (provider) => {
    Authentication.externalLogin(provider);
  }

	const login = async () => {
		if(email && password) {
      errorMessage = "";
      const error = await Authentication.login({email, password});
      if(!error || error === "[object Object]"){
        goto('/home');
      }

      errorMessage = "" + error;
    }
    else {
      errorMessage = "Email and Password are required.";
    }
	}

	const signup = async () => {

    if(!fullName) {
      errorMessage = "Full Name is required.";
      return;
    }
    if(!email) {
      errorMessage = "Email is required.";
      return;
    }
    if(!password) {
      errorMessage = "Password is required.";
      return;
    }
    if(password.length < 8) {
      errorMessage = "Passwords must be at least 8 characters long.";
      return;
    }
		if(password === confirmPassword) {
      errorMessage = "";
      const error = await Authentication.signup({fullName, companyName, email, password});  
      if(error) {
        errorMessage = error;
      } else {
        errorMessage = "";
        successMessage = "A confirmation Email was sent.";
      }
    }
    else {
      errorMessage = "Password don't match.";
    }
	}

  const forgotPassword = async () => {

    if(!email) {
      errorMessage = "Email is required.";
      return;
    }
    const error = await Authentication.forgotpassword(email);  
    if(error) {
      errorMessage = error;
    } else {
      errorMessage = "";
      successMessage = "A Reset password Email was sent.";
    }
  }

  const updatePassword = async () => {

    if(!password) {
      errorMessage = "Password is required.";
      return;
    }
    if(password.length < 8) {
      errorMessage = "Passwords must be at least 8 characters long.";
      return;
    }
    const error = await Authentication.updatepassword(email);  
    if(error) {
      errorMessage = error;
    } else {
      errorMessage = "";
      successMessage = "Password updated.";
    }
  }
  
  onMount(() => {
    if (browser && window.location.href.includes("recovery_token"))
      open("updatepassword")
  })
 
</script>

	<div style="width:350px">
		{#if action === 'login'}
		<h1 class="mb-8 text-3xl text-center">Log In</h1>
		<input type="text" class="block border border-grey-light w-full p-2 rounded mb-4" name="email" placeholder="Email" bind:value={email} />
		<input type="password" class="block border border-grey-light w-full p-2 rounded mb-4" name="password" placeholder="Password" bind:value={password} />
    <label for='submit' class="text-red-500">{errorMessage}</label>
    <label for='submit' class="text-green-500">{successMessage}</label>
    <div class="grid grid-cols-2 grid-rows-1">
      <label class="inline-flex items-center" for="rememberme">
        <input id="rememberme" class="no-underline border-b border-blue text-blue" type="checkbox" />      
        <span class="ml-2">Remember me.</span>
      </label>
      <a class="no-underline border-b border-blue text-blue justify-items-end" href="/" on:click="{() => open('forgotpassword')}">
        Forgot Password.</a>
    </div>
		<button type="submit" class="w-full text-center py-2 p-2 pl-5 pr-5 bg-green-500 text-gray-100 text-lg rounded-lg focus:border-4 border-green-300" on:click="{() => login()}">Login</button>
		<div class="text-grey-dark">
			Don't have an account? 
			<a class="no-underline border-b border-blue text-blue" href="/" on:click="{() => open('signup')}">
				Create one now
			</a>.
		</div>
		{:else if action === 'signup'}
		  <h1 class="mb-8 text-3xl text-center">Sign Up</h1>
			<input type="text" class="block border border-grey-light w-full p-2 rounded mb-4" name="fullname" placeholder="Full Name" bind:value={fullName} />
			<input type="text" class="block border border-grey-light w-full p-2 rounded mb-4" name="companyname" placeholder="Company Name" bind:value={companyName} />
			<input type="email" class="block border border-grey-light w-full p-2 rounded mb-4" name="email" placeholder="Email" bind:value={email} />
			<input type="password" class="block border border-grey-light w-full p-2 rounded mb-4" name="password" placeholder="Password" bind:value={password} />
			<input type="password" class="block border border-grey-light w-full p-2 rounded mb-4" name="confirm_password" placeholder="Confirm Password" bind:value={confirmPassword} />
			<label for='submit' class="text-red-500">{errorMessage}</label>
      <label for='submit' class="text-green-500">{successMessage}</label>
      <button type="submit" class="w-full text-center py-2 pl-5 pr-5 bg-blue-500 text-gray-100 text-lg rounded-lg focus:border-4 border-blue-300" on:click={() => signup()}>Create Account</button>
			<div class="text-grey-dark">
				Already have an account? 
				<a class="no-underline border-b border-blue text-blue" href="/" on:click="{() => open('login')}">
						Log in
				</a>.
			</div>
    {:else if action === 'forgotpassword'}
		  <h1 class="mb-8 text-3xl text-center">Forgot Password</h1>
			<input type="email" class="block border border-grey-light w-full p-2 rounded mb-4" name="email" placeholder="Email" bind:value={email} />
			<label for='submit' class="text-red-500">{errorMessage}</label>
      <label for='submit' class="text-green-500">{successMessage}</label>
      <button type="submit" class="w-full text-center py-2 p-2 pl-5 pr-5 bg-green-500 text-gray-100 text-lg rounded-lg focus:border-4 border-green-300" on:click={() => forgotPassword()}>Send recovery Email</button>
			<div class="flex justify-center text-grey-dark">
				<a class="no-underline border-b border-blue text-blue" href="/" on:click="{() => open('login')}">
						Never mind
				</a>
			</div>
      {:else if action === 'updatepassword'}
        <h1 class="mb-8 text-3xl text-center">Update Password</h1>
        <input type="password" class="block border border-grey-light w-full p-2 rounded mb-4" name="password" placeholder="New Password" bind:value={password} />
        <label for='submit' class="text-red-500">{errorMessage}</label>
        <label for='submit' class="text-green-500">{successMessage}</label>
        <button type="submit" class="w-full text-center py-2 p-2 pl-5 pr-5 bg-green-500 text-gray-100 text-lg rounded-lg focus:border-4 border-green-300" on:click={() => updatePassword()}>Update Password</button>
        <div class="flex justify-center text-grey-dark">
          <a class="no-underline border-b border-blue text-blue" href="/" on:click="{() => open('login')}">
              Never mind
          </a>
        </div>
		{/if}
    <hr />
    <div class="g-signin2" data-longtitle="true" data-onsuccess="onSignIn"/>
    <button class="w-full bg-blue-500 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-lg mt-3" on:click="{() => oauth('Google')}">
      <i class="fab fa-google"></i> Continue with Google
    </button>
    <button class="w-full bg-gray-500 hover:bg-gray-700 text-white text-center py-2 px-4 rounded-lg mt-3" on:click="{() => oauth('GitHub')}">
      <i class="fab fa-github"></i> Continue with GitHub
    </button>
  </div>
