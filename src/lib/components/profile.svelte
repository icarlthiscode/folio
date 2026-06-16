<script lang="ts">
  import { browser } from '$app/environment';
  import useConfig from '$lib/hooks/useConfig';
  import useLocale from '$lib/hooks/useLocale';
  import useThemes from '$lib/hooks/useThemes';
  import SplitStack from '$lib/materials/splitStack.svelte';
  import NavLinks from '$lib/materials/navLinks.svelte';
  import TitleCard from '$lib/materials/titleCard.svelte';
  import Tagline from '$lib/materials/tagline.svelte';
  import Graphic from '$lib/materials/graphic.svelte';
  import Frame from '$lib/materials/frame.svelte';

  import FavouriteList from './favouriteList.svelte';

  const { config } = useConfig();
  const { locale } = useLocale();
  const {
    graphic : avatarGraphic,
  } = (() => useThemes({ graphicKey : 'avatar' }))();

  let hasAvatar = $derived(!!$avatarGraphic?.src);
</script>

<SplitStack divide stack={['mobile', 'tablet', 'desktop']}>
  <SplitStack stack={['mobile', 'tablet', 'desktop', 'wide']}>
    <SplitStack stackOrder="reverse" stack={['mobile', 'tablet']}>
      {#if hasAvatar}
        <Frame rotation={45} show={browser}>
          <Graphic graphic="avatar" show={browser} />
        </Frame>
      {/if}
      <TitleCard
        title={$locale.title}
        subtitle={$locale.subtitle}
        showGraphic={browser}
      />
    </SplitStack>
    {#if $locale.tagline}
      <Tagline>{ $locale.tagline }</Tagline>
    {/if}
  </SplitStack>
  {#if ($config.likes?.length || $config.dislikes?.length)}
    <SplitStack alignment="start" stack={['mobile', 'wide']}>
      {#if $config.likes?.length}
        <FavouriteList rank="most" headingElement="h2" />
      {/if}
      {#if $config.dislikes?.length}
        <FavouriteList rank="least" headingElement="h2" />
      {/if}
    </SplitStack>
  {/if}
</SplitStack>
{#if $config.profileLinks && ($config.profileLinks.length > 0)}
  <NavLinks links={$config.profileLinks} justify="start" />
{/if}
