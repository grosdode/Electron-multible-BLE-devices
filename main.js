const { app, BrowserWindow, ipcMain} = require("electron");
const path = require("path");

let mainWindow
let BLEDevicesWindow;
let BLEDevicesList=[];

let BLEScannFinished = false;
let BLEDevicesChoosen;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
  });

  mainWindow.webContents.on(
    "select-bluetooth-device",
    (event, deviceList, callback) => 
    {
      event.preventDefault();
      

      if (deviceList && deviceList.length > 0) 
      {
        deviceList.forEach(element => 
        {
          if (!element.deviceName.includes('Unbekanntes oder nicht unterstütztes Gerät')) 
          {
            if (BLEDevicesList.length > 0) 
            {
              if (BLEDevicesList.findIndex(object => object.deviceId === element.deviceId) === -1) 
              {
                BLEDevicesList.push(element);
                console.log(BLEDevicesList);
              }
            }else
            {
              BLEDevicesList.push(element);
              console.log(BLEDevicesList);
              if (!BLEDevicesWindow) {
                createBLEDevicesWindow();
                BLEScannFinished = false;
              }
            }
          }
        });
      }

      if (BLEScannFinished) {
        if (BLEDevicesChoosen) {
          callback(BLEDevicesChoosen.deviceId);
        }
        else
        {
          callback('');
        }
      }
    }
  );

  mainWindow.loadFile("index.html");
}

function createBLEDevicesWindow() {
  BLEDevicesWindow = new BrowserWindow({
    width: 800,
    height: 600,
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
    BLEScannFinished = true;
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
  BLEDevicesChoosen = BLEDevicesList.find((item) => item.deviceId === args);
  BLEScannFinished = true;
});

ipcMain.on("getBLEDeviceList", (event, args) => {
  if (BLEDevicesWindow)
  {
    BLEDevicesWindow.webContents.send("BLEDeviceList", BLEDevicesList);
  }
});

