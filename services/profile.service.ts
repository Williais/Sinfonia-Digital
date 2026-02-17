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

    const response = await fetch(uri);
    const blob = await response.blob();

    const fileName = `${user.id}/${Date.now()}.jpg`;

    const { error } = await supabase.storage
      .from('avatars')
      .upload(fileName, blob, {
        contentType: 'image/jpeg',
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

    if (error) return { xp: 0, level: 1, concerts: 0, rehearsals: 0, frequencia: 0 };

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
      ...stats,
      frequencia
    };
  }
}

export const profileService = new ProfileService();