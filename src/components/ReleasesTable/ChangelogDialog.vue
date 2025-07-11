<script setup lang="ts">
import { ref, watch, defineEmits } from 'vue';

const props = defineProps<{
    modelValue: boolean;
    content: string | null;
}>();

const emit = defineEmits(['update:modelValue']);

const localValue = ref(props.modelValue);

watch(() => props.modelValue, (val) => {
    localValue.value = val;
});

watch(localValue, (val) => {
    emit('update:modelValue', val);
});

function close() {
    emit('update:modelValue', false);
}
</script>

<template>
    <v-dialog v-model="localValue" max-width="600px">
        <v-card>
            <v-card-text class="mb-0">
                <v-row align="center" justify="space-between">
                    <v-card-title>Changelog</v-card-title>
                    <v-btn variant="text" @click="close">Close</v-btn>
                </v-row>
                <v-divider></v-divider>
            </v-card-text>
            <v-card-text class="mt-n8 py-0">
                <div class="vp-doc" v-html="props.content"></div>
            </v-card-text>
        </v-card>

    </v-dialog>
</template>
