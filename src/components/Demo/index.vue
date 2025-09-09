<template>
  <div class="container">

    
    <div class="main-content">
      <div class="control-panel">
        <div class="form-group">
          <label for="testCount">测试次数:</label>
          <input type="number" id="testCount" v-model.number="testCount" min="1" max="10000" :disabled="isTesting">
        </div>
        
        <div class="qrcode-container">
          <p>当前测试二维码 ({{ currentTest }}/{{ testCount }})</p>
          <qrcode-vue :value="currentCode" :size="200" level="H" id="qrcode"></qrcode-vue>
          <p>原始: <strong>{{ currentCode }}</strong></p>
          <p>识别: <strong>{{ recognizedCode || '等待识别...' }}</strong></p>
        </div>
        
        <button @click="runTests" :disabled="isTesting">开始测试</button>
        <button @click="stopTests" :disabled="!isTesting">停止测试</button>
        
        <div class="stats">
          <h3>测试统计</h3>
          <div class="test-info">
            <span>成功: {{ successCount }}</span>
            <span>错误: {{ errorCount }}</span>
          </div>
          <div class="test-info">
            <span>成功率: {{ successRate }}%</span>
            <span>错误率: {{ errorRate }}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress" :style="{ width: progress + '%' }"></div>
          </div>
          <p>进度: {{ currentTest }}/{{ testCount }}</p>
        </div>
      </div>
      
      <div class="test-results">
        <h3>测试结果 (最近100条)</h3>
        <div v-for="result in testResults.slice(0, 100)" :key="result.id" class="result-item" :class="result.success ? 'success' : 'error'">
          <p><strong>#{{ result.id }}</strong> - {{ result.timestamp }} - 
            <span v-if="result.success">✅ 成功</span>
            <span v-else>❌ 错误</span>
          </p>
          <div class="code-comparison">
            <span class="original">原始: {{ result.original }}</span>
            <span class="recognized">识别: {{ result.recognized || '识别失败' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import QrcodeVue from 'qrcode.vue';
import jsQR from 'jsqr';

export default {
  name: 'QrCodeTestTool',
  components: {
    QrcodeVue
  },
  setup() {
    const testCount = ref(100);
    const currentTest = ref(0);
    const isTesting = ref(false);
    const testResults = ref([]);
    const successCount = ref(0);
    const errorCount = ref(0);
    const currentCode = ref('');
    const recognizedCode = ref('');
    

    // 生成以MED开头，后跟18位数字的字符串
    const generateRandomString = () => {
      const digits = '0123456789';
      let result = 'MED';
      for (let i = 0; i < 18; i++) {
        result += digits.charAt(Math.floor(Math.random() * digits.length));
      }
      return result;
    };
    
    // 识别二维码
    const recognizeQrCode = (canvas) => {
      const ctx = canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      return code ? code.data : null;
    };
    
    // 运行测试
    const runTests = async () => {
      isTesting.value = true;
      testResults.value = [];
      successCount.value = 0;
      errorCount.value = 0;
      
      for (let i = 0; i < testCount.value; i++) {
        if (!isTesting.value) break;
        
        currentTest.value = i + 1;
        currentCode.value = generateRandomString();
        
        // 等待下一次tick，确保二维码已更新
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // 获取canvas元素并识别
        const canvas = document.querySelector('#qrcode');
        recognizedCode.value = recognizeQrCode(canvas);
        
        // 记录结果
        const isSuccess = currentCode.value === recognizedCode.value;
        if (isSuccess) {
          successCount.value++;
        } else {
          errorCount.value++;
        }
        
        testResults.value.unshift({
          id: i + 1,
          original: currentCode.value,
          recognized: recognizedCode.value,
          success: isSuccess,
          timestamp: new Date().toLocaleTimeString()
        });
        
        // 添加一点延迟，避免UI阻塞
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      isTesting.value = false;
    };
    
    // 停止测试
    const stopTests = () => {
      isTesting.value = false;
    };
    
    // 成功率和错误率计算
    const successRate = computed(() => {
      const total = successCount.value + errorCount.value;
      return total > 0 ? (successCount.value / total * 100).toFixed(2) : '0.00';
    });
    
    const errorRate = computed(() => {
      const total = successCount.value + errorCount.value;
      return total > 0 ? (errorCount.value / total * 100).toFixed(2) : '0.00';
    });
    
    // 测试进度
    const progress = computed(() => {
      return (currentTest.value / testCount.value) * 100;
    });
    
    return {
      testCount,
      currentTest,
      isTesting,
      testResults,
      successCount,
      errorCount,
      currentCode,
      recognizedCode,
      runTests,
      stopTests,
      successRate,
      errorRate,
      progress
    };
  }
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.container {
  width: 95%;
  max-width: 1200px;
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin: 20px auto;
}

header {
  background: #3498db;
  color: white;
  padding: 20px;
  text-align: center;
}

h1 {
  font-size: 28px;
  margin-bottom: 10px;
}

.description {
  font-size: 16px;
  opacity: 0.9;
}

.main-content {
  display: flex;
  padding: 20px;
  gap: 20px;
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
  }
}

.control-panel {
  flex: 1;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 10px;
}

.test-results {
  flex: 2;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 10px;
  max-height: 90vh;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #2c3e50;
}

input, button {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
}

button {
  background: #3498db;
  color: white;
  border: none;
  cursor: pointer;
  transition: background 0.3s;
  margin-top: 10px;
  font-weight: 600;
}

button:hover {
  background: #2980b9;
}

button:disabled {
  background: #95a5a6;
  cursor: not-allowed;
}

.qrcode-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 20px 0;
  padding: 15px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

.result-item {
  padding: 15px;
  margin-bottom: 15px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.success {
  border-left: 5px solid #2ecc71;
}

.error {
  border-left: 5px solid #e74c3c;
}

.stats {
  background: #2c3e50;
  color: white;
  padding: 15px;
  border-radius: 8px;
  margin-top: 20px;
}

.progress-bar {
  height: 10px;
  background: #ecf0f1;
  border-radius: 5px;
  margin: 10px 0;
  overflow: hidden;
}

.progress {
  height: 100%;
  background: #3498db;
  border-radius: 5px;
  transition: width 0.3s;
}

.test-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.code-comparison {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  font-family: monospace;
}

.original {
  color: #3498db;
}

.recognized {
  color: #2ecc71;
}
</style>