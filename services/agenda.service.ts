import { supabase } from "../lib/supabase";

export interface Evento {
  id: string;
  title: string;
  type: 'ensaio' | 'concerto' | 'apresentacao' | 'extra';
  date: string;
  location: string;
  description?: string;
}

export interface Aviso {
  id: string;
  title: string;
  content: string;
  priority: 'normal' | 'alta';
  created_at: string;
}

class AgendaService {

  async getProximosEventos() {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte('date', new Date().toISOString())
      .order('date', { ascending: true });

    if (error) {
      console.log('Erro ao buscar eventos:', error);
      return [];
    }
    return data as Evento[];
  }

  async getAvisos() {
    const { data, error } = await supabase
      .from('notices')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.log('Erro ao buscar avisos:', error);
      return [];
    }
    return data as Aviso[];
  }
}

export const agendaService = new AgendaService();