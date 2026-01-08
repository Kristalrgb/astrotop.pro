# ✅ Проверка работы API на Railway

## ✅ Результат Теста 1 (Health Endpoint):

**URL:** `https://astrotoppro-production.up.railway.app/api/health`

**Результат:**
```json
{
  "status": "ok",
  "message": "API работает",
  "timestamp": "2026-01-08T17:17:33.131Z"
}
```

✅ **API работает правильно!** 🎉

---

## 🧪 Проверьте остальные тесты:

### Тест 2: Корневой путь `/`

Откройте в браузере:
```
https://astrotoppro-production.up.railway.app/
```

**Должен вернуть:**
```json
{
  "status": "ok",
  "message": "Backend API работает",
  "timestamp": "2026-01-08T17:17:33.131Z",
  "port": 8080
}
```

### Тест 3: Проверка CORS

1. Откройте ваш сайт: **https://astrotop.pro**
2. Откройте консоль браузера (F12)
3. Выполните:
```javascript
fetch('https://astrotoppro-production.up.railway.app/api/health')
  .then(r => {
    console.log('✅ CORS Header:', r.headers.get('access-control-allow-origin'))
    console.log('✅ Status:', r.status)
    return r.json()
  })
  .then(data => console.log('✅ Response:', data))
```

**Ожидаемый результат:**
- `CORS Header: https://astrotop.pro` (или ваш домен)
- `Status: 200`
- `Response: {status: "ok", message: "API работает", ...}`

---

## 📋 Следующие шаги:

### 1. Обновите переменные окружения на Vercel

1. Откройте: **https://vercel.com/dashboard**
2. Найдите проект `astrotop-pro` (или ваш проект)
3. Перейдите: **Settings → Environment Variables**
4. Проверьте/Добавьте:

   **Переменная 1:**
   - **Key:** `VITE_API_URL`
   - **Value:** `https://astrotoppro-production.up.railway.app`
   - **Environments:** ✅ Production ✅ Preview ✅ Development
   - **Save**

   **Переменная 2:**
   - **Key:** `VITE_SOCKET_URL`
   - **Value:** `https://astrotoppro-production.up.railway.app` (тот же URL)
   - **Environments:** ✅ Production ✅ Preview ✅ Development
   - **Save**

### 2. Пересоберите проект на Vercel

1. В Vercel Dashboard: **Deployments**
2. Найдите последний деплой
3. Нажмите **"..."** (три точки)
4. Нажмите **"Redeploy"**
5. Дождитесь завершения (1-3 минуты)

### 3. Проверьте работу сайта

1. Откройте: **https://astrotop.pro**
2. Откройте консоль (F12)
3. Проверьте:
   - ✅ Нет CORS ошибок
   - ✅ Новости загружаются
   - ✅ Профиль работает
   - ✅ Фото профиля загружается

---

## ✅ Статус:

- ✅ **Railway бэкенд работает!**
- ✅ **API health endpoint работает!**
- ✅ **Сервер запущен на порту 8080**
- ✅ **Статус: Online**

**Следующее:** Обновите переменные окружения на Vercel и пересоберите проект.

---

## 🔍 Проверьте другие endpoints:

### Тест новостей:
```
https://astrotoppro-production.up.railway.app/api/news
```
Должен вернуть: `[]` (пустой массив) или массив новостей

### Тест бронирований:
```
https://astrotoppro-production.up.railway.app/api/bookings
```
Должен вернуть: `[]` (пустой массив) или массив бронирований

---

**Отлично! API работает правильно!** 🎉

