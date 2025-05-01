@echo off
set path=%path%;%cd%\gstreamer\bin
date /t >> gstreamer.log
time /t >> gstreamer.log
goLive.exe %* 4>&1 | tee -ai gstreamer.log