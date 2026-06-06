@echo off
:: Requiere ejecutarse como Administrador
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: Ejecuta este script como Administrador.
    echo Clic derecho sobre el archivo ^> "Ejecutar como administrador"
    pause
    exit /b 1
)

echo ============================================
echo   OPTIMIZADOR DE ARRANQUE - Windows 10/11
echo ============================================
echo.

:: ── 1. Limpiar archivos temporales ──────────────────────────────────────────
echo [1/7] Limpiando archivos temporales...
rd /s /q "%temp%" 2>nul
md "%temp%" 2>nul
rd /s /q "C:\Windows\Temp" 2>nul
md "C:\Windows\Temp" 2>nul
echo      Hecho.

:: ── 2. Limpiar cache de DNS ──────────────────────────────────────────────────
echo [2/7] Limpiando cache de DNS...
ipconfig /flushdns >nul
echo      Hecho.

:: ── 3. Deshabilitar servicios de arranque innecesarios ──────────────────────
echo [3/7] Optimizando servicios...

:: Xbox (gaming overlay - no es necesario si no juegas)
sc config XblAuthManager start= disabled >nul 2>&1
sc config XblGameSave   start= disabled >nul 2>&1
sc config XboxNetApiSvc start= disabled >nul 2>&1
sc config XboxGipSvc    start= disabled >nul 2>&1

:: Fax
sc config Fax start= disabled >nul 2>&1

:: Servicio de mapas sin conexion
sc config MapsBroker start= disabled >nul 2>&1

:: Experiencias del usuario conectado (telemetria)
sc config DiagTrack start= disabled >nul 2>&1

echo      Hecho.

:: ── 4. Deshabilitar efectos visuales para mejorar rendimiento ───────────────
echo [4/7] Optimizando efectos visuales...
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\VisualEffects" /v VisualFXSetting /t REG_DWORD /d 2 /f >nul
echo      Hecho.

:: ── 5. Activar Inicio rapido de Windows ─────────────────────────────────────
echo [5/7] Activando inicio rapido (Fast Startup)...
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Power" /v HiberbootEnabled /t REG_DWORD /d 1 /f >nul
powercfg /hibernate on >nul 2>&1
echo      Hecho.

:: ── 6. Desactivar aplicaciones de inicio innecesarias via registro ───────────
echo [6/7] Limpiando entradas de inicio del registro...
:: Solo elimina entradas vacias o rotas; no toca las del usuario
reg delete "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v OneDriveSetup /f >nul 2>&1
echo      Hecho.

:: ── 7. Limpiar archivos prefetch ─────────────────────────────────────────────
echo [7/7] Limpiando Prefetch...
rd /s /q "C:\Windows\Prefetch" 2>nul
md "C:\Windows\Prefetch" 2>nul
echo      Hecho.

echo.
echo ============================================
echo   Optimizacion completada correctamente.
echo   Reinicia tu laptop para ver los cambios.
echo ============================================
echo.

:: Preguntar si reiniciar ahora
set /p respuesta=¿Deseas reiniciar ahora? (s/n):
if /i "%respuesta%"=="s" shutdown /r /t 10 /c "Reiniciando para aplicar optimizaciones..."

pause
