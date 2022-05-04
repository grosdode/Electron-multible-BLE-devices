const { app, BrowserWindow, ipcMain} = require("electron");
const path = require("path");

let mainWindow
let BLEDevicesWindow;
let BLEDevicesList=[];

let callbackForBluetoothEvent = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
  });

  mainWindow.webContents.on(
    "select-bluetooth-device",
    (event, deviceList, callback) => 
    {
      event.preventDefault(); // do not choose the first one

      if (deviceList && deviceList.length > 0) {  // find devices?
        deviceList.forEach((element) => {         
          if (
            !element.deviceName.includes(                  // reduce noise by filter Devices without name
              "Unbekanntes oder nicht unterstütztes Gerät" // better use filter options in renderer.js
            ) &&
            !element.deviceName.includes("Unknown or Unsupported Device") // better use filter options in renderer.js
          ) {
            if (BLEDevicesList.length > 0) {  // BLEDevicesList not empty?
              if (
                BLEDevicesList.findIndex(     // element is not already in BLEDevicesList
                  (object) => object.deviceId === element.deviceId
                ) === -1
              ) {
                BLEDevicesList.push(element);
                console.log(BLEDevicesList);
              }
            } else {
              BLEDevicesList.push(element);
              console.log(BLEDevicesList);
              if (!BLEDevicesWindow) {
                createBLEDevicesWindow(); // open new window to show devices
              }
            }
          }
        });
      }

      callbackForBluetoothEvent = callback; // to make it accessible outside https://technoteshelp.com/electron-web-bluetooth-api-requestdevice-error/
    }
  );

  mainWindow.loadFile("index.html");
}

function createBLEDevicesWindow() {
  BLEDevicesWindow = new BrowserWindow({
    width: 300,
    height: 400,
    parent: mainWindow,
    title: "Bluetooth Devices near by",
    modal: true,
    webPreferences: {
      nodeIntegration: false, // is default value after Electron v5
      contextIsolation: true, // protect against prototype pollution
      enableRemoteModule: false, // turn off remote
      preload: path.join(__dirname, "BLEDevicesPreload.js"), // use a preload script
    },
  });

  BLEDevicesWindow.loadFile("BLEDevicesWindow.html");

  BLEDevicesWindow.on('close', function () {
    BLEDevicesWindow = null;    
    callbackForBluetoothEvent("");
    BLEDevicesList = [];
  })
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});


ipcMain.on("toMain", (event, args) => {
  console.log(args);
});

ipcMain.on("BLEScannFinished", (event, args) => {
  console.log(args);
  console.log(BLEDevicesList.find((item) => item.deviceId === args));
  let BLEDevicesChoosen = BLEDevicesList.find((item) => item.deviceId === args);
  if (BLEDevicesChoosen) callbackForBluetoothEvent(BLEDevicesChoosen.deviceId);
  else callbackForBluetoothEvent("");
  BLEDevicesList = [];
});

ipcMain.on("getBLEDeviceList", (event, args) => {
  if (BLEDevicesWindow)
  {
    BLEDevicesWindow.webContents.send("BLEDeviceList", BLEDevicesList);
  }
});

