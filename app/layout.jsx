import './globals.css';

export const metadata = {
  title: 'HemoGuard AI - Chatbot Dược Lâm Sàng Tra Cứu Tương Tác Thuốc Chống Đông',
  description: 'Hệ thống AI Dược lâm sàng chuyên sâu tra cứu, phân tích và cảnh báo tương tác thuốc chống đông máu (Warfarin, DOACs, Heparin).',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-800 antialiased">
        {children}
      </body>
    </html>
  );
}
