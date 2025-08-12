import { motion } from "framer-motion";
import { ArrowLeft, Mail, Lock, Shield, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

const Login = () => {
  return (
    <div className="min-h-screen text-foreground" style={{ background: 'var(--gradient-background)' }}>
      <Navigation />
      
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative container px-4 pt-40 pb-20"
      >
        <Link to="/" className="inline-flex items-center mb-8 text-gradient hover:opacity-80 transition-opacity">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 animate-hero-3d">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight text-gradient">
              Welcome Back
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Sign in to access your trading dashboard and continue your crypto journey.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-xl p-8 animate-card-3d glass-hover"
            >
              <h3 className="text-2xl font-bold mb-6 text-gradient">Sign In</h3>
              <form className="space-y-6">
                <div>
                  <Label htmlFor="email" className="text-gradient-secondary">Email Address</Label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                    <Input 
                      id="email" 
                      type="email" 
                      className="pl-10 glass border-primary/30 focus:border-primary" 
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password" className="text-gradient-secondary">Password</Label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                    <Input 
                      id="password" 
                      type="password" 
                      className="pl-10 glass border-primary/30 focus:border-primary" 
                      placeholder="Enter your password"
                    />
                  </div>
                </div>

                <Button className="w-full button-gradient text-lg py-6" enableGlitch={true}>
                  Sign In
                </Button>
              </form>

              <div className="text-center mt-6 space-y-2">
                <Link to="/forgot-password" className="text-gradient hover:opacity-80 text-sm">
                  Forgot your password?
                </Link>
                <p className="text-muted-foreground">
                  Don't have an account? 
                  <Link to="/signup" className="text-gradient ml-1 hover:opacity-80">
                    Sign up
                  </Link>
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-8"
            >
              <div className="glass rounded-xl p-6 animate-card-3d animate-card-3d-delay-1 glass-hover">
                <Shield className="w-12 h-12 text-gradient mb-4" />
                <h4 className="text-xl font-bold mb-3 text-gradient">Secure Access</h4>
                <p className="text-muted-foreground">
                  Your account is protected with advanced security measures including 
                  two-factor authentication and encrypted data storage.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  "Access your trading portfolio",
                  "Real-time market data",
                  "Advanced trading tools",
                  "Secure wallet management",
                  "24/7 account monitoring"
                ].map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className="flex items-center space-x-3"
                  >
                    <CheckCircle className="w-5 h-5 text-secondary" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      <Footer />
    </div>
  );
};

export default Login;