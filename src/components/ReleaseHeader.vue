<script setup lang="ts">
// biome-ignore lint/correctness/noUnusedVariables: Used by the Vue template.
const back = () => history.back();

defineProps<{
	githubRelease: string;
}>();
</script>


<template>
    <div class="links-div">
        <span>
            <a href="#" @click.prevent="back">
                <slot>Back</slot>
            </a>
        </span>
        <!-- TODO: fix -->

        <!-- <span>
             format: https://github.com/tauri-apps/tauri/releases/tag/tauri-v2.6.1 for each version - or CHANGELOG.MD for the full changelog page
            <a :href="githubRelease" target="_blank" rel="noopener">View on GitHub</a>
        </span> -->
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
