<script lang="ts">
    import type { PageData } from './$types';
    
    export let data: PageData;
</script>

<h1>Accounts on trunk</h1>
{data.json.data}
