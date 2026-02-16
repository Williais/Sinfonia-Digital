import { supabaseAcervo } from "../lib/supabase-acervo";

export interface Musica {
  id: number;
  title: string;
  arranger: string;
  audioPath?: string;
  partiturasPaths?: Record<string, string>; 

  audioUrl?: string; 
  partiturasUrls?: Record<string, string>; 
}

class AcervoService {

  async getAllMusicas() {
    try {

      const { data, error } = await supabaseAcervo
        .from('musicas')
        .select('*')
        .order('title', { ascending: true });

      if (error) throw error;

      if (!data) return [];

      const musicasFormatadas = data.map((musica: any) => {

        let audioUrl = undefined;
        if (musica.audioPath) {
          const { data: audioData } = supabaseAcervo.storage
            .from('arquivos')
            .getPublicUrl(musica.audioPath);
          audioUrl = audioData.publicUrl;
        }

        let partiturasUrls: Record<string, string> = {};

        if (musica.partiturasPaths && typeof musica.partiturasPaths === 'object') {
          Object.keys(musica.partiturasPaths).forEach((instrumento) => {
            const path = musica.partiturasPaths[instrumento];
            
            const { data: pdfData } = supabaseAcervo.storage
              .from('arquivos')
              .getPublicUrl(path);
              
            partiturasUrls[instrumento] = pdfData.publicUrl;
          });
        }

        return {
          id: musica.id,
          title: musica.title,
          arranger: musica.arranger,
          audioPath: musica.audioPath,
          partiturasPaths: musica.partiturasPaths,
          audioUrl: audioUrl,
          partiturasUrls: partiturasUrls
        } as Musica;
      });

      return musicasFormatadas;

    } catch (error) {
      console.log("🔥 ERRO DETALHADO NO SERVICE 🔥");
      console.log(error);
      return [];
    }
  }
}
export const acervoService = new AcervoService();