# LatteArt Install Manual

This document explains the procedure from installing LatteArt to starting test recording.

# Preparation

1. Download `ChromeDriver` corresponding to your version of Chrome and set path.
   - Download Site (https://chromedriver.chromium.org/downloads)
1. Install `cwebp` and set path.
   - Download Site (https://developers.google.com/speed/webp/docs/precompiled)
1.  Check the web application under test is accessible from Google Chrome.

:bulb: If you use Edge, in step 1, download `edgedriver` corresponding to the version of Edge instead of Chrome, and set path.

- Download Site（https://developer.microsoft.com/ja-jp/microsoft-edge/tools/webdriver/）

# Install

Download the latest version from [Releases](https://github.com/latteart-org/latteart/releases) on GitHub.

After unzipping the downloaded zip file, you will find the following directory structure.

```bash
latteart
      ├─ capture.bat
      ├─ manage.bat
      ├─ launch.config.json
      ├─ launch.exe
      ├─ latteart
      ├─ latteart-capture-cl
      └─ latteart-repository
```

# Tool configuration

LatteArt consists of the following two tools.

- **Capturing tool（capture.bat）**: Recording of tester's operations and awareness

<div align="center">
   <img src="./images/capture-tool.png" width="480"/> 
</div><br>

- **Management tool（manage.bat）**: Management of test plans and results

<div align="center">
   <img src="./images/management-tool.png" width="480"/> 
</div><br>

Following figure shows the overall picture of LatteArt.
Administrators (test administrators) use management tools to check the quality and progress of tests.
The tester (tester) uses the capturing tool to run tests on the web application under test. The test results are imported into the management tool.

<div class="column">
  <img src="./images/system.png" width="650"/>
</div>

# Tool launch

Run the startup script in the unzipped directory.

- Capturing tool: `capture.bat`
- Management tool: `manage.bat`

Then, along with the command prompt with the following message, the web server for operating LatteArt will be launched, and the tool screen will be displayed on the browser.

```
capture: http://127.0.0.1:3000?capture=http://127.0.0.1:3001&repository=http://127.0.0.1:3002
manage: http://127.0.0.1:3000?mode=manage&capture=http://127.0.0.1:3001&repository=http://127.0.0.1:3002
```

:bulb: If the server is running, you can use it by directly opening the following URL in your browser.

- Capturing tool: http://127.0.0.1:3000
- Management tool: http://127.0.0.1:3000?mode=manage

If you want to start testing immediately, please refer to "[LatteArt Tutorial (Operation Record)](/docs/tutorial/capture/tutorial-capture.md)". 

Please refer to "[LatteArt Tutorial (Test Practice)](/docs/tutorial/management/tutorial-management.md)" for the concept and practice of testing using LatteArt.

# Tool stop

Close the Command Prompt window that was launched at startup.

:warning: The server does not end just by closing the LatteArt tab on the browser.

# Use on Mac (experimental)

After unzipping the downloaded zip file, you will find the following directory structure.

```bash
latteart/
      ├─ capture.command
      ├─ manage.command
      ├─ launch.config.json
      ├─ launch
      ├─ latteart/
      ├─ latteart-capture-cl/
      └─ latteart-repository/
```

Set execute permissions to the following files:

```bash
chmod +x ./capture.command
chmod +x ./manage.command
chmod +x ./launch
chmod +x latteart/latteart
chmod +x latteart-capture-cl/latteart-capture-cl
chmod +x latteart-repository/latteart-repository
```

When you run the startup script below, LatteArt will start and you can use it in the same way as the Windows version.

- Capturing tool: `capture.command`
- Management tool: `manage.command`

:bulb: If you are asked for "Permission to run downloaded applications", please allow it from "Security & Privacy" in "System Preferences".
:bulb: If you see a dialog with the message `Cannot open because the developer cannot be verified`, select "Cancel" and allow it from "Security & Privacy" in "System Preferences".
:bulb: `Unable to verify the developer. Are you sure you want to open it?`, select "Open".
