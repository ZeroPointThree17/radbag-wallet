import React, { Component } from "react";

import DeviceSelectionScreen from "./DeviceSelectionScreen";
import ShowAddressScreen from "./ShowAddressScreen";

import TransportBLE from "@ledgerhq/react-native-hw-transport-ble";
import { isJSDocLinkPlain } from "typescript";
var serialize = require('serialize-javascript');

// This is helpful if you want to see BLE logs. (only to use in dev mode)

class HardwareWalletBluetooth extends Component {
  state = {
    transport: null
  };

  onSelectDevice = async device => {

    var ser = serialize(
        device
    );

    // console.log("DEVICE ID: " + ser);
    console.log("PROD ID: " + JSON.stringify(device));
    const transport = await TransportBLE.open(device);
    transport.on("disconnect", () => {
      // Intentionally for the sake of simplicity we use a transport local state
      // and remove it on disconnect.
      // A better way is to pass in the device.id and handle the connection internally.
      this.setState({ transport: null });
    });
    this.setState({ transport });
  };

  render() {
    const { transport } = this.state;
    if (!transport) {
      return <DeviceSelectionScreen onSelectDevice={this.onSelectDevice} />;
    }
    return <ShowAddressScreen transport={transport} />;
  }
}

export default HardwareWalletBluetooth;