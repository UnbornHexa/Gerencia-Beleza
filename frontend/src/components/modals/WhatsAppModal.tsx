import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '../ui/dialog';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { ExternalLink } from 'lucide-react';

interface WhatsAppModalProps {
  open: boolean;
  onClose: () => void;
  phone: string;
  message: string;
  appointment?: any;
}

export default function WhatsAppModal({ open, onClose, phone, message, appointment }: WhatsAppModalProps) {
  const [editedMessage, setEditedMessage] = useState(message);
  const [whatsappLink, setWhatsappLink] = useState('');

  useEffect(() => {
    if (open && phone) {
      generateWhatsAppLink();
    }
  }, [open, phone, editedMessage]);

  const generateWhatsAppLink = async () => {
    try {
      const response = await api.post('/external-apis/whatsapp/generate-link', {
        phone,
        message: editedMessage,
      });
      setWhatsappLink(response.data.link);
    } catch (error) {
      console.error('Erro ao gerar link do WhatsApp:', error);
      // Fallback: criar link manualmente
      const cleanPhone = phone.replace(/\D/g, '');
      const encodedMessage = encodeURIComponent(editedMessage);
      setWhatsappLink(`https://wa.me/${cleanPhone}?text=${encodedMessage}`);
    }
  };

  const handleOpenWhatsApp = () => {
    if (whatsappLink) {
      window.open(whatsappLink, '_blank');
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogClose onClose={onClose} />
        <DialogHeader>
          <DialogTitle>Enviar Mensagem WhatsApp</DialogTitle>
          <DialogDescription>
            Edite a mensagem antes de enviar para {phone}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {appointment && (
            <div className="p-3 bg-gray-50 rounded-md text-sm">
              <p className="font-medium">Agendamento:</p>
              <p>Cliente: {(appointment.clientId as any)?.name}</p>
              <p>Data: {new Date(appointment.date).toLocaleDateString('pt-BR')}</p>
              <p>Horário: {appointment.startTime}</p>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="message">Mensagem</Label>
            <Textarea
              id="message"
              value={editedMessage}
              onChange={(e) => setEditedMessage(e.target.value)}
              rows={6}
              placeholder="Digite sua mensagem..."
            />
          </div>
          <div className="text-xs text-gray-500">
            <p>Variáveis disponíveis: {'{date}'}, {'{time}'}, {'{client}'}</p>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleOpenWhatsApp} disabled={!whatsappLink}>
            <ExternalLink className="w-4 h-4 mr-2" />
            Abrir WhatsApp
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

