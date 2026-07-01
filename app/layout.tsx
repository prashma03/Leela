import type { Metadata } from "next";
import "./globals.css";
export const metadata:Metadata={title:"Leela — Stories of Krishna",description:"Little Krishna stories and Bhagavad Gita wisdom in simple, welcoming English."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
