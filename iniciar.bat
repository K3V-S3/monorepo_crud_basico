@echo off
echo Abriendo proyecto en VS Code...
cd /d "%~dp0"
code .
exit
REM Si VS no está en la variable del entorno PATH, hay que colocar la ruta para que se ejecute.