<template>
    <div class="links-div">
        <span>
            <a href="/">Return</a>
        </span>
        <span>
            <a :href="href" target="_blank" rel="noopener">View on GitHub</a>
        </span>
    </div>
</template>
<!-- : script setup lang="ts"> -->
<script>
export default {
    name: 'ReleaseLinks',
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