<template>
  <div class="login-container">
    <div class="card login-card">
      <h2>管理者ログイン</h2>
      
      <form @submit.prevent="login">
        <div class="form-group">
          <label>ユーザー名:</label>
          <input 
            v-model="username" 
            type="text" 
            required 
            placeholder="ユーザー名を入力"
          />
        </div>
        
        <div class="form-group">
          <label>パスワード:</label>
          <input 
            v-model="password" 
            type="password" 
            required 
            placeholder="パスワードを入力"
          />
        </div>
        
        <button type="submit" class="btn login-btn" :disabled="loading">
          {{ loading ? 'ログイン中...' : 'ログイン' }}
        </button>
      </form>
      
      <div v-if="message" class="message" :class="messageClass">
        <!-- 【脆弱性あり】XSS攻撃が可能 -->
        <!-- サーバーからのレスポンスメッセージを直接HTMLに埋め込んでいる -->
        <!-- 攻撃者がサーバーのレスポンスを操作できる場合、XSSが実行される -->
        <!-- 修正方法: {{ message }} を使用してテキストとして表示する -->
        <span v-html="message"></span>
      </div>
      
      <!-- SQLインジェクション攻撃のヒント -->
      <div class="attack-hints">
        <h3>🚨 教育目的：攻撃テストのヒント</h3>
        <div class="hint-section">
          <h4>SQLインジェクション攻撃例:</h4>
          <ul>
            <li>ユーザー名: <code>admin' --</code></li>
            <li>ユーザー名: <code>' OR '1'='1' --</code></li>
            <li>ユーザー名: <code>' UNION SELECT 1,2,3 --</code></li>
          </ul>
        </div>
        
        <div class="hint-section">
          <h4>XSS攻撃例（他のページで試してください）:</h4>
          <ul>
            <li>検索欄: <code>&lt;script&gt;alert('XSS')&lt;/script&gt;</code></li>
            <li>コメント欄: <code>&lt;img src="x" onerror="alert('XSS')"&gt;</code></li>
            <li>レビュー欄: <code>&lt;svg onload="alert('XSS')"&gt;</code></li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'

const username = ref('')
const password = ref('')
const loading = ref(false)
const message = ref('')
const messageClass = ref('')

const login = async () => {
  loading.value = true
  message.value = ''
  
  try {
    const response = await axios.post('/api/admin/login', {
      username: username.value,
      password: password.value
    })
    
    if (response.data.success) {
      message.value = `ログイン成功！ようこそ、${response.data.user.username}さん`
      messageClass.value = 'success'
    } else {
      message.value = response.data.message || 'ログインに失敗しました'
      messageClass.value = 'error'
    }
  } catch (error: any) {
    console.error('Login error:', error)
    // サーバーエラーメッセージをそのまま表示（潜在的なXSS脆弱性）
    message.value = error.response?.data?.message || 'サーバーエラーが発生しました'
    messageClass.value = 'error'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 60vh;
  padding: 2rem 0;
}

.login-card {
  width: 100%;
  max-width: 500px;
}

.login-btn {
  width: 100%;
  font-size: 1.1rem;
  padding: 1rem;
}

.login-btn:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

.message {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 4px;
  text-align: center;
}

.message.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.attack-hints {
  margin-top: 3rem;
  padding: 2rem;
  background-color: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
}

.attack-hints h3 {
  color: #856404;
  margin-bottom: 1.5rem;
}

.hint-section {
  margin-bottom: 2rem;
}

.hint-section h4 {
  color: #721c24;
  margin-bottom: 1rem;
}

.hint-section ul {
  list-style-type: none;
  padding-left: 0;
}

.hint-section li {
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.hint-section code {
  background-color: #e9ecef;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  color: #e74c3c;
  font-weight: bold;
}
</style>