<script lang="ts">
  import { browser } from '$app/environment';
  import useLocale from '$lib/hooks/useLocale';
  import TitleCard from '$lib/materials/titleCard.svelte';

  const { status, message } : {
    status : number;
    message ?: string;
  } = $props();

  const { locale } = useLocale();
  const errorLocale = $locale.errors;

  const detail = $derived.by(() => {
    switch (status) {
      case 400: return errorLocale.invalid;
      case 401: return errorLocale.notAuthenticated;
      case 403: return errorLocale.forbidden;
      case 404: return errorLocale.notFound;
      case 500: return errorLocale.unexpected;
      default: return errorLocale.default;
    }
  });
</script>

<TitleCard
  title={`${status} ${message}`}
  subtitle={detail}
  showGraphic={browser}
/>
