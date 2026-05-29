import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Loan Management System",
  description: "Borrower portal and operations dashboard for loan lifecycle management."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
