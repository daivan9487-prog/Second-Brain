import './globals.css'
import Shell from '@/components/Shell'
export const metadata = { title:'Second Brain', description:'Personal Knowledge OS' }
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="vi"><body><Shell>{children}</Shell></body></html> }
