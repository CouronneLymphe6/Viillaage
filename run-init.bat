@echo off
echo 🚀 Initialisation automatique de Neon...
echo.

REM Lire DATABASE_URL_PRODUCTION depuis .env
for /f "tokens=1,* delims==" %%a in ('findstr /r "^DATABASE_URL_PRODUCTION=" .env') do set DATABASE_URL_PRODUCTION=%%b

echo 📡 Connexion à Neon...
node init-neon-auto.js

echo.
pause
