import { supabase } from "../lib/supabase";

export interface UserProfile {
  id: string;
  nickname: string;
  full_name?: string;
  phone?: string;
  birth_date?: string;
  bio?: string;
  avatar_url: string;
  instrument: string;
  instagram?: string;
  instrument_ownership?: 'proprio' | 'cefec';
  role: string;
  is_spalla: boolean;
  is_section_leader: boolean;
}

class ProfileService {
  
  async getUserProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Não autenticado");

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return data as UserProfile;
  }

  async updateProfile(updates: Partial<UserProfile>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Não autenticado");

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) throw error;
  }

  async uploadAvatar(uri: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not found");

    const ext = uri.split('.').pop() || 'jpg';
    const fileName = `${user.id}/${Date.now()}.${ext}`;

    const formData = new FormData();
    formData.append('file', {
      uri: uri,
      name: `avatar.${ext}`,
      type: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
    } as any);

    const { error } = await supabase.storage
      .from('avatars')
      .upload(fileName, formData, {
        upsert: true
      });

    if (error) throw error;

    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    return data.publicUrl;
  }

  async getUserStats(userId?: string) {
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      userId = user.id;
    }

    const { data: stats, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    const { count: totalEventos } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .lt('date', new Date().toISOString());

    const { count: minhasPresencas } = await supabase
      .from('event_attendance')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'confirmado');
    
    const frequencia = totalEventos && totalEventos > 0 
      ? Math.round((minhasPresencas || 0) / totalEventos * 100) 
      : 100;

    return {
      ...(stats || { xp: 0, level: 1, concerts: 0, rehearsals: 0 }),
      frequencia
    };
  }

  async getRankingFrequencia() {
    const { data, error } = await supabase
      .from('event_attendance')
      .select('status, profiles(instrument)');

    if (error || !data || data.length === 0) {
      return [
        { id: 1, naipe: 'Violoncelos', score: '0%' },
        { id: 2, naipe: 'Violinos', score: '0%' },
        { id: 3, naipe: 'Metais', score: '0%' },
      ];
    }

    const stats: Record<string, { total: number, confirmados: number }> = {};

    data.forEach((row: any) => {
      if (!row.profiles) return;
      const naipe = row.profiles.instrument || 'Outros';
      if (!stats[naipe]) stats[naipe] = { total: 0, confirmados: 0 };
      stats[naipe].total += 1;
      if (row.status === 'confirmado') stats[naipe].confirmados += 1;
    });

    const ranking = Object.keys(stats).map((naipe, index) => {
      const perc = Math.round((stats[naipe].confirmados / stats[naipe].total) * 100);
      return { id: index, naipe, score: `${perc}%`, rawScore: perc };
    });

    return ranking.sort((a, b) => b.rawScore - a.rawScore).slice(0, 3);
  }
}

export const profileService = new ProfileService();