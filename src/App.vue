<!--
=============================================================================
文件: src/App.vue — Vue 根组件
负责人: 人一 (用户认证与权限体系)
讲解要点:
  1. <router-view /> — Vue Router 的"占位符"组件
  2. 根据当前 URL 路径，router-view 自动渲染对应的页面组件
     例如: / → Login.vue
           /admin → Admin.vue
           /student → Student.vue
  3. 整个 App.vue 只做"路由出口"这一件事，页面切换逻辑完全交给 router
=============================================================================
-->
<template>
  <router-view />
</template>
