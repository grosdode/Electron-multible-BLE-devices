const BLEDevicesList = document.getElementById("DeviceList");

let BLEDevicesListarray = [];

setInterval(() => {
   window.api.send("BLEScannFinished", "no Device");
   window.close();
}, 120000);

function itemDone(element) {
   console.log(element.id);
   window.api.send("BLEScannFinished", element.id);
   window.close();
}

// Called when message received from main process
window.api.receive("BLEDeviceList", (data) => {

  console.log(data);

  let oldLength = BLEDevicesListarray.length;
  let diff = data.length - BLEDevicesListarray.length;

  if (diff > 0) {
    BLEDevicesListarray = [...data];
  }

  for (let i = 0; i < diff; i++) {
    let index = oldLength + i;
    var item = document.createElement("li");
    item.addEventListener("click", function () {itemDone(this);});
    console.log(BLEDevicesListarray[index]);
    item.id = BLEDevicesListarray[index].deviceId;

    // Set its contents:
    item.appendChild(
      document.createTextNode(BLEDevicesListarray[index].deviceName + " (" + BLEDevicesListarray[index].deviceId + ")")
    );

    // Add it to the list:
    BLEDevicesList.appendChild(item);
  }

});

window.api.receive("BLEScannElement", (data) => {
  console.log(data);
});

setInterval(() => {
  window.api.send("getBLEDeviceList", "getDevices");
}, 1000);