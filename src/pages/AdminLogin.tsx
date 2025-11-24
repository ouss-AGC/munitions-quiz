import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Lock, User, AlertCircle } from 'lucide-react';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [error, setError] = useState('');
  const [, setLocation] = useLocation();
  const { login, isLocked, loginAttempts } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLocked) {
      setError('Compte verrouillé. Veuillez réessayer dans 15 minutes.');
      return;
    }

    const success = await login(username, password, showTwoFactor ? twoFactorToken : undefined);

    if (success) {
      setLocation('/admin');
    } else {
      if (showTwoFactor) {
        setError('Code 2FA invalide');
      } else {
        // Check if 2FA is needed
        const storedUser = localStorage.getItem('agc-admin-user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          if (userData.username === username && userData.twoFactorEnabled) {
            setShowTwoFactor(true);
            setError('');
            return;
          }
        }
        setError('Identifiants invalides');
      }
    }
  };

  const remainingAttempts = 3 - loginAttempts;

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: 'url(/academy-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute inset-0 bg-black/50" />
      
      <Card className="w-full max-w-md relative z-10 shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Shield className="h-12 w-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Accès Administrateur</CardTitle>
          <CardDescription>
            Connexion sécurisée au panneau d'administration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!showTwoFactor ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="username">Nom d'utilisateur</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="admin"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10"
                      required
                      disabled={isLocked}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                      disabled={isLocked}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="twoFactor">Code d'authentification à deux facteurs</Label>
                <Input
                  id="twoFactor"
                  type="text"
                  placeholder="000000"
                  value={twoFactorToken}
                  onChange={(e) => setTwoFactorToken(e.target.value)}
                  maxLength={6}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Entrez le code à 6 chiffres de votre application d'authentification
                </p>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isLocked && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Compte verrouillé suite à plusieurs tentatives échouées. Veuillez réessayer dans 15 minutes.
                </AlertDescription>
              </Alert>
            )}

            {!isLocked && loginAttempts > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {remainingAttempts} tentative{remainingAttempts > 1 ? 's' : ''} restante{remainingAttempts > 1 ? 's' : ''}
                </AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={isLocked}
            >
              {showTwoFactor ? 'Vérifier le code' : 'Se connecter'}
            </Button>

            {showTwoFactor && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setShowTwoFactor(false);
                  setTwoFactorToken('');
                  setError('');
                }}
              >
                Retour
              </Button>
            )}
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Identifiants par défaut :</p>
            <p className="font-mono">admin / Munitions2025</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
