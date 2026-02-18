import { supabaseAcervo } from "../lib/supabase-acervo";
import { File } from 'expo-file-system';

export interface Musica {
  id: number;
  title: string;
  arranger: string;
  composer: string;
  category: string;
  audioPath?: string;
  partiturasPaths?: Record<string, string>;
  audioUrl?: string;
  partiturasUrls?: Record<string, string>;
}

function slugify(text: string) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '').replace(/-+$/, '');
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

      return data.map((musica: any) => {
        let audioUrl = undefined;
        if (musica.audioPath) {
          const { data: audioData } = supabaseAcervo.storage.from('arquivos').getPublicUrl(musica.audioPath);
          audioUrl = audioData.publicUrl;
        }

        let partiturasUrls: Record<string, string> = {};
        if (musica.partiturasPaths && typeof musica.partiturasPaths === 'object') {
          Object.keys(musica.partiturasPaths).forEach((instrumento) => {
            const path = musica.partiturasPaths[instrumento];
            const { data: pdfData } = supabaseAcervo.storage.from('arquivos').getPublicUrl(path);
            partiturasUrls[instrumento] = pdfData.publicUrl;
          });
        }

        return {
          id: musica.id,
          title: musica.title,
          arranger: musica.arranger,
          composer: musica.composer || 'Desconhecido',
          category: musica.category || 'popular',
          audioPath: musica.audioPath,
          partiturasPaths: musica.partiturasPaths,
          audioUrl: audioUrl,
          partiturasUrls: partiturasUrls,
        } as Musica;
      });
    } catch (error) {
      console.log('Erro ao buscar:', error);
      return [];
    }
  }

  async getMusicaById(id: string) {
    const musicas = await this.getAllMusicas();
    return musicas.find(m => String(m.id) === String(id)) || null;
  }

  async uploadFileToStorage(uri: string, path: string, type: string) {
    try {
      const file = new File(uri);
      const bytes = await file.bytes();

      const { error } = await supabaseAcervo.storage
        .from('arquivos')
        .upload(path, bytes, {
          contentType: type,
          upsert: true
        });

      if (error) {
        console.error("Erro detalhado do Supabase Storage:", error);
        throw error;
      }
      return path;
    } catch (error) {
      console.error("Erro no upload:", error);
      throw error;
    }
  }

  async addMusica(
    dados: { title: string, composer: string, arranger: string, category: string },
    audioFile: any,
    pdfFiles: any[]
  ) {
    const sanitizedTitle = slugify(dados.title);
    let audioPath = null;
    let partiturasPaths: Record<string, string> = {};

    if (audioFile) {
      const fileName = audioFile.name || `audio-${Date.now()}.mp3`;
      const path = `audio/${Date.now()}_${slugify(fileName)}`;
      await this.uploadFileToStorage(audioFile.uri, path, 'audio/mpeg');
      audioPath = path;
    }

    if (pdfFiles && pdfFiles.length > 0) {
      for (const file of pdfFiles) {
        const fileName = file.name || `partitura-${Date.now()}.pdf`;
        const instrumento = fileName.replace(/\.pdf$/i, '').trim();
        const path = `partituras/${sanitizedTitle}/${slugify(fileName)}`;

        await this.uploadFileToStorage(file.uri, path, 'application/pdf');
        partiturasPaths[instrumento] = path;
      }
    }

    const { error } = await supabaseAcervo
      .from('musicas')
      .insert({
        title: dados.title,
        composer: dados.composer,
        arranger: dados.arranger,
        category: dados.category,
        audioPath: audioPath,
        partiturasPaths: partiturasPaths
      });

    if (error) throw error;
  }
}

export const acervoService = new AcervoService();