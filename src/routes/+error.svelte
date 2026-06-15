<script lang="ts">
  import { browser } from '$app/environment';
  import { page } from '$app/state';
  import Content from '$lib/materials/content.svelte';
  import Nav from '$lib/components/nav.svelte';
  import HttpError from '$lib/components/httpError.svelte';
</script>

<Content
  section="error"
  alignment="centre"
  justification="centre"
  hasTopNav
  showBackground={browser}
>
  <Nav targets={['home']} />
  <HttpError status={page.status} message={page.error?.message} />
</Content>
