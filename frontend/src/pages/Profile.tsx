import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: user?.email || '',
    phone: user?.phone || '',
    whatsappMessages: {
      confirm: user?.whatsappMessages?.confirm || '',
      reschedule: user?.whatsappMessages?.reschedule || '',
      cancel: user?.whatsappMessages?.cancel || '',
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.put('/users/me', formData);
      updateUser(response.data);
      alert('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      alert('Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const currentPassword = (form.elements.namedItem('currentPassword') as HTMLInputElement).value;
    const newPassword = (form.elements.namedItem('newPassword') as HTMLInputElement).value;

    setLoading(true);
    try {
      await api.put('/users/me/password', { currentPassword, newPassword });
      alert('Senha alterada com sucesso!');
      form.reset();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Meu Perfil</h1>
        <p className="text-gray-600">Gerencie suas informações pessoais</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
          <CardDescription>Atualize seus dados de contato</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
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
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alterar Senha</CardTitle>
          <CardDescription>Digite sua senha atual e a nova senha</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Senha Atual</Label>
              <Input id="currentPassword" type="password" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova Senha</Label>
              <Input id="newPassword" type="password" required minLength={6} />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? 'Alterando...' : 'Alterar Senha'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mensagens Padrão WhatsApp</CardTitle>
          <CardDescription>Configure as mensagens que serão enviadas automaticamente</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="confirm">Mensagem de Confirmação</Label>
              <Textarea
                id="confirm"
                value={formData.whatsappMessages.confirm}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    whatsappMessages: { ...formData.whatsappMessages, confirm: e.target.value },
                  })
                }
                placeholder="Olá! Confirmo seu agendamento para {date} às {time}."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reschedule">Mensagem de Remarcação</Label>
              <Textarea
                id="reschedule"
                value={formData.whatsappMessages.reschedule}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    whatsappMessages: { ...formData.whatsappMessages, reschedule: e.target.value },
                  })
                }
                placeholder="Olá! Preciso remarcar seu agendamento. Podemos reagendar?"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cancel">Mensagem de Cancelamento</Label>
              <Textarea
                id="cancel"
                value={formData.whatsappMessages.cancel}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    whatsappMessages: { ...formData.whatsappMessages, cancel: e.target.value },
                  })
                }
                placeholder="Olá! Infelizmente preciso cancelar seu agendamento. Podemos reagendar?"
                rows={3}
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Mensagens'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

