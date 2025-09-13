import { Sidebar, SidebarProvider } from '@siluat/shadcn-ui/components/sidebar';
import { ThemeProvider } from './_components/ThemeProvider';
import { TopBar } from './_components/TopBar';
import './global.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Animation Practice</title>
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider>
            <div className="flex w-dvw">
              <Sidebar></Sidebar>
              <div className="flex grow flex-col">
                <TopBar />
                <main className="grow grid place-items-center">{children}</main>
              </div>
            </div>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
