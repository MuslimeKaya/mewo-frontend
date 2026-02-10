import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
    subsets: ["latin"],
    variable: "--font-plus-jakarta",
    weight: ["300", "400", "500", "600", "700", "800"],
});

const jetBrainsMono = JetBrains_Mono({
    subsets: ["latin"],
    variable: "--font-jetbrains-mono",
    weight: ["400", "500"],
});

export const metadata: Metadata = {
    title: "Mewo | AI Premium English Academy",
    description: "Join Mewo, the premium AI-powered English learning academy. Connect with expert teachers, track your progress, and master English with our advanced AI tutor.",
    keywords: ["English learning", "AI tutor", "English academy", "online English lessons", "language learning app"],
    authors: [{ name: "Mewo Team" }],
    openGraph: {
        title: "Mewo | AI Premium English Academy",
        description: "Your premium AI English learning companion and academy.",
        url: "https://mewo.academy",
        siteName: "Mewo",
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Mewo | AI Premium English Academy",
        description: "Master English with expert teachers and AI companion.",
    },
    appleWebApp: {
        capable: true,
        statusBarStyle: "black-translucent",
        title: "Mewo",
    },
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
    themeColor: "#3d4cee",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="scroll-smooth">
            <body
                className={`${plusJakartaSans.variable} ${jetBrainsMono.variable} bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100`}
            >
                <div id="root" className="app-container">
                    {children}
                </div>
            </body>
        </html>
    );
}
