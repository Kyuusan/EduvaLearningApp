import { Outfit } from 'next/font/google';
import "./globals.css";
import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import Providers from './provider';

const outfit = Outfit({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className}`}>
        <ThemeProvider>
          <SidebarProvider>
            <Providers>
            {children}
            </Providers>
            </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
