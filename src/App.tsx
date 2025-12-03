import './styles/base.css'
import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes'
import { ThemeProvider } from './contexts/ThemeContext'
import { UserProvider } from './contexts/UserContext'
import { TaskProvider } from './contexts/TaskContext'
import { CartProvider } from './contexts/CartContext'
import { BusinessModeProvider } from './contexts/BusinessModeContext'
import BusinessModeLoader from './components/common/BusinessModeLoader'
import { ToastProvider } from './components/ui/toast'
import Chatbot from './components/chatbot/ChatBot'
import AdminToggle from './components/common/AdminToggle'
import { MessageCircle } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function App() {
    const [open, setOpen] = useState(false)
    
    return (
        <ThemeProvider>
            <UserProvider>
                <TaskProvider>
                    <CartProvider>
                        <ToastProvider>
                        <BusinessModeProvider>
                            <BusinessModeLoader />
                            <BrowserRouter>
                                <div className="min-h-screen flex flex-col">
                                    {/* Khu vực route chính */}
                                    <div className="flex-1">
                                        <AppRoutes />
                                    </div>

                                {/* Nút mở/đóng Chatbot */}
                                <button
                                    onClick={() => setOpen(!open)}
                                    className="fixed bottom-4 right-4 w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg hover:bg-blue-700"
                                >
                                    <MessageCircle size={28} />
                                </button>

                                {/* Hộp Chatbot với hiệu ứng */}
                                <AnimatePresence>
                                    {open && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 50, scale: 0.9 }}
                                            transition={{ duration: 0.3 }}
                                            className="fixed bottom-20 right-4 w-80 shadow-lg"
                                        >
                                            <Chatbot />
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Demo: Admin Toggle Button */}
                                <AdminToggle />
                            </div>
                        </BrowserRouter>
                        </BusinessModeProvider>
                        </ToastProvider>
                    </CartProvider>
                </TaskProvider>
            </UserProvider>
        </ThemeProvider>
    )
}

export default App
