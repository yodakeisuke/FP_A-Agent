import "./globals.css"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sample Agent Minimal UI",
  description: "Hello-world UI for the sample AI agent scaffold.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja" className="h-full">
      <body className="h-full bg-background font-sans text-foreground antialiased">
        {children}
      </body>
    </html>
  )
}
