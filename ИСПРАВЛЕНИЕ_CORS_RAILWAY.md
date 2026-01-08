# 🔧 Исправление CORS ошибок на Railway

## Проблема
Бэкенд на Railway работает со старым кодом, из-за чего возникают CORS ошибки в консоли браузера.

## Решение

### Шаг 1: Проверьте текущий код
Код бэкенда уже обновлен с правильными CORS настройками:
- ✅ Поддержка всех `.vercel.app` доменов
- ✅ Поддержка `astrotop.pro`
- ✅ Поддержка `localhost` для разработки
- ✅ Правильная обработка OPTIONS запросов
- ✅ Универсальный middleware для всех API запросов

### Шаг 2: Закоммитьте изменения

```bash
git add server/index.js
git commit -m "Исправлены CORS настройки для Railway"
git push
```

### Шаг 3: Деплой на Railway

#### Вариант A: Автоматический деплой (если настроен)
Если у вас настроен автоматический деплой из GitHub:
1. Railway автоматически обнаружит новый коммит
2. Начнется процесс деплоя (обычно 2-5 минут)
3. Проверьте статус в панели Railway

#### Вариант B: Ручной деплой
1. Откройте [Railway Dashboard](https://railway.app)
2. Выберите ваш проект
3. Нажмите на сервис (бэкенд)
4. Перейдите в раздел **"Deployments"**
5. Нажмите **"Redeploy"** или **"Deploy Latest"**

### Шаг 4: Проверьте переменные окружения

Убедитесь, что в Railway установлены правильные переменные окружения:

1. Откройте ваш проект в Railway
2. Перейдите в **Settings** → **Variables**
3. Проверьте наличие:
   - `FRONTEND_URL` = `https://astrotop.pro` (или ваш домен)
   - `NODE_ENV` = `production` (опционально)
   - `PORT` = обычно Railway устанавливает автоматически

### Шаг 5: Проверьте работу API

После деплоя проверьте:

1. **Health check endpoint:**
   ```
   https://ваш-домен-railway.up.railway.app/api/health
   ```
   Должен вернуть: `{"status": "ok", "message": "API работает"}`

2. **Проверьте CORS заголовки:**
   Откройте консоль браузера (F12) и выполните:
   ```javascript
   fetch('https://ваш-домен-railway.up.railway.app/api/health', {
     method: 'GET',
     headers: {
       'Content-Type': 'application/json'
     }
   })
   .then(r => {
     console.log('CORS заголовки:', r.headers.get('access-control-allow-origin'))
     return r.json()
   })
   .then(data => console.log('Ответ:', data))
   ```

### Шаг 6: Обновите переменные окружения на Vercel

Убедитесь, что на Vercel установлена правильная переменная:

1. Откройте [Vercel Dashboard](https://vercel.com)
2. Выберите проект `astrotop-pro`
3. Перейдите в **Settings** → **Environment Variables**
4. Проверьте:
   - `VITE_API_URL` = `https://ваш-домен-railway.up.railway.app`
   - `VITE_SOCKET_URL` = `https://ваш-домен-railway.up.railway.app`

### Шаг 7: Перезапустите приложение на Vercel

После обновления переменных окружения:

1. В Vercel Dashboard перейдите в **Deployments**
2. Найдите последний деплой
3. Нажмите **"Redeploy"** (или просто сделайте новый коммит)

## Что было исправлено в коде:

1. ✅ Улучшена обработка CORS для всех доменов
2. ✅ Добавлена поддержка всех `.vercel.app` поддоменов
3. ✅ Улучшена обработка OPTIONS запросов (preflight)
4. ✅ Добавлены все необходимые заголовки:
   - `Access-Control-Allow-Origin`
   - `Access-Control-Allow-Credentials`
   - `Access-Control-Allow-Methods`
   - `Access-Control-Allow-Headers`
   - `Access-Control-Expose-Headers`

## Проверка после деплоя:

1. Откройте сайт `astrotop.pro`
2. Откройте консоль браузера (F12)
3. Проверьте, что нет CORS ошибок
4. Попробуйте загрузить новости, создать профиль и т.д.

## Если ошибки остались:

1. **Проверьте URL бэкенда:**
   - Убедитесь, что `VITE_API_URL` на Vercel указывает на правильный Railway домен
   - Проверьте, что Railway сервис запущен и работает

2. **Проверьте логи Railway:**
   - В Railway Dashboard откройте **Deployments** → выберите последний деплой → **View Logs**
   - Ищите ошибки или предупреждения

3. **Очистите кэш браузера:**
   - Нажмите Ctrl+Shift+R (или Cmd+Shift+R на Mac)
   - Или откройте сайт в режиме инкогнито

4. **Проверьте Network tab:**
   - Откройте DevTools → Network
   - Попробуйте выполнить действие, которое вызывает ошибку
   - Посмотрите на заголовки запроса и ответа
   - Проверьте, что `Access-Control-Allow-Origin` присутствует в ответе

## Время деплоя:

- Railway: обычно 2-5 минут
- Vercel: обычно 1-3 минуты

**Общее время:** 3-8 минут

