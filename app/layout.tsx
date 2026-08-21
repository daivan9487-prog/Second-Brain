import './globals.css'
import Shell from '@/components/Shell'
import AuthGate from '@/components/AuthGate'
export const metadata={title:'Second Brain v0.6.3',description:'Personal Knowledge OS — Private Accounts, Knowledge, Brain Map, RAG and Multi-AI'}
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="vi" data-theme="light"><body><AuthGate><Shell>{children}</Shell></AuthGate></body></html>}
