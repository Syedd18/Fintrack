import './globals.css'
import type { Metadata, Viewport } from 'next'
import PushNotificationsManager from './components/PushNotificationsManager'
import AppUrlManager from './components/AppUrlManager'

export const metadata: Metadata = {
  title: 'FinTrack AI — Personal Financial Operating System',
  description: 'AI-powered personal finance tracking. Understand your financial health, track spending effortlessly, receive intelligent guidance, and reach your financial goals.',
  keywords: ['fintech', 'personal finance', 'AI', 'UPI tracking', 'budget planner', 'financial health'],
  authors: [{ name: 'FinTrack AI' }],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#FAFAF8',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.onerror = function(msg, url, line, col, err) {
                var d = document.getElementById('_err');
                if (d) { d.style.display='block'; d.textContent = msg + ' at ' + url + ':' + line; }
                return false;
              };
              window.addEventListener('unhandledrejection', function(e) {
                var d = document.getElementById('_err');
                if (d) { d.style.display='block'; d.textContent = 'Promise: ' + (e.reason && e.reason.message || e.reason); }
              });
            `,
          }}
        />
      </head>
      <body>
        <div id="_err" style={{display:'none',position:'fixed',top:0,left:0,right:0,padding:'16px',background:'#ff4444',color:'white',fontSize:'12px',zIndex:99999,wordBreak:'break-all'}} />
        <PushNotificationsManager />
        <AppUrlManager />
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans relative overflow-hidden transition-colors duration-300">
          {children}
        </div>
      </body>
    </html>
  )
}
