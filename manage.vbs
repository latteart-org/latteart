Set wshShell = CreateObject("Wscript.Shell")

wshShell.Run "cmd /c cd latteart-capture-cl && set PORT=3001 && latteart-capture-cl.exe", 0, false
wshShell.Run "cmd /c cd latteart-repository && set PORT=3002 && latteart-repository.exe", 0, false
wshShell.Run "http://127.0.0.1:3000?mode=manage&capture=http://127.0.0.1:3001&repository=http://127.0.0.1:3002"
wshShell.Run "cmd /c cd latteart && set PORT=3000 && latteart.exe", 1, true

If Not ProcessExists("latteart.exe") Then
  CloseRunningServices()
End If

Function CloseRunningServices()
  Set processes = GetObject("winmgmts:").InstancesOf("win32_process")
  For Each process In processes
    If LCase(process.Name) = "latteart-capture-cl.exe" Then
      process.Terminate
    End If

    If LCase(process.Name) = "latteart-repository.exe" Then
      process.Terminate
    End If
  Next
End Function

Function ProcessExists(ProcessName)
    Dim Service,QfeSet
    Set Service = CreateObject("WbemScripting.SWbemLocator").ConnectServer
    Set QfeSet = Service.ExecQuery("Select * From Win32_Process Where Caption='" & ProcessName & "'")
    ProcessExists = QfeSet.Count > 0
End Function