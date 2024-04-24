<script setup>
import { NCard } from 'naive-ui';
import MarkdownIt from 'markdown-it';
import { ABOUT } from "../config/constants";

const md = new MarkdownIt();
const about = md.render(ABOUT);
</script>

<template>
    <n-card style="text-align: left;">
        <div v-html="about"></div>
    </n-card>
</template>
