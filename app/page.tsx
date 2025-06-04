"use client";

import BlockStream from "./components/BlockStream";
import WalletBalance from "./components/WalletBalance";
import { WebSocketProvider } from "./context/WebSocketContext";
import styles from "./page.module.css";

export default function Page() {
    return (
        <WebSocketProvider>
            <div className={styles.header}>
                <h1 className={styles.title}>Base Sepolia Data Streams</h1>
                <p className={styles.subtitle}>Real-time blockchain data stream visualization</p>
            </div>
            <div className={styles.dashboardGrid}>
                <BlockStream />
                <WalletBalance />
            </div>
        </WebSocketProvider>
    );
}
