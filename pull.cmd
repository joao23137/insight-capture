@echo off
REM Puxa insights do Supabase para o vault (02 - Captura).
setlocal
cd /d "C:\Users\João Pedro\projects\insight-capture"
if not exist "logs" mkdir "logs"
echo [%date% %time%] Puxando insights... >> "logs\pull.log"
"C:\Program Files\nodejs\node.exe" "pull-insights.mjs" >> "logs\pull.log" 2>&1
endlocal
