import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Index from "./pages/Index";
import Trading from "./pages/Trading";
import Markets from "./pages/Markets";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import LoadingScreen from "./components/LoadingScreen";
import CaptchaVerification from "./components/CaptchaVerification";

const queryClient = new QueryClient();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [isAppReady, setIsAppReady] = useState(false);

  const handleLoadingComplete = () => {
    setIsLoading(false);
    setShowCaptcha(true);
  };

  const handleCaptchaVerified = () => {
    setShowCaptcha(false);
    setIsAppReady(true);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background">
          <Toaster />
          <Sonner />
          
          <AnimatePresence mode="wait">
            {isLoading && (
              <LoadingScreen key="loading" onComplete={handleLoadingComplete} />
            )}
            
            {showCaptcha && (
              <CaptchaVerification key="captcha" onVerified={handleCaptchaVerified} />
            )}
            
            {isAppReady && (
              <BrowserRouter key="app">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/trading" element={<Trading />} />
                  <Route path="/markets" element={<Markets />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/login" element={<Login />} />
                </Routes>
              </BrowserRouter>
            )}
          </AnimatePresence>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;