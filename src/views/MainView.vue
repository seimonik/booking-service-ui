<template>
  <div class="layout-container">
    <header class="header">
      <nav class="nav">
        <div class="logo">HotelBooking</div>
        <div class="nav-links">
          <router-link to="/" class="nav-link">Главная</router-link>
          <router-link to="/hotels" class="nav-link">Все отели</router-link>
          <router-link to="/about" class="nav-link">О нас</router-link>
        </div>
      </nav>
    </header>
    <div id="main-content">
      <router-view />
    </div>
  </div>
</template>

<style scoped>
.layout-container {
  height: 100vh;
}

.header {
  background: linear-gradient(160deg, #667eea 0%, #764ba2 100%);
  backdrop-filter: blur(10px);
  padding: 1rem 2rem;
}

.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: background-color 0.3s;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

@media (max-width: 768px) {
  .nav {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
