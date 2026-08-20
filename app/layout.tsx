import './globals.css'
import Shell from '@/components/Shell'
export const metadata = { title:'Second Brain v0.6', description:'Personal Knowledge OS — Knowledge, Brain Map, RAG and Multi-AI' }
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="vi" data-theme="light"><body><Shell>{children}</Shell></body></html> }
