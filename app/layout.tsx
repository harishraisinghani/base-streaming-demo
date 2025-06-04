import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "GoldRush Token Balances Streaming Demo",
    description: "Real-time token balances streaming demo using Base Flashblocks",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
