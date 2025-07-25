<template>
  <div>
    <h2>保険商品一覧</h2>
    
    <!-- 検索フォーム -->
    <div class="search-container">
      <div class="form-group">
        <input 
          v-model="searchQuery" 
          @input="searchProducts"
          type="text" 
          placeholder="商品名で検索..."
        />
      </div>
      <div class="form-group">
        <select v-model="selectedCategory" @change="searchProducts">
          <option value="">全カテゴリ</option>
          <option v-for="category in categories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
      </div>
    </div>

    <!-- 検索結果表示 -->
    <div v-if="searchQuery" class="search-result">
      <!-- 【脆弱性あり】XSS攻撃が可能 -->
      <!-- ユーザーの検索クエリを直接HTMLに埋め込んでいる -->
      <!-- 攻撃例: <script>alert('XSS')</script> -->
      <!-- 修正方法: {{ searchQuery }} を使用してテキストとして表示する -->
      <p>検索結果: <span v-html="searchQuery"></span></p>
    </div>

    <!-- 商品一覧 -->
    <div class="products-grid">
      <div v-for="product in products" :key="product.id" class="card product-card">
        <h3>{{ product.name }}</h3>
        
        <!-- 【脆弱性あり】XSS攻撃が可能 -->
        <!-- データベースから取得した商品説明を直接HTMLに埋め込んでいる -->
        <!-- データベース内に<script>タグなどが含まれている場合、実行される -->
        <!-- 修正方法: {{ product.description }} を使用してテキストとして表示する -->
        <div class="description" v-html="product.description"></div>
        
        <p class="price">価格: ¥{{ product.price.toLocaleString() }}</p>
        <p class="category">カテゴリ: {{ product.category }}</p>
        <router-link :to="'/product/' + product.id" class="btn">詳細を見る</router-link>
      </div>
    </div>

    <!-- ユーザーコメント機能 -->
    <div class="comment-section">
      <h3>ユーザーコメント</h3>
      <div class="form-group">
        <label>コメントを追加:</label>
        <input 
          v-model="newComment" 
          type="text" 
          placeholder="コメントを入力..."
          @keyup.enter="addComment"
        />
        <button @click="addComment" class="btn">コメント追加</button>
      </div>
      
      <div class="comments">
        <div v-for="comment in comments" :key="comment.id" class="comment">
          <!-- 【脆弱性あり】XSS攻撃が可能 -->
          <!-- ユーザーのコメントを直接HTMLに埋め込んでいる -->
          <!-- 攻撃例: <img src="x" onerror="alert('XSS')"> -->
          <!-- 修正方法: {{ comment.text }} を使用してテキストとして表示する -->
          <p v-html="comment.text"></p>
          <small>投稿日時: {{ comment.date }}</small>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

interface Product {
  id: number
  name: string
  description: string
  price: number
  category: string
}

interface Comment {
  id: number
  text: string
  date: string
}

const products = ref<Product[]>([])
const categories = ref<string[]>([])
const searchQuery = ref('')
const selectedCategory = ref('')
const newComment = ref('')
const comments = ref<Comment[]>([])

const loadProducts = async () => {
  try {
    const response = await axios.get('/api/products')
    products.value = response.data
  } catch (error) {
    console.error('商品の読み込みに失敗しました:', error)
  }
}

const loadCategories = async () => {
  try {
    const response = await axios.get('/api/categories')
    categories.value = response.data
  } catch (error) {
    console.error('カテゴリの読み込みに失敗しました:', error)
  }
}

const searchProducts = async () => {
  try {
    const params: any = {}
    if (searchQuery.value) params.search = searchQuery.value
    if (selectedCategory.value) params.category = selectedCategory.value
    
    const response = await axios.get('/api/products', { params })
    products.value = response.data
  } catch (error) {
    console.error('検索に失敗しました:', error)
  }
}

const addComment = () => {
  if (newComment.value.trim()) {
    const comment: Comment = {
      id: Date.now(),
      text: newComment.value,
      date: new Date().toLocaleString()
    }
    comments.value.unshift(comment)
    newComment.value = ''
  }
}

onMounted(() => {
  loadProducts()
  loadCategories()
})
</script>

<style scoped>
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.product-card {
  transition: transform 0.3s;
}

.product-card:hover {
  transform: translateY(-5px);
}

.description {
  margin: 1rem 0;
  color: #666;
  line-height: 1.5;
}

.price {
  font-size: 1.2rem;
  font-weight: bold;
  color: #e74c3c;
  margin: 0.5rem 0;
}

.category {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.search-result {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 2rem;
  border-left: 4px solid #3498db;
}

.comment-section {
  border-top: 2px solid #ecf0f1;
  padding-top: 2rem;
  margin-top: 3rem;
}

.comment-section .form-group {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
}

.comment-section input {
  flex: 1;
}

.comments {
  margin-top: 2rem;
}

.comment {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  border-left: 3px solid #3498db;
}

.comment small {
  color: #7f8c8d;
}
</style>