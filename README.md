![logo](/docs/logo.png)

# LatteArt

- 日本語版は[README_ja.md](/README_ja.md)を参照して下さい。

## Project Setup

1. Install `node.js v12.18.1`.
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
   dist/latteart
       ├─ public # contains index.html and favicon
       ├─ latteart.exe # executable file for Windows
       └─ latteart # executable file for Mac
   ```

### Build Snapshot Viewer

Snapshot viewer is required for building `latteart-repository`.
If you want to know more details, please read [latteart-repository](https://github.com/latteart-org/latteart-repository).

1. Go to the root directory of the project.
1. Execute the following command.
   ```bash
   yarn build:viewer
   yarn build:viewer:history
   ```
1. The directories `snapshot-viewer` and `history-viewer` is created in the current directory.

## Watch (for developer)

Detect source code changes and rebuild LatteArt.

### GUI

1. Go to the root directory of the project.
1. Execute the following command.
   ```bash
   yarn watch:gui
   ```
1. The directory `dist` is created in the current directory, and `dist` contains built `index.js`.
   (If you update a source code, that is rebuilt automatically.)
1. Execute the following command.
   ```bash
   yarn start:server
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
   latteart
       ├─ capture.vbs
       ├─ manage.vbs
       ├─ latteart
       ├─ latteart-capture-cl # put
       └─ latteart-repository # put
   ```

## Run

1. Execute the following script.
   - Capture tool
     - capture.vbs
   - Test management tool
     - manage.vbs
1. The tools are executed on a new tab in a web browser. (You can also execute the tools by opening the following URLs.)
   - Capture tool
     - http://127.0.0.1:3000
   - Test management tool
     - http://127.0.0.1:3000?mode=manage

## Close

1. Close the window with the following message displayed.
   ```bash
   Capture Tool: http://127.0.0.1:3000
   Test Management Tool: http://127.0.0.1:3000?mode=manage
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

## License

This software is licensed under the Apache License, Version2.0.
