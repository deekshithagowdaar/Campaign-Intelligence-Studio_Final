@echo off
title Campaign Intelligence Studio - Full Stack Launcher
color 06
echo =========================================================================
echo   CAMPAIGN INTELLIGENCE STUDIO
echo   Agent 4 - Campaign Performance Prediction Agent
echo   LTIMindtree GenAI Internship Project
echo   Tagline: Predict. Analyse. Optimise.
echo =========================================================================
echo.
echo [1/2] Starting Unified Server (FastAPI + Embedded Production Frontend)...
echo URL: http://127.0.0.1:8000/
echo API Docs (Swagger): http://127.0.0.1:8000/docs
echo.
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
pause
