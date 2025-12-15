import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import Logo from '../components/Logo';
import authImage from '../assets/images/autenticacao/image-entrar-registrar.svg';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isErrorVisible, setIsErrorVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (error) {
      // Resetar visibilidade e depois mostrar o erro com animação
      setIsErrorVisible(false);
      const timer = setTimeout(() => setIsErrorVisible(true), 50);
      return () => clearTimeout(timer);
    } else {
      // Iniciar animação de fade-out antes de remover
      setIsErrorVisible(false);
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Não limpar o erro antes - deixar que o novo erro substitua o anterior

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Credenciais inválidas. Verifique seu email e senha.';
      setError(errorMessage);
      setLoading(false);
      // Não navegar em caso de erro, manter o usuário na página de login
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="hidden lg:flex items-center justify-center">
          <img src={authImage} alt="Login" className="max-w-full h-auto" />
        </div>
        <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <Logo showText />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Entrar</CardTitle>
          <CardDescription className="text-center">Entre com sua conta para continuar</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div 
                className={`bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded transition-all duration-300 overflow-hidden ${
                  isErrorVisible 
                    ? 'opacity-100 max-h-32 animate-in fade-in' 
                    : 'opacity-0 max-h-0 py-0 border-0 animate-out fade-out'
                }`}
                onAnimationEnd={() => {
                  if (!isErrorVisible) {
                    setError('');
                  }
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  // Iniciar animação de fade-out quando o usuário começar a digitar
                  if (error) setIsErrorVisible(false);
                }}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  // Iniciar animação de fade-out quando o usuário começar a digitar
                  if (error) setIsErrorVisible(false);
                }}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
            <div className="text-center text-sm">
              <span className="text-gray-600">Não tem uma conta? </span>
              <Link to="/register" className="text-primary hover:text-primary/70 transition-colors">
                Criar conta
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}

