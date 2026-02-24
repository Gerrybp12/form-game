import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Scroll Weaver | FormBuilder",
  description: "Portal untuk menempa dan mengelola gulungan form",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          // Latar belakang gelap bernuansa kayu/malam agar perkamen terlihat kontras
          background: "linear-gradient(135deg, #2b1b12 0%, #120a05 100%)", 
          color: "rgba(250, 239, 210, 0.95)", // Warna teks default krem terang
          display: "flex",
          flexDirection: "column",
        }}
      >
        <main
          style={{
            flex: 1, // Agar main mengisi sisa ruang antara navbar dan footer
            margin: "0 auto",
            width: "100%",
            maxWidth: 1024,
            padding: "32px 16px",
          }}
        >
          {children}
        </main>
      </body>
    </html>
  );
}