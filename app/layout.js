import './globals.css';
import '@flowengage/react-chatbot/styles.css';

export const metadata = {
  title: 'bayern-evangelisch.de NEXT — Angebot',
  description: 'ELKB × OpenSense Labs — Website Relaunch Proposal',
};

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
