<template>
  <div>
    <h1>我自定义的内容</h1>
    <component :is="h(AInput, {...$attrs, ref: changeRef, onClick: handleClick}, $slots)"></component>
  </div>
</template>

<script lang="ts">
  export default {
    name: 'MyInput',
  }
</script>

<script setup lang="ts">
import { ComponentInstance, getCurrentInstance, h } from 'vue';
import { Input as AInput } from 'ant-design-vue';

/**
 * 属性
 * 事件
 * 插槽
 * 方法
 * 类型
 */
const vm = getCurrentInstance()

const changeRef = (exposed) => {
  if (vm) {
    vm.exposed = exposed;
  }
}

const handleClick = () => {
  console.log('click');
}

defineExpose({} as ComponentInstance <typeof AInput>)
</script>