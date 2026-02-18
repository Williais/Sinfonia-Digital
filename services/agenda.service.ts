import { supabase } from "../lib/supabase";

export interface Evento {
  id: string;
  title: string;
  type: 'ensaio' | 'concerto' | 'apresentacao' | 'extra';
  date: string;
  location: string;
  description?: string;
  status: 'ativo' | 'cancelado' | 'adiado';
  my_status?: 'confirmado' | 'ausente' | null;
}

export interface Aviso {
  id: string;
  title: string;
  content: string;
  priority: 'baixa' | 'media' | 'alta';
  created_at: string;
}

class AgendaService {
  
  async getProximosEventos(userId: string) {
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
        status: evento.status || 'ativo',
        my_status: presenca ? presenca.status : null
      };
    });
  }

  async createEvent(evento: Omit<Evento, 'id' | 'my_status'>) {
    const payload = { ...evento, status: 'ativo' };
    
    const { data, error } = await supabase
      .from('events')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateEvent(id: string, updates: Partial<Evento>) {
    const { error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  }

  async deleteEvent(id: string) {
    await supabase.from('event_attendance').delete().eq('event_id', id);
    
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async confirmarPresenca(eventId: string, userId: string, status: 'confirmado' | 'ausente') {
      const { error } = await supabase.from('event_attendance').upsert({ event_id: eventId, user_id: userId, status: status }, { onConflict: 'event_id, user_id' });
      if (error) throw error;
  }

  async getParticipantes(eventId: string) {
      const { data, error } = await supabase.from('event_attendance').select(`status, profiles:user_id (id, nickname, instrument, avatar_url)`).eq('event_id', eventId);
      if (error) return [];
      return data.map((item: any) => ({ id: item.profiles.id, name: item.profiles.nickname, instrument: item.profiles.instrument || 'Outro', avatar: item.profiles.avatar_url, status: item.status }));
  }

  async getAvisos() {
      const { data, error } = await supabase.from('notices').select('*').order('created_at', { ascending: false });
      return error ? [] : data;
  }
}

export const agendaService = new AgendaService();