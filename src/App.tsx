import React, { Suspense, lazy } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { useAuth } from "./contexts/AuthContext";
import { AnimatePresence, motion } from 'framer-motion';

// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const WritingTools = lazy(() => import("./pages/WritingTools"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Create the QueryClient outside of the component
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

// Loading component with skeleton animation
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center space-y-4">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 border-t-2 border-primary rounded-full animate-spin"></div>
        <div className="absolute inset-2 border-t-2 border-primary/30 rounded-full animate-ping"></div>
      </div>
      <p className="text-xl font-medium text-muted-foreground animate-pulse">Loading...</p>
    </div>
  </div>
);

// Protected Route Component with improved transitions
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingFallback />;
  }
  
  if (!user) {
    return <Navigate to="/auth" />;
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

const AppRoutes = () => {
  const { user } = useAuth();
  
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/auth" element={
            user ? (
              <Navigate to="/" />
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Auth />
              </motion.div>
            )
          } />
          <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/writing-tools" element={<ProtectedRoute><WritingTools /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

const App = () => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider 
          attribute="class" 
          defaultTheme="system" 
          enableSystem 
          disableTransitionOnChange
        >
          <TooltipProvider delayDuration={300}>
            <AuthProvider>
              <div className="min-h-screen bg-background font-sans antialiased transition-colors duration-300">
                <Toaster />
                <Sonner position="bottom-right" closeButton richColors />
                <AppRoutes />
              </div>
            </AuthProvider>
          </TooltipProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);

export default App;
