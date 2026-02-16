import { supabase } from "../lib/supabase";

export interface Evento {
  id: string;
  title: string;
  type: 'ensaio' | 'concerto' | 'apresentacao' | 'extra';
  date: string;
  location: string;
  description?: string;
  my_status?: 'confirmado' | 'ausente' | null;
}

export interface Aviso {
  id: string;
  title: string;
  content: string;
  priority: 'normal' | 'alta';
  created_at: string;
}

class AgendaService {

  async getProximosEventos(userId: string) {
    // 1. Pega eventos futuros
    const { data: eventos, error } = await supabase
      .from('events')
      .select('*')
      .gte('date', new Date().toISOString())
      .order('date', { ascending: true });

    if (error) return [];

    const { data: presencas } = await supabase
      .from('event_attendance')
      .select('event_id, status')
      .eq('user_id', userId)
      .in('event_id', eventos.map(e => e.id));

    return eventos.map(evento => {
      const presenca = presencas?.find(p => p.event_id === evento.id);
      return {
        ...evento,
        my_status: presenca ? presenca.status : null
      };
    });
  }

  async confirmarPresenca(eventId: string, userId: string, status: 'confirmado' | 'ausente') {
    const { error } = await supabase
      .from('event_attendance')
      .upsert({ 
        event_id: eventId, 
        user_id: userId, 
        status: status 
      }, { onConflict: 'event_id, user_id' });

    if (error) throw error;
  }


  async getAvisos() {
    const { data, error } = await supabase
      .from('notices')
      .select('*')
      .order('created_at', { ascending: false });
    return error ? [] : (data as Aviso[]);
  }
}

export const agendaService = new AgendaService();