import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';
import Myplugin from './plugins/Myplugin';

const app = createApp(App)
console.log(app.config);
app.use(Myplugin, {
  zh: {
    hello: '你好，世界',
    welcome: '欢迎使用 Vue3 + Vite + Ant Design Vue + Vue Query 搭建的项目模板',

  }
})
.use(Antd)
.mount('#app')
