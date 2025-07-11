<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from 'vue';

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
            <v-card-title>Changelog</v-card-title>
            <v-card-actions>
                <v-btn color="primary" text @click="close">Close</v-btn>
            </v-card-actions>
            <v-card-text>
                <div class="vp-doc" v-html="props.content"></div>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>
