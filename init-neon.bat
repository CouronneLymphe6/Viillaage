@echo off
echo 🚀 Initialisation de la base de données Neon...
echo.

REM Lire DATABASE_URL_PRODUCTION depuis .env
for /f "tokens=1,* delims==" %%a in ('findstr /r "^DATABASE_URL_PRODUCTION=" .env') do set DATABASE_URL=%%b

echo 📡 Connexion à Neon...
npx prisma db push
echo.

echo 🌱 Création du village et de l'admin...
npx tsx scripts/init-production-db.ts

echo.
echo ✅ Terminé !
pause
