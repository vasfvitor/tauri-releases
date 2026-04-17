<script setup lang="ts">
// biome-ignore lint/correctness/noUnusedVariables: Used by the Vue template.
const back = () => history.back();

defineProps<{
  href?: string;
}>();
</script>


<template>
    <div :class="$style['links-div']">
        <span>
            <a href="#" @click.prevent="back">
                <slot>Back</slot>
            </a>
        </span>
        <span v-if="href">
            <a :href="href" target="_blank" rel="noopener">View on GitHub</a>
        </span>
    </div>
</template>

<style module>
.links-div {
    margin-bottom: 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 1rem;
}
</style>
