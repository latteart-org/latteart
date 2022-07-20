![logo](/docs/logo.png)

# LatteArt

[日本語版 Readme はこちら](/README_ja.md)を参照して下さい。

## Project Setup

1. Install `node.js v14.15.3`.
1. Install `yarn` corresponding to the version of node.js.
1. Go to the root directory of the project.
1. Execute the following command.
   ```bash
   yarn install
   ```

## Build

### Build LatteArt

1. Go to the root directory of the project.
1. Execute the following command.
   ```bash
   yarn package
   ```
1. The following directory is created in `dist/latteart`.
   ```bash
   dist/latteart/
       ├─ capture.bat # batch file
       ├─ manage.bat  # batch file
       ├─ launch.config.json # batch execution configuration file
       ├─ launch.exe # executable file for Windows
       ├─ latteart/
       │        ├─ public/ # contains index.html and favicon
       │        └─ latteart.exe # executable file for Windows
       └─ latteart-repository/
                ├─ history-viewer/ # snapshot viewer (review view)
                └─ snapshot-viewer/ # snapshot viewer
   ```

## Watch (for developer)

Detect source code changes and rebuild LatteArt.

### GUI

1. Go to the root directory of the project.
1. Execute the following command to start development server.
   (If you update a source code, that is rebuilt automatically.)
   ```bash
   yarn serve
   ```

### Server

1. Go to the root directory of the project.
1. Execute the following command.
   ```bash
   yarn watch:server
   ```
1. The directory `dist` is created in the current directory, and `dist` contains built `index.js`.
   (If you update a source code, it is rebuilt automatically.)
1. Execute the following command.
   ```bash
   yarn start:server
   ```

## Install

1. Put generated `latteart` directory into any directory.
1. Put `latteart-capture-cl` and `latteart-repository` directories into `latteart` directory.
   ```bash
   latteart/
       ├─ capture.bat
       ├─ manage.bat
       ├─ launch.config.json
       ├─ launch.exe
       ├─ latteart/
       ├─ latteart-capture-cl/ # put
       └─ latteart-repository/ # merge
   ```

## Run

1. Execute the following script.
   - Capture tool
     - capture.bat
   - Test management tool
     - manage.bat
1. The tools are executed on a new tab in a web browser. (You can also execute the tools by opening the following URLs.)
   - Capture tool
     - http://127.0.0.1:3000
   - Test management tool
     - http://127.0.0.1:3000?mode=manage

## Close

1. Close the window with the following message displayed.
   ```bash
   capture: http://127.0.0.1:3000
   manage: http://127.0.0.1:3000?mode=manage
   ```
1. The other windows are automatically closed.

## How to Use the Capture Tool

### on Windows or Mac

1. Select "Windows" from the "platform" list on the config page.
1. Enter the URL of an application that you want to test and press the "Start" button.

### on Android

1. Select "Android" from the "platform" list on the config page.
1. Select the connected device name in the "Device advanced settings" on the config page.
1. If you want to test the application on the local server via remote device features of Chrome Devtools, set the wait time until reloading a browser because it takes a little time to recognize the device.
1. Enter the URL of an application that you want to test and press the "Start" button.

# Contributing to LatteArt

Please read [this document](./docs/contributing.md) to contribute to LatteArt.

# Contact

If you have any questions about LatteArt, please post them to [Discussions](https://github.com/latteart-org/latteart/discussions) on GitHub.

For other inquiries, please contact NTT Software Innovation Center (`iso-tool-support-p-ml [at] hco.ntt.co.jp`).

# License

This software is licensed under the Apache License, Version2.0.
