@echo off
echo ========================================
echo   АВТОМАТИЧЕСКИЙ ДЕПЛОЙ НА VERCEL
echo ========================================
echo.

echo Проверяю авторизацию...
vercel whoami
if errorlevel 1 (
    echo ОШИБКА: Вы не авторизованы!
    echo Сначала выполните: vercel login
    pause
    exit /b 1
)

echo.
echo Проверяю сборку проекта...
if not exist "dist" (
    echo Собираю проект...
    call npm run build
    if errorlevel 1 (
        echo ОШИБКА при сборке!
        pause
        exit /b 1
    )
)

echo.
echo Запускаю деплой...
echo ВАЖНО: Когда спросит "Set up and deploy?" - нажмите Y и Enter
echo.

vercel --prod

if errorlevel 1 (
    echo.
    echo ОШИБКА при деплое!
    pause
    exit /b 1
) else (
    echo.
    echo ========================================
    echo   ДЕПЛОЙ ЗАВЕРШЕН УСПЕШНО!
    echo ========================================
    echo.
    echo Ваш сайт теперь в интернете!
)

pause



