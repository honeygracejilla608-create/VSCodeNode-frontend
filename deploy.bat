@echo off
echo 🚀 Starting 1-Click Deployment...
git add .
if %errorlevel% neq 0 (
    echo ❌ Failed to add files.
    pause
    exit /b 1
)
git commit -m "Auto-deploy at %date% %time%"
if %errorlevel% neq 0 (
    echo ❌ Failed to commit. (No changes?)
    pause
    exit /b 1
)
git push origin main
if %errorlevel% neq 0 (
    echo ❌ Failed to push.
    pause
    exit /b 1
)
echo ✅ Deployment triggered! Check GitHub Actions.
pause
