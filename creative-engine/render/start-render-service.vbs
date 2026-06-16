' Launches the CreativeEngine render service HIDDEN (no console window).
' A copy of this file is placed in the Windows Startup folder so the render
' poller auto-starts at every logon with zero manual action. The "0" = hidden
' window; "False" = don't wait. Delete the Startup-folder copy to disable.
Dim shell, ps
Set shell = CreateObject("WScript.Shell")
ps = "powershell.exe -NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File ""D:\Claude CODE\jsxconversion\creative-engine\render\start-render-service.ps1"""
shell.Run ps, 0, False
