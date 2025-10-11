@echo off
echo ========================================
echo   SnifferX - Packet Capture Test
echo   Running as Administrator...
echo ========================================
echo.

cd /d "%~dp0"
powershell -Command "Start-Process powershell -Verb RunAs -ArgumentList '-NoExit', '-Command', 'cd \"%cd%\"; node test-capture.js'"
