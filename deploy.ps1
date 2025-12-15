# Автоматический деплой на Vercel
Write-Host "🚀 Начинаю деплой проекта на Vercel..." -ForegroundColor Green

# Проверяем авторизацию
Write-Host "`n📋 Проверяю авторизацию..." -ForegroundColor Yellow
$auth = vercel whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Не авторизован. Сначала выполните: vercel login" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Авторизован как: $auth" -ForegroundColor Green

# Проверяем сборку
Write-Host "`n🔨 Проверяю сборку проекта..." -ForegroundColor Yellow
if (-not (Test-Path "dist")) {
    Write-Host "📦 Собираю проект..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Ошибка сборки!" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Проект собран" -ForegroundColor Green

# Деплой
Write-Host "`n🚀 Запускаю деплой на Vercel..." -ForegroundColor Yellow
Write-Host "Нажмите Y когда спросит о деплое" -ForegroundColor Cyan

vercel --prod

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Деплой завершен успешно!" -ForegroundColor Green
    Write-Host "🌐 Ваш сайт доступен в интернете!" -ForegroundColor Green
} else {
    Write-Host "`n❌ Ошибка деплоя" -ForegroundColor Red
    exit 1
}



