<template>
  <div class="dashboard">
    <h1>Welcome to Dashboard</h1>
    <p>You are successfully logged in!</p>
    <button @click="handleLogout" class="logout-btn">Logout</button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import axios from '../plugins/axios'

const router = useRouter()

const handleLogout = async () => {
  try {
    await axios.post('/api/v1/logout')
    localStorage.removeItem('user')
    router.push('/')
  } catch (error) {
    console.error('Logout error:', error)
  }
}
</script>

<style scoped>
.dashboard {
  padding: 2rem;
  text-align: center;
}

.logout-btn {
  padding: 0.75rem 1.5rem;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 1rem;
}

.logout-btn:hover {
  background-color: #c82333;
}
</style> 