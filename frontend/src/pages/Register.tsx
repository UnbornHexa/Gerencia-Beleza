import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select } from '../components/ui/select';
import Logo from '../components/Logo';
import authImage from '../assets/images/autenticacao/image-entrar-registrar.svg';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isErrorVisible, setIsErrorVisible] = useState(false);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    phone: '',
    address: {
      cep: '',
      state: '',
      city: '',
      street: '',
      number: '',
      complement: '',
    },
  });

  const fetchStates = async () => {
    try {
      const response = await api.get('/external-apis/states');
      setStates(response.data);
    } catch (error) {
      console.error('Erro ao buscar estados:', error);
    }
  };

  const fetchCities = async (stateId: string) => {
    try {
      const response = await api.get(`/external-apis/cities/${stateId}`);
      setCities(response.data);
    } catch (error) {
      console.error('Erro ao buscar cidades:', error);
    }
  };

  const fetchAddressByCep = async (cep: string) => {
    if (cep.length === 8) {
      try {
        const response = await api.get(`/external-apis/cep/${cep}`);
        const data = response.data;
        setFormData((prev) => ({
          ...prev,
          address: {
            ...prev.address,
            street: data.street || prev.address.street,
            city: data.city || prev.address.city,
            state: data.state || prev.address.state,
          },
        }));
        if (data.state && states.length > 0) {
          const state = states.find((s) => s.sigla === data.state);
          if (state) {
            await fetchCities(state.id);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      }
    }
  };

  useEffect(() => {
    fetchStates();
  }, []);

  useEffect(() => {
    if (error && error.trim() !== '') {
      // Mostrar o erro imediatamente quando ele é definido
      setIsErrorVisible(true);
    } else if (!error) {
      // Iniciar animação de fade-out antes de remover
      setIsErrorVisible(false);
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (loading) return; // Prevenir múltiplos submits
    
    setLoading(true);
    setError(''); // Limpar erro anterior

    try {
      await register(formData);
      // Só navegar se o registro for bem-sucedido
      navigate('/');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao criar conta. Verifique os dados informados.';
      setLoading(false);
      setError(errorMessage);
      // Não navegar em caso de erro, manter o usuário na página de registro
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="hidden lg:flex items-center justify-center">
          <img src={authImage} alt="Registro" className="max-w-full h-auto" />
        </div>
        <Card className="w-full">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <Logo showText />
            </div>
            <CardTitle className="text-2xl font-bold text-center">Criar Conta</CardTitle>
            <CardDescription className="text-center">Preencha os dados para criar sua conta</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {error && (
                <div 
                  className={`bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded transition-all duration-300 overflow-hidden ${
                    isErrorVisible 
                      ? 'opacity-100 max-h-32' 
                      : 'opacity-0 max-h-0 py-0 border-0'
                  }`}
                  onTransitionEnd={() => {
                    if (!isErrorVisible && error) {
                      setError('');
                    }
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{error}</span>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(00) 00000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    id="cep"
                    type="text"
                    placeholder="00000-000"
                    value={formData.address.cep}
                    onChange={(e) => {
                      const cep = e.target.value.replace(/\D/g, '');
                      setFormData({
                        ...formData,
                        address: { ...formData.address, cep },
                      });
                      if (cep.length === 8) {
                        fetchAddressByCep(cep);
                      }
                    }}
                    maxLength={8}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Estado</Label>
                  <Select
                    id="state"
                    value={states.find((s) => s.sigla === formData.address.state)?.id || ''}
                    onChange={(e) => {
                      const stateId = e.target.value;
                      const state = states.find((s) => s.id === stateId);
                      setFormData({
                        ...formData,
                        address: { ...formData.address, state: state?.sigla || '', city: '' },
                      });
                      if (stateId) {
                        fetchCities(stateId);
                      }
                    }}
                    required
                  >
                    <option value="">Selecione o estado</option>
                    {states.map((state) => (
                      <option key={state.id} value={state.id}>
                        {state.nome}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Select
                    id="city"
                    value={formData.address.city}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, city: e.target.value },
                      })
                    }
                    required
                  >
                    <option value="">Selecione a cidade</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.nome}>
                        {city.nome}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="street">Rua</Label>
                  <Input
                    id="street"
                    type="text"
                    placeholder="Nome da rua"
                    value={formData.address.street}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, street: e.target.value },
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="number">Número</Label>
                  <Input
                    id="number"
                    type="text"
                    placeholder="123"
                    value={formData.address.number}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, number: e.target.value },
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="complement">Complemento</Label>
                  <Input
                    id="complement"
                    type="text"
                    placeholder="Apto, Bloco, etc"
                    value={formData.address.complement}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, complement: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Criando conta...' : 'Criar Conta'}
              </Button>
              <div className="text-center text-sm">
                <span className="text-gray-600">Já tem uma conta? </span>
                <Link to="/login" className="text-primary hover:text-primary/70 transition-colors">
                  Fazer login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
