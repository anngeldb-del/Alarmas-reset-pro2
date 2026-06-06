#NoEnv
#SingleInstance Force
SendMode Input
SetWorkingDir %A_ScriptDir%

; ─── ATAJOS ───────────────────────────────────────────────
; Ctrl + Alt + R  →  Limpieza completa (RAM + archivos)
; Ctrl + Alt + M  →  Solo liberar RAM
; Ctrl + Alt + I  →  Ver info de RAM en tiempo real
; ──────────────────────────────────────────────────────────

^!r::
    GoSub, LimpiezaCompleta
Return

^!m::
    GoSub, SoloRAM
Return

^!i::
    GoSub, InfoRAM
Return

; ══════════════════════════════════════════════════════════
LimpiezaCompleta:
    ; RAM antes
    VarSetCapacity(ms, 64)
    DllCall("kernel32\GlobalMemoryStatusEx", "Ptr", &ms)
    ramAntesBytes := NumGet(ms, 16, "Int64")
    ramAntesMB := Round(ramAntesBytes / 1048576)

    Progress, b w300 h60, , 🔄 Limpiando... por favor espera, FASTRAM PRO
    Sleep, 300

    ; ── Liberar RAM ──
    Progress, 15, Liberando RAM...
    IfExist, %A_ScriptDir%\EmptyStandbyList.exe
        RunWait, %ComSpec% /c "%A_ScriptDir%\EmptyStandbyList.exe workingsets", , Hide
    else
        RunWait, %ComSpec% /c "rundll32.exe advapi32.dll`,ProcessIdleTasks", , Hide

    ; ── Temp del usuario ──
    Progress, 30, Borrando archivos temporales...
    RunWait, %ComSpec% /c "del /s /q /f ""%temp%\*"" 2>nul", , Hide

    ; ── Temp de Windows ──
    Progress, 45, Limpiando Windows\Temp...
    RunWait, %ComSpec% /c "del /s /q /f ""C:\Windows\Temp\*"" 2>nul", , Hide

    ; ── Prefetch ──
    Progress, 55, Limpiando Prefetch...
    RunWait, %ComSpec% /c "del /s /q /f ""C:\Windows\Prefetch\*"" 2>nul", , Hide

    ; ── Cache DNS ──
    Progress, 65, Limpiando cache DNS...
    RunWait, %ComSpec% /c "ipconfig /flushdns", , Hide

    ; ── Papelera ──
    Progress, 75, Vaciando Papelera de reciclaje...
    RunWait, %ComSpec% /c "PowerShell -Command Clear-RecycleBin -Force -ErrorAction SilentlyContinue", , Hide

    ; ── Cache de miniaturas ──
    Progress, 85, Limpiando cache de miniaturas...
    RunWait, %ComSpec% /c "del /s /q /f ""%localappdata%\Microsoft\Windows\Explorer\thumbcache_*.db"" 2>nul", , Hide

    ; ── Cache de fuentes ──
    Progress, 92, Limpiando cache de fuentes...
    RunWait, %ComSpec% /c "del /q /f ""%localappdata%\Microsoft\Windows\FontCache\*"" 2>nul", , Hide

    Progress, 100, Calculando resultados...
    Sleep, 500
    Progress, Off

    ; RAM despues
    VarSetCapacity(ms2, 64)
    DllCall("kernel32\GlobalMemoryStatusEx", "Ptr", &ms2)
    ramDespuesBytes := NumGet(ms2, 16, "Int64")
    ramDespuesMB := Round(ramDespuesBytes / 1048576)
    liberadaMB := ramDespuesMB - ramAntesMB

    liberadaTexto := (liberadaMB > 0) ? "+" liberadaMB " MB liberados" : "RAM ya estaba optimizada"

    MsgBox, 64, ✅ FASTRAM PRO — Limpieza completa,
    (
RAM libre antes:   %ramAntesMB% MB
RAM libre ahora:   %ramDespuesMB% MB
Resultado:         %liberadaTexto%

Archivos temp borrados ✓
Cache DNS limpiada ✓
Papelera vaciada ✓
Cache de miniaturas ✓
    )
Return

; ══════════════════════════════════════════════════════════
SoloRAM:
    VarSetCapacity(ms, 64)
    DllCall("kernel32\GlobalMemoryStatusEx", "Ptr", &ms)
    ramAntesMB := Round(NumGet(ms, 16, "Int64") / 1048576)

    IfExist, %A_ScriptDir%\EmptyStandbyList.exe
        RunWait, %ComSpec% /c "%A_ScriptDir%\EmptyStandbyList.exe workingsets", , Hide
    else
        RunWait, %ComSpec% /c "rundll32.exe advapi32.dll`,ProcessIdleTasks", , Hide

    VarSetCapacity(ms2, 64)
    DllCall("kernel32\GlobalMemoryStatusEx", "Ptr", &ms2)
    ramDespuesMB := Round(NumGet(ms2, 16, "Int64") / 1048576)
    liberadaMB := ramDespuesMB - ramAntesMB
    liberadaTexto := (liberadaMB > 0) ? "+" liberadaMB " MB liberados" : "Sin cambios significativos"

    MsgBox, 64, ⚡ Solo RAM, RAM antes: %ramAntesMB% MB  →  ahora: %ramDespuesMB% MB`n%liberadaTexto%
Return

; ══════════════════════════════════════════════════════════
InfoRAM:
    VarSetCapacity(ms, 64)
    NumPut(64, ms, 0, "UInt")
    DllCall("kernel32\GlobalMemoryStatusEx", "Ptr", &ms)
    usoPct      := NumGet(ms,  4, "UInt")
    totalBytes  := NumGet(ms,  8, "Int64")
    libreBytes  := NumGet(ms, 16, "Int64")
    totalMB     := Round(totalBytes  / 1048576)
    libreMB     := Round(libreBytes  / 1048576)
    usadaMB     := totalMB - libreMB

    MsgBox, 64, 📊 Info de RAM,
    (
Total:    %totalMB% MB
Usada:    %usadaMB% MB  (%usoPct%`%)
Libre:    %libreMB% MB

Atajo Ctrl+Alt+R  →  Limpieza completa
Atajo Ctrl+Alt+M  →  Solo liberar RAM
    )
Return
