import { ScaleData, SERVICE_UUID, CHARACTERISTIC_UUID } from '../types';

// Web Bluetooth API Type Definitions
interface BluetoothLEScanFilter {
  name?: string;
  namePrefix?: string;
  services?: (string | number)[];
}

interface RequestDeviceOptions {
  filters?: BluetoothLEScanFilter[];
  optionalServices?: (string | number)[];
  acceptAllDevices?: boolean;
}

interface BluetoothRemoteGATTCharacteristic extends EventTarget {
  value?: DataView;
  startNotifications(): Promise<BluetoothRemoteGATTCharacteristic>;
  stopNotifications(): Promise<BluetoothRemoteGATTCharacteristic>;
}

interface BluetoothRemoteGATTService {
  getCharacteristic(characteristic: string | number): Promise<BluetoothRemoteGATTCharacteristic>;
}

interface BluetoothRemoteGATTServer {
  device: BluetoothDevice;
  connected: boolean;
  connect(): Promise<BluetoothRemoteGATTServer>;
  disconnect(): void;
  getPrimaryService(service: string | number): Promise<BluetoothRemoteGATTService>;
}

interface BluetoothDevice extends EventTarget {
  id: string;
  name?: string;
  gatt?: BluetoothRemoteGATTServer;
}

interface Bluetooth {
  requestDevice(options?: RequestDeviceOptions): Promise<BluetoothDevice>;
}

declare global {
  interface Navigator {
    bluetooth: Bluetooth;
  }
}

export class BluetoothService {
  private device: BluetoothDevice | null = null;
  private server: BluetoothRemoteGATTServer | null = null;
  private characteristic: BluetoothRemoteGATTCharacteristic | null = null;

  /**
   * Request and connect to the Bluetooth device
   */
  async connect(onDataReceived: (data: ScaleData) => void, onDisconnect: () => void): Promise<void> {
    try {
      this.device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [SERVICE_UUID] }],
        optionalServices: [SERVICE_UUID] // Redundant but safe for some browsers
      });

      this.device.addEventListener('gattserverdisconnected', onDisconnect);

      if (!this.device.gatt) {
        throw new Error('GATT server not available');
      }

      this.server = await this.device.gatt.connect();
      const service = await this.server.getPrimaryService(SERVICE_UUID);
      this.characteristic = await service.getCharacteristic(CHARACTERISTIC_UUID);

      await this.characteristic.startNotifications();
      this.characteristic.addEventListener('characteristicvaluechanged', (event: Event) => {
        const value = (event.target as BluetoothRemoteGATTCharacteristic).value;
        if (value) {
          const parsedData = this.parseScaleData(value);
          if (parsedData) {
            onDataReceived(parsedData);
          }
        }
      });

    } catch (error) {
      console.error('Connection failed', error);
      throw error;
    }
  }

  disconnect() {
    if (this.device && this.device.gatt && this.device.gatt.connected) {
      this.device.gatt.disconnect();
    }
    this.device = null;
    this.server = null;
    this.characteristic = null;
  }

  /**
   * Parses the 11-byte hex data from the scale based on the documentation.
   * Frame: CF-SS-SS-WW-WW-II-II-FF-00-00-CS
   */
  private parseScaleData(dataView: DataView): ScaleData | null {
    // 1. Length Check
    if (dataView.byteLength !== 11) {
      console.warn(`Invalid data length: ${dataView.byteLength}`);
      return null;
    }

    // Generate Hex String for Debugging/Display
    const hexParts: string[] = [];
    for (let i = 0; i < dataView.byteLength; i++) {
      hexParts.push(dataView.getUint8(i).toString(16).toUpperCase().padStart(2, '0'));
    }
    const rawHex = hexParts.join('-');

    // 2. Header Check (Byte 0 = 0xCF)
    const header = dataView.getUint8(0);
    if (header !== 0xCF) {
      console.warn(`Invalid header: ${header.toString(16)}`);
      return null;
    }

    // 3. Checksum Verification (XOR of Byte 0 to 9)
    let calculatedChecksum = 0;
    for (let i = 0; i < 10; i++) {
      calculatedChecksum ^= dataView.getUint8(i);
    }
    const receivedChecksum = dataView.getUint8(10);

    if (calculatedChecksum !== receivedChecksum) {
      console.warn(`Checksum mismatch. Calc: ${calculatedChecksum.toString(16)}, Rec: ${receivedChecksum.toString(16)}`);
      return null;
    }

    // 4. Data Extraction
    
    // Status: Byte 1-2 (0x1414 = Locked/Complete)
    // Note: Documentation says 0x14 for locked. 
    // Example shows "14 14" for Bytes 1-2. Let's check Byte 1.
    const statusByte = dataView.getUint8(1);
    const isStable = statusByte === 0x14; // Decimal 20

    // Weight: Byte 3-4 (Little Endian). Unit: 0.01kg
    const weightRaw = dataView.getUint16(3, true); // true = Little Endian
    const weight = weightRaw / 100;

    // Impedance: Byte 5-6. 
    // Documentation example: "65 65". Let's assume Little Endian as well, consistent with weight.
    const impedance = dataView.getUint16(5, true); 

    // Raw Body Fat: Byte 7. 
    // Doc: 0x9E (158) -> 15.8% Raw.
    const rawFatRaw = dataView.getUint8(7);
    const rawFat = rawFatRaw / 10; 

    return {
      weight,
      impedance,
      isStable,
      rawFat,
      timestamp: Date.now(),
      rawHex
    };
  }
}

export const bluetoothService = new BluetoothService();