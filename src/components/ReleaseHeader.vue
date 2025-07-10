<template>
    <div class="links-div">
        <span>
            <a href="/">Home</a>
        </span>
        <!-- TODO: fix -->
        <!-- <span>
             format: https://github.com/tauri-apps/tauri/releases/tag/tauri-v2.6.1 for each version - or CHANGELOG.MD for the full changelog page
            <a :href="href" target="_blank" rel="noopener">View on GitHub</a>
        </span> -->
    </div>
</template>

<script>
export default {
    name: 'ReleaseHeader',
    props: {
        href: {
            type: String,
            required: true,
        }
    },
};
</script>

<style scoped>
.links-div {
    margin-bottom: 3rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 1rem;
}
</style>