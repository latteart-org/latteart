![logo](/docs/logo.png)

[日本語版 Readme はこちら](/README_ja.md)を参照して下さい。

# LatteArt

LatteArt is a tool aimed at facilitating agile and efficient testing by enabling the recording, visualization, and analysis of manual End-to-End tests.

The following use cases are available:

- Visualization and analysis of exploratory tests to obtain feedback
- Tracking of performed tests
- Sharing procedures for reproducing bugs
- Automatic generation of highly maintainable E2E test scripts

LatteArt consists of the following two features:

- **Recording feature**: Recording operations/findings during testing
- **Management feature**: Planning exploratory tests, managing and visualizing test results

# Demo (Core Features)

[Video (YouTube)](https://www.youtube.com/watch?v=_lfaRN8ipA4)

# Prerequisites

1. Download the `ChromeDriver` that corresponds to the version of your Google Chrome and add it to the PATH.
   - Download site (https://chromedriver.chromium.org/downloads)
1. Install `cwebp` and add it to the PATH.
   - Download site (https://developers.google.com/speed/webp/docs/precompiled)
1. Ensure that the Web application to be tested can be accessed from Google Chrome.

:bulb: If using Edge, download the `edgedriver` that corresponds to the version of Edge instead of Chrome in Step 1 and add it to the PATH.

- Download site (https://developer.microsoft.com/ja-jp/microsoft-edge/tools/webdriver/)

# Installation

Download the latest version from [Releases](https://github.com/latteart-org/latteart/releases) on GitHub.

After extracting the downloaded ZIP file, the following directory structure will be created.

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

# Launch LatteArt

Execute the startup script in the extracted directory.

- Recording tool: `capture.bat`
- Management tool: `manage.bat`

Then, a web server for running LatteArt will be started with the displayed command prompt, and the tool screen will be displayed on the browser.

```
capture: http://127.0.0.1:3000?capture=http://127.0.0.1:3001&repository=http://127.0.0.1:3002
manage: http://127.0.0.1:3000?mode=manage&capture=http://127.0.0.1:3001&repository=http://127.0.0.1:3002
```

:bulb: If the server is running, you can also use the following URLs to access the tools directly from your browser.

- Recording tool: http://127.0.0.1:3000
- Management tool: http://127.0.0.1:3000?mode=manage

## Launch Script Setting

You can change the port of each server that the startup script starts

Please modify `env.port` and `http.url` of the server you want to change under `servers`.

:warning: The port part of `env.port` and `http.url` should have the same value.

```jsonc
{
  // ...
  "servers": [
    {
      "name": "latteart-repository",
      // ...
      "env": { "port": "13002" },
      "http": {
        "url": "http://localhost:13002"
        // ...
      }
    }
    // ...
  ]
}
```

# Close LatteArt

Close the command prompt window that was launched when starting to end the tool.

:warning: Simply closing the LatteArt tab on your browser will not shut down the server.

# How to Use the Recording Tool

## on Windows or Mac

1. Select "Windows" from the "platform" list on the config page.
1. Enter the URL of an application that you want to test and press the "Start" button.

## on Android

1. Select "Android" from the "platform" list on the config page.
1. Select the connected device name in the "Device advanced settings" on the config page.
1. If you want to test the application on the local server via remote device features of Chrome Devtools, set the wait time until reloading a browser because it takes a little time to recognize the device.
1. Enter the URL of an application that you want to test and press the "Start" button.

# Contributing to LatteArt

Please read [this document](./docs/contributing.md) to contribute to LatteArt.

# Contact

If you have any questions about LatteArt, please post them to [Discussions](https://github.com/latteart-org/latteart/discussions) on GitHub.

For other inquiries, please contact NTT Software Innovation Center (`latteart-p-ml [at] ntt.com`).

# For Researchers

If you incorporate LatteArt in your research, we kindly request that you cite the following paper:

```
@INPROCEEDINGS{Kirinuki2023,
  author={Kirinuki, Hiroyuki and Tajima, Masaki and Haruto, Tanno},
  booktitle={2023 IEEE Conference on Software Testing, Verification and Validation (ICST)},
  title={LatteArt: A Platform for Recording and Analyzing Exploratory Testing},
  year={2023},
  pages={443-453},
  doi={10.1109/ICST57152.2023.00048}}
```

Furthermore, if you utilize the test generation feature, we respectfully ask that you also cite the following paper:

```
@article{Kirinuki2022,
  title={Automating End-to-End Web Testing via Manual Testing},
  author={Hiroyuki Kirinuki and Haruto Tanno},
  journal={Journal of Information Processing},
  volume={30},
  pages={294-306},
  year={2022},
  doi={10.2197/ipsjjip.30.294}
}
```

# License

This software is licensed under the Apache License, Version2.0.
