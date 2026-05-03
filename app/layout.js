export const metadata = {
  title: 'DEYJUNG Restro & Pizzeria',
  description: 'Order food from DEYJUNG — Gelephu, Bhutan',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body style={{ margin: 0, padding: 0, background: '#fdf8f3' }}>
        {children}
      </body>
    </html>
  );
}
