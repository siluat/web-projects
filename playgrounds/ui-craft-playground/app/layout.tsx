import {
  CraftListSidebar,
  CraftListSidebarProvider,
  CraftListSidebarTrigger,
} from './(navigation)/components/CraftListSidebar';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>UI Craft Playground</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        <CraftListSidebarProvider>
          <CraftListSidebar />
          <div className="flex w-full relative">
            <div className="absolute top-0 left-0">
              <CraftListSidebarTrigger />
            </div>
            <main className="flex-1">{children}</main>
          </div>
        </CraftListSidebarProvider>
      </body>
    </html>
  );
}
