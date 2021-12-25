<script>
	
  import { browser } from "$app/env";
  import { goto } from '$app/navigation';
  import { user } from '../stores';

  if(browser && !(!!$user))goto("/");
</script>

Welcome Home Page