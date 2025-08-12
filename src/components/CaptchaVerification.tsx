import { motion } from "framer-motion";
import { useState } from "react";
import { Shield, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface CaptchaVerificationProps {
  onVerified: () => void;
}

const CaptchaVerification = ({ onVerified }: CaptchaVerificationProps) => {
  const [isChecked, setIsChecked] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const handleVerify = async () => {
    if (!isChecked) return;
    
    setIsVerifying(true);
    
    // Simulate verification process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsVerifying(false);
    setIsVerified(true);
    
    // Complete verification after animation
    setTimeout(onVerified, 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'var(--gradient-background)' }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass rounded-2xl p-8 max-w-md w-full text-center animate-card-3d"
      >
        <motion.div
          animate={isVerifying ? { rotate: 360 } : {}}
          transition={{ duration: 2, repeat: isVerifying ? Infinity : 0, ease: "linear" }}
        >
          <Shield className="w-16 h-16 text-gradient mx-auto mb-6" />
        </motion.div>

        <h2 className="text-2xl font-bold text-gradient mb-4">
          Security Verification
        </h2>
        
        <p className="text-muted-foreground mb-8">
          We need to verify you're not a robot to protect our platform from automated attacks.
        </p>

        {!isVerified ? (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 1 }}
            animate={{ opacity: isVerifying ? 0.5 : 1 }}
          >
            <div className="glass rounded-lg p-4 border border-primary/30">
              <div className="flex items-center space-x-3">
                <Checkbox 
                  id="captcha"
                  checked={isChecked}
                  onCheckedChange={(checked) => setIsChecked(checked === true)}
                  disabled={isVerifying}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <label htmlFor="captcha" className="text-sm font-medium">
                  I'm not a robot
                </label>
                <div className="ml-auto">
                  <div className="w-8 h-8 bg-primary/20 rounded border flex items-center justify-center">
                    <div className="w-4 h-4 bg-primary rounded-sm"></div>
                  </div>
                </div>
              </div>
              
              {isVerifying && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-4 pt-4 border-t border-primary/20"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="w-2 h-2 bg-primary rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                      className="w-2 h-2 bg-primary rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                      className="w-2 h-2 bg-primary rounded-full"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Verifying your request...
                  </p>
                </motion.div>
              )}
            </div>

            <Button
              onClick={handleVerify}
              disabled={!isChecked || isVerifying}
              className="w-full button-gradient"
            >
              {isVerifying ? "Verifying..." : "Verify & Continue"}
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-4"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.5 }}
            >
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            </motion.div>
            <h3 className="text-xl font-bold text-green-500">Verification Successful!</h3>
            <p className="text-muted-foreground">
              Welcome to CryptoTrade. Redirecting you now...
            </p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default CaptchaVerification;