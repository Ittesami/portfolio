import './globals.css';

export const metadata = {
  title: 'Mohammad Ittehad - Full Stack Developer',
  description: 'Animated portfolio website showcasing projects and skills',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}