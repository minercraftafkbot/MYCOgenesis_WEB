@echo off
REM Environment Variables Setup Script for MYCOgenesis_WEB
REM This script helps set up environment variables for different environments

echo.
echo ========================================
echo   MYCOgenesis Environment Setup
echo ========================================
echo.

echo Checking for existing environment files...
if exist ".env.local" (
    echo [✓] .env.local already exists
) else (
    echo [!] Creating .env.local from template...
    if exist ".env.example" (
        copy ".env.example" ".env.local" >nul
        echo [✓] .env.local created successfully
        echo [!] Please edit .env.local with your actual configuration values
    ) else (
        echo [✗] .env.example not found!
        exit /b 1
    )
)

echo.
echo Checking file permissions and .gitignore...
if exist ".gitignore" (
    findstr /C:".env.local" ".gitignore" >nul
    if %errorlevel%==0 (
        echo [✓] .gitignore properly configured to exclude environment files
    ) else (
        echo [!] Warning: .gitignore may not exclude environment files properly
    )
) else (
    echo [!] Warning: No .gitignore file found
)

echo.
echo Environment setup checklist:
echo [ ] 1. Edit .env.local with your actual Firebase configuration
echo [ ] 2. Update Sanity CMS configuration if needed
echo [ ] 3. Set appropriate environment (development/staging/production)
echo [ ] 4. Test configuration using test-environment.html
echo [ ] 5. Set up production environment variables on hosting platform

echo.
echo For production deployment, remember to:
echo - Create .env.production with production values
echo - Set environment variables on your hosting platform
echo - Never commit .env files with real values to Git

echo.
echo To test your configuration:
echo 1. Start a local server: python -m http.server 8000
echo 2. Open: http://localhost:8000/test-environment.html
echo 3. Verify all configurations are loaded correctly

echo.
echo For more information, see ENVIRONMENT_SETUP.md
echo.
pause
