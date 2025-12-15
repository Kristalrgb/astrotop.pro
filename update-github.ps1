# Скрипт для обновления GitHub из Cursor
# Запустите: .\update-github.ps1

Write-Host "🚀 Обновление GitHub репозитория..." -ForegroundColor Green
Write-Host ""

# Проверка, инициализирован ли Git
if (-not (Test-Path .git)) {
    Write-Host "⚠️  Git репозиторий не инициализирован!" -ForegroundColor Yellow
    Write-Host "Инициализация..." -ForegroundColor Yellow
    git init
    Write-Host "✅ Git инициализирован" -ForegroundColor Green
    Write-Host ""
}

# Проверка статуса
Write-Host "📊 Проверка изменений..." -ForegroundColor Cyan
git status

Write-Host ""
$response = Read-Host "Продолжить и добавить все изменения? (y/n)"

if ($response -eq "y" -or $response -eq "Y") {
    # Добавление всех файлов
    Write-Host ""
    Write-Host "📦 Добавление файлов..." -ForegroundColor Cyan
    git add .
    
    # Запрос сообщения коммита
    Write-Host ""
    $commitMessage = Read-Host "Введите сообщение коммита (или Enter для стандартного)"
    
    if ([string]::IsNullOrWhiteSpace($commitMessage)) {
        $commitMessage = "Обновление сайта из Cursor"
    }
    
    # Создание коммита
    Write-Host ""
    Write-Host "💾 Создание коммита..." -ForegroundColor Cyan
    git commit -m $commitMessage
    
    # Проверка remote
    Write-Host ""
    Write-Host "🔗 Проверка подключения к GitHub..." -ForegroundColor Cyan
    $remoteUrl = git remote get-url origin 2>$null
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  Репозиторий GitHub не подключен!" -ForegroundColor Yellow
        Write-Host ""
        $repoUrl = Read-Host "Введите URL вашего GitHub репозитория (например: https://github.com/username/repo.git)"
        
        if (-not [string]::IsNullOrWhiteSpace($repoUrl)) {
            git remote add origin $repoUrl
            Write-Host "✅ Репозиторий подключен" -ForegroundColor Green
        } else {
            Write-Host "❌ URL не указан. Подключите репозиторий вручную:" -ForegroundColor Red
            Write-Host "   git remote add origin https://github.com/username/repo.git" -ForegroundColor Yellow
            exit 1
        }
    } else {
        Write-Host "✅ Репозиторий подключен: $remoteUrl" -ForegroundColor Green
    }
    
    # Определение ветки
    $branch = git branch --show-current 2>$null
    if ([string]::IsNullOrWhiteSpace($branch)) {
        $branch = "main"
        git branch -M main
    }
    
    # Отправка на GitHub
    Write-Host ""
    Write-Host "📤 Отправка на GitHub (ветка: $branch)..." -ForegroundColor Cyan
    
    # Попытка push
    if ($branch -eq "main") {
        git push -u origin main 2>&1 | Out-Host
    } else {
        git push -u origin $branch 2>&1 | Out-Host
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Успешно отправлено на GitHub!" -ForegroundColor Green
        Write-Host ""
        Write-Host "🌐 Если сайт подключен к Vercel, изменения применятся автоматически через 1-2 минуты" -ForegroundColor Cyan
    } else {
        Write-Host ""
        Write-Host "❌ Ошибка при отправке. Возможные причины:" -ForegroundColor Red
        Write-Host "   - Нет доступа к репозиторию" -ForegroundColor Yellow
        Write-Host "   - Нужно сначала сделать pull" -ForegroundColor Yellow
        Write-Host "   - Неправильный URL репозитория" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Попробуйте выполнить вручную:" -ForegroundColor Cyan
        Write-Host "   git pull origin $branch --allow-unrelated-histories" -ForegroundColor Yellow
        Write-Host "   git push -u origin $branch" -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "❌ Отменено" -ForegroundColor Red
}

Write-Host ""
Write-Host "Нажмите любую клавишу для выхода..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")




