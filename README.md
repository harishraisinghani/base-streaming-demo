# Base Sepolia Streaming API Demo

This project demonstrates the **GoldRush Streaming API** with a focus on the **Token Balances Stream**. It provides a real-time dashboard for monitoring wallet token balances and block updates on the Base Sepolia testnet.

## Features

- **GoldRush Token Balances Stream**: 
  - Subscribes to the GoldRush WebSocket API for real-time wallet token balances.
  - Capable of receiving updates as fast as every **200ms**.
  - Displays token balances, contract info, and wallet address in a responsive UI.

- **Flashblocks WebSocket Comparison**:
  - Simultaneously connects to the Flashblocks WebSocket for block updates.
  - Allows you to compare the speed and data freshness between GoldRush and Flashblocks streams.

- **Mobile Friendly**:
  - Responsive design ensures wallet addresses and data wrap correctly on all devices.

## How It Works

- The app connects directly to:
  - **GoldRush Streaming API**: `wss://gr-staging.streaming.covalenthq.com/graphql`
  - **Flashblocks WebSocket**: `wss://sepolia.flashblocks.base.org/ws`
- No backend or proxy server required—everything runs in the browser.

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Start the app:**
   ```bash
   npm start
   ```
3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Why GoldRush?

- **Ultra-fast updates**: GoldRush can push token balance changes as quickly as every 200ms, making it ideal for real-time dashboards and trading tools.
- **Comprehensive data**: Get detailed token info, balances, and contract metadata in a single stream.
- **Direct comparison**: See how GoldRush's speed and data compare to Flashblocks in real time.

---

For more information, visit the [Covalent GoldRush API documentation](https://www.covalenthq.com/docs/streaming/).
