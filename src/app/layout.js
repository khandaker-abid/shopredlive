export const metadata = {
  title: 'ShopRedLive',
  description: 'Campus marketplace for secondhand items'
};

import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}


