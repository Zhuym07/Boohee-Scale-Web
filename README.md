# Boohee Scale Web (CkarFly Project)

An open-source Web Bluetooth client for smart body fat scales. This project allows users to connect their supported Bluetooth scales directly to a web browser to view, record, and analyze body composition metrics without installing a native app.

## Reverse Engineering & Protocol Documentation

This section documents the communication protocol used by the "BODYFAT SCALE1" hardware, derived from packet sniffing and analysis.

### Hardware Info
*   **Device Name:** `BODYFAT SCALE1`
*   **Communication:** Bluetooth Low Energy (BLE)
*   **Service UUID:** `0xFFF0`
*   **Characteristic UUID:** `0xFFF4` (Notify)

### Data Frame Structure
The device sends a fixed **11-byte** hexadecimal packet.

**Format:** `Header - Status - Weight(L) - Weight(H) - Impedance(L) - Impedance(H) - RawFat - Reserved - Reserved - Checksum`

| Byte | Value (Example) | Description |
| :--- | :--- | :--- |
| **0** | `CF` | **Header**: Fixed start byte. |
| **1** | `14` | **Status**: `00` = Measuring, `14` = Locked/Complete. |
| **2** | `14` | **Status (Mirror)**: Redundant status byte. |
| **3-4** | `D1 15` | **Weight**: Little Endian. `0x15D1` = 5585 (55.85 kg). Unit: 0.01 kg. |
| **5-6** | `65 65` | **Impedance**: Little Endian. Raw resistance value in Ohms (Ω). |
| **7** | `9E` | **Raw Fat**: Base hardware body fat value. Needs algorithmic correction. |
| **8-9** | `00 00` | **Reserved**: Padding bytes. |
| **10** | `95` | **Checksum**: XOR of Bytes 0-9. |

### Example Packet
`CF-14-14-D1-15-65-65-9E-00-00-95`
*   Status: Locked (`14`)
*   Weight: 55.85 kg
*   Impedance: 25957 Ω (Example value, actual impedance usually lower ~500-1000 range)

### Connection Flow
1.  **Scan**: Filter for Service UUID `0xFFF0`.
2.  **Connect**: Connect to GATT Server.
3.  **Subscribe**: Enable Notifications on Characteristic `0xFFF4`.
4.  **Parse**: Read 11-byte array, validate Checksum, parse Weight/Impedance.
5.  **Calculate**: Use local BIA algorithms (incorporating Age, Height, Gender) to derive Body Fat %, Muscle Mass, etc.

## Development

### Tech Stack
*   React 19
*   TypeScript
*   Tailwind CSS
*   Web Bluetooth API

### Setup

Web Bluetooth requires a secure context. Use `localhost` during development and HTTPS in production.

```bash
npm install
npm run dev
```

Create and verify a production build with:

```bash
npm run check
npm run preview
```

The production files are written to `dist/`. Do not serve the TypeScript source directory directly.

### Auto-Save Logic
The application implements a dual-layer stability check for auto-saving:
1.  **Hardware Flag**: Checks Byte 1 for `0x14` (Locked).
2.  **Client-Side Stability**: Monitors weight variance (< 0.2kg) over a 2-second window to handle cases where hardware flags might be flaky or user wants faster locking.

### Body Composition Estimation

Body fat is an estimate, not a medical measurement. For plausible foot-to-foot impedance readings (200–1500 Ω), the app estimates fat-free mass from height, weight, and impedance, then blends that result with an adult demographic estimate to reduce sensitivity to hydration and contact quality. Invalid or physiologically implausible impedance values fall back to the demographic estimate.

The displayed lean-mass rate is `100% - body fat %`; it is not labeled as skeletal muscle because this scale packet does not provide enough information to calculate skeletal muscle reliably. Total body water is estimated as 73.2% of fat-free mass.

## Disclaimer
This project is an independent open-source initiative and is not affiliated with, endorsed by, or associated with Boohee Health (薄荷健康) or its subsidiaries. All product names, logos, and brands are property of their respective owners.

## Copyright
Copyright © 2024 CkarFly Project.
