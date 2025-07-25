<template>
  <div>
    <button @click="$router.back()" class="btn">← 戻る</button>
    
    <div v-if="product" class="card product-detail">
      <h2>{{ product.name }}</h2>
      
      <!-- 【脆弱性あり】XSS攻撃が可能 -->
      <!-- 商品説明を直接HTMLに埋め込んでいる -->
      <!-- 修正方法: {{ product.description }} を使用する -->
      <div class="description" v-html="product.description"></div>
      
      <div class="product-info">
        <p class="price">価格: ¥{{ product.price.toLocaleString() }}</p>
        <p class="category">カテゴリ: {{ product.category }}</p>
      </div>
      
      <!-- ユーザーレビュー入力 -->
      <div class="review-section">
        <h3>レビューを書く</h3>
        <div class="form-group">
          <label>お名前:</label>
          <input v-model="reviewerName" type="text" placeholder="お名前を入力..." />
        </div>
        <div class="form-group">
          <label>レビュー:</label>
          <textarea v-model="reviewText" rows="4" placeholder="レビューを入力..."></textarea>
        </div>
        <button @click="addReview" class="btn">レビューを投稿</button>
      </div>
      
      <!-- レビュー表示 -->
      <div class="reviews">
        <h3>ユーザーレビュー</h3>
        <div v-if="reviews.length === 0" class="no-reviews">
          まだレビューがありません。
        </div>
        <div v-for="review in reviews" :key="review.id" class="review">
          <!-- 【脆弱性あり】XSS攻撃が可能 -->
          <!-- ユーザー名とレビューテキストを直接HTMLに埋め込んでいる -->
          <!-- 攻撃例: <script>document.cookie</script> -->
          <!-- 修正方法: {{ }} を使用してテキストとして表示する -->
          <h4 v-html="review.name"></h4>
          <div class="review-text" v-html="review.text"></div>
          <small>投稿日時: {{ review.date }}</small>
        </div>
      </div>
    </div>
    
    <div v-else class="loading">
      商品情報を読み込み中...
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

interface Product {
  id: number
  name: string
  description: string
  price: number
  category: string
}

interface Review {
  id: number
  name: string
  text: string
  date: string
}

const route = useRoute()
const product = ref<Product | null>(null)
const reviewerName = ref('')
const reviewText = ref('')
const reviews = ref<Review[]>([])

const loadProduct = async () => {
  try {
    const response = await axios.get(`/api/products/${route.params.id}`)
    product.value = response.data
  } catch (error) {
    console.error('商品の読み込みに失敗しました:', error)
  }
}

const addReview = () => {
  if (reviewerName.value.trim() && reviewText.value.trim()) {
    const review: Review = {
      id: Date.now(),
      name: reviewerName.value,
      text: reviewText.value,
      date: new Date().toLocaleString()
    }
    reviews.value.unshift(review)
    reviewerName.value = ''
    reviewText.value = ''
  }
}

onMounted(() => {
  loadProduct()
})
</script>

<style scoped>
.product-detail {
  max-width: 800px;
  margin: 0 auto;
}

.description {
  margin: 2rem 0;
  font-size: 1.1rem;
  line-height: 1.6;
  color: #555;
}

.product-info {
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
  padding: 2rem 0;
  margin: 2rem 0;
}

.price {
  font-size: 1.5rem;
  font-weight: bold;
  color: #e74c3c;
  margin-bottom: 1rem;
}

.category {
  color: #7f8c8d;
  font-size: 1rem;
}

.review-section {
  margin: 3rem 0;
  padding: 2rem;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.review-section textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  resize: vertical;
}

.reviews {
  margin-top: 3rem;
}

.no-reviews {
  color: #7f8c8d;
  font-style: italic;
  text-align: center;
  padding: 2rem;
}

.review {
  background-color: #fff;
  border: 1px solid #e1e1e1;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.review h4 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.review-text {
  margin: 1rem 0;
  line-height: 1.5;
}

.review small {
  color: #7f8c8d;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #7f8c8d;
  font-size: 1.1rem;
}
</style>