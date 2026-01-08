# 🔧 Исправление CORS ошибки

## ❌ Проблема

В консоли браузера видна ошибка:
```
Access to fetch at 'https://astrotoppro-production.up.railway.app/api/news' 
from origin 'https://astrotop.pro' has been blocked by CORS policy
```

## ✅ Решение

Код уже исправлен! Нужно задеплоить обновления на Railway.

---

## 🚀 ШАГ 1: Отправьте изменения на GitHub

```bash
git add .
git commit -m "Исправлены CORS настройки"
git push
```

---

## 🚂 ШАГ 2: Обновите бэкенд на Railway

### Вариант A: Автоматический деплой (если настроен)

1. Откройте https://railway.app
2. Найдите ваш проект `astrotop.pro`
3. Railway автоматически обнаружит изменения в GitHub
4. Дождитесь завершения деплоя (зеленая галочка ✅)

### Вариант B: Ручной деплой

1. Откройте https://railway.app
2. Найдите ваш проект
3. Откройте вкладку **"Deployments"**
4. Нажмите **"Redeploy"** на последнем деплое
5. Дождитесь завершения

---

## ⚙️ ШАГ 3: Проверьте настройки CORS на Railway

1. В Railway откройте ваш проект
2. Перейдите в **"Settings"** → **"Variables"**
3. Убедитесь, что есть переменная:
   - **Name:** `FRONTEND_URL`
   - **Value:** `https://astrotop.pro`
4. Если нет — добавьте и сохраните

---

## 🔍 ШАГ 4: Проверьте работу

1. Откройте https://astrotop.pro
2. Откройте консоль браузера (F12)
3. Обновите страницу (Ctrl+R)
4. CORS ошибка должна исчезнуть

---

## 📝 Что было исправлено в коде:

1. ✅ CORS теперь разрешает все запросы с `astrotop.pro`
2. ✅ Добавлена поддержка всех поддоменов Vercel
3. ✅ Добавлен `credentials: 'include'` во все fetch запросы
4. ✅ Улучшена обработка OPTIONS запросов

---

## ⚠️ Если ошибка все еще есть:

1. **Проверьте, что бэкенд запущен:**
   - Откройте `https://astrotoppro-production.up.railway.app/api/news` в браузере
   - Должен вернуться JSON: `[]` или массив новостей

2. **Проверьте переменные окружения в Vercel:**
   - Откройте https://vercel.com/dashboard
   - Settings → Environment Variables
   - Убедитесь, что `VITE_API_URL` = `https://astrotoppro-production.up.railway.app`

3. **Пересоберите фронтенд:**
   - В Vercel → Deployments
   - Нажмите "..." → "Redeploy"

---

## ✅ После исправления:

- CORS ошибка исчезнет
- Новости будут загружаться с сервера
- Публикация новостей будет работать

---

**Время исправления:** 2-5 минут (после деплоя на Railway)

