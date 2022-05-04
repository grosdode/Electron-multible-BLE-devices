
const bleDeviceList = document.getElementById("deviceList");

async function testIt() {
  let options = {
    // filters: [
    //   { services: [xyz] },
    //   { name: 'xyz' },       // only devices with ''
    //   { namePrefix: 'xyz' }, // only devices starts with ''
    // ],
    // optionalServices: [
    //   xyzServiceUuid,
    // ],
    acceptAllDevices: true, // show all
  };

  const device = await navigator.bluetooth.requestDevice(options);
  document.getElementById("device-name").innerHTML =
    device.name || `ID: ${device.id}`;

    if (device.name) {
          listItem = document.createElement("li");
          listItem.innerHTML = device.name || `ID: ${device.id}`;
          bleDeviceList.appendChild(listItem);
    }

}

document.getElementById("clickme").addEventListener("click", testIt);
