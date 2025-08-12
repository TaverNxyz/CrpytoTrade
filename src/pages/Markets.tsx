import { motion } from "framer-motion";
import { ArrowLeft, Zap, Globe, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import LivePriceDisplay from "@/components/LivePriceDisplay";
import { Link } from "react-router-dom";

const Markets = () => {
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
            Crypto Markets
          </h1>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl">
            Trade 200+ cryptocurrencies with deep liquidity, tight spreads, 
            and 24/7 market access across all major trading pairs.
          </p>
        </div>

        <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8 mt-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <LivePriceDisplay />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2 glass rounded-xl p-6 animate-card-3d animate-card-3d-delay-1 glass-hover"
          >
            <h3 className="text-2xl font-bold mb-6 text-gradient">Market Features</h3>
            <div className="space-y-6">
              {[
                {
                  icon: Zap,
                  title: "Instant Trading",
                  description: "Execute trades instantly with our advanced matching engine"
                },
                {
                  icon: Globe,
                  title: "Global Markets",
                  description: "Access worldwide crypto markets with 24/7 trading"
                },
                {
                  icon: TrendingUp,
                  title: "Market Analysis",
                  description: "Advanced charts and technical analysis tools"
                }
              ].map((feature, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <feature.icon className="w-8 h-8 text-gradient mt-1" />
                  <div>
                    <h4 className="font-bold text-gradient-secondary">{feature.title}</h4>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-16"
        >
          <Button size="lg" className="button-gradient" enableGlitch={true}>
            Explore All Markets
          </Button>
        </motion.div>
      </motion.section>

      <Footer />
    </div>
  );
};

export default Markets;