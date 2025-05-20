<template>
  <div class="auth-container">
    <div class="auth-box">
      <h2>{{ isLogin ? 'Login' : 'Register' }}</h2>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            v-model="form.email"
            required
            placeholder="Enter your email"
          />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input
            type="password"
            id="password"
            v-model="form.password"
            required
            placeholder="Enter your password"
          />
        </div>
        <div v-if="!isLogin" class="form-group">
          <label for="name">Name</label>
          <input
            type="text"
            id="name"
            v-model="form.name"
            required
            placeholder="Enter your name"
          />
        </div>
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        <button type="submit" class="submit-btn" :disabled="loading">
          {{ loading ? 'Processing...' : (isLogin ? 'Login' : 'Register') }}
        </button>
      </form>
      <p class="toggle-auth" @click="toggleAuth">
        {{ isLogin ? 'Need an account? Register' : 'Already have an account? Login' }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import axios from '../plugins/axios'
import { useRouter } from 'vue-router'
import Cookies from 'js-cookie'

interface AuthForm {
  email: string
  password: string
  name?: string
}

const router = useRouter()
const isLogin = ref(true)
const loading = ref(false)
const error = ref('')
const form = reactive<AuthForm>({
  email: '',
  password: '',
  name: ''
})

const toggleAuth = () => {
  isLogin.value = !isLogin.value
  error.value = ''
}

const getCsrfCookie = async () => {
  try {
    // Make a simple GET request to get the CSRF cookie
    await axios.get('/sanctum/csrf-cookie', {
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    })
    return true
  } catch (err) {
    console.error('Failed to get CSRF cookie:', err)
    return false
  }
}

const handleSubmit = async () => {
  loading.value = true
  error.value = ''
  
  try {
    // Get CSRF cookie first
    const csrfSuccess = await getCsrfCookie()
    if (!csrfSuccess) {
      throw new Error('Failed to get CSRF cookie')
    }

    // Get the CSRF token from the cookie
    const csrfToken = Cookies.get('XSRF-TOKEN')
    if (!csrfToken) {
      throw new Error('CSRF token not found')
    }

    const endpoint = isLogin.value ? '/login' : '/register'
    const response = await axios.post(endpoint, form, {
      headers: {
        'X-XSRF-TOKEN': csrfToken,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    
    if (response.data.success) {
      // After successful login, get the authenticated user
      const userResponse = await axios.get('/me')
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(userResponse.data))
      
      // Redirect to dashboard
      router.push('/dashboard')
    } else {
      error.value = response.data.message || 'Authentication failed'
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || err.message || 'An error occurred during authentication'
    console.error('Auth error:', err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.auth-box {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #666;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.submit-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
}

.submit-btn:hover {
  background-color: #45a049;
}

.submit-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.toggle-auth {
  text-align: center;
  margin-top: 1rem;
  color: #666;
  cursor: pointer;
  text-decoration: underline;
}

.toggle-auth:hover {
  color: #333;
}

.error-message {
  color: #dc3545;
  margin: 1rem 0;
  text-align: center;
  font-size: 0.9rem;
}
</style> 