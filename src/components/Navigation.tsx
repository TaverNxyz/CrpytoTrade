import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, Command } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-primary/20"
    >
      <div className="container px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Command className="w-8 h-8 text-gradient" />
            <span className="text-xl font-bold text-gradient">CryptoTrade</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/markets" className="text-gradient hover:opacity-80 transition-opacity">
              Markets
            </Link>
            <Link to="/trading" className="text-gradient hover:opacity-80 transition-opacity">
              Trading
            </Link>
            <Link to="/dashboard" className="text-gradient hover:opacity-80 transition-opacity">
              Dashboard
            </Link>
            <a href="#features" className="text-gradient hover:opacity-80 transition-opacity">
              Features
            </a>
            <a href="#pricing" className="text-gradient hover:opacity-80 transition-opacity">
              Pricing
            </a>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gradient">Welcome, {user.email}</span>
                <Button onClick={handleSignOut} variant="outline" className="glass">
                  Sign Out
                </Button>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" className="text-gradient">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="button-gradient">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gradient"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden mt-4 pt-4 border-t border-primary/20"
          >
            <div className="flex flex-col space-y-4">
              <Link
                to="/markets"
                className="text-gradient hover:opacity-80 transition-opacity"
                onClick={() => setIsOpen(false)}
              >
                Markets
              </Link>
              <Link
                to="/trading"
                className="text-gradient hover:opacity-80 transition-opacity"
                onClick={() => setIsOpen(false)}
              >
                Trading
              </Link>
              <Link
                to="/dashboard"
                className="text-gradient hover:opacity-80 transition-opacity"
                onClick={() => setIsOpen(false)}
              >
                Trading
              </Link>
              <a
                href="#features"
                className="text-gradient hover:opacity-80 transition-opacity"
                onClick={() => setIsOpen(false)}
              >
                Features
              </a>
              <a
                href="#pricing"
                className="text-gradient hover:opacity-80 transition-opacity"
                onClick={() => setIsOpen(false)}
              >
                Pricing
              </a>
              
              {user ? (
                <div className="flex flex-col space-y-2 pt-4 border-t border-primary/20">
                  <span className="text-gradient">Welcome, {user.email}</span>
                  <Button onClick={handleSignOut} variant="outline" className="glass w-full">
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col space-y-2 pt-4 border-t border-primary/20">
                  <Link to="/login" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="text-gradient w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/signup" onClick={() => setIsOpen(false)}>
                    <Button className="button-gradient w-full">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navigation;