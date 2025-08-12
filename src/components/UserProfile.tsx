import { motion } from 'framer-motion';
import { User, Mail, Calendar, Shield, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export const UserProfile = () => {
  const { user, signOut } = useAuth();

  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="container px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gradient mb-4 animate-hero-3d">
            Welcome to your Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage your account and start trading
          </p>
        </div>

        <Card className="glass animate-card-3d">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gradient">
              <User className="w-5 h-5" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Your account details and settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 glass rounded-lg">
              <Mail className="w-5 h-5 text-gradient" />
              <div>
                <p className="font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 glass rounded-lg">
              <Calendar className="w-5 h-5 text-gradient" />
              <div>
                <p className="font-medium">Member Since</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 glass rounded-lg">
              <Shield className="w-5 h-5 text-gradient" />
              <div>
                <p className="font-medium">Account Status</p>
                <p className="text-sm text-secondary">Verified</p>
              </div>
            </div>

            <div className="pt-4 border-t border-primary/20">
              <div className="flex gap-4">
                <Button 
                  onClick={() => window.location.href = '/dashboard'}
                  className="flex-1 button-gradient"
                >
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button 
                  onClick={handleSignOut}
                  variant="outline" 
                  className="glass"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};