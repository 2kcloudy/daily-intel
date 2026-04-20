import "./globals.css";

export const metadata = {
  title: "Daily Intel — Business & Investment News Digest",
  description: "World-class curated business and investment intelligence, delivered daily.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Prevent flash of wrong theme — runs before React hydrates */�
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('di-theme');if(t==='dark')document.documentElement.setAttribute('data-theme','dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
