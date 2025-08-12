import { motion } from "framer-motion";
import { ArrowLeft, TrendingUp, BarChart3, Zap, Shield, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

const Trading = () => {
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

        <div className="max-w-4xl animate-hero-3d">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight text-gradient">
            Advanced Trading
          </h1>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl">
            Experience professional-grade trading tools with real-time market data, 
            advanced charting, and institutional-level execution.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
          {[
            {
              icon: TrendingUp,
              title: "Real-Time Analytics",
              description: "Advanced market analysis with real-time data feeds and predictive algorithms.",
              delay: 0.1
            },
            {
              icon: BarChart3,
              title: "Professional Charts",
              description: "TradingView integration with 100+ technical indicators and drawing tools.",
              delay: 0.2
            },
            {
              icon: Zap,
              title: "Lightning Execution",
              description: "Sub-millisecond order execution with smart routing and low latency.",
              delay: 0.3
            },
            {
              icon: Shield,
              title: "Secure Trading",
              description: "Bank-grade security with multi-factor authentication and cold storage.",
              delay: 0.4
            },
            {
              icon: Bot,
              title: "Algo Trading",
              description: "Deploy trading bots and automated strategies with backtesting tools.",
              delay: 0.5
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: feature.delay }}
              className={`glass rounded-xl p-6 animate-card-3d animate-card-3d-delay-${index + 1} glass-hover`}
            >
              <feature.icon className="w-12 h-12 text-gradient mb-4" />
              <h3 className="text-xl font-bold mb-3 text-gradient">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-16"
        >
          <Link to="/signup">
            <Button size="lg" className="button-gradient" enableGlitch={true}>
              Start Trading Now
            </Button>
          </Link>
        </motion.div>
      </motion.section>

      <Footer />
    </div>
  );
};

export default Trading;