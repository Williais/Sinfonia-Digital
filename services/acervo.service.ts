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
          audioPath: musica.audioPath,
          partiturasPaths: musica.partiturasPaths,
          audioUrl: audioUrl,
          partiturasUrls: partiturasUrls,
        } as Musica;
      });
    } catch (error) {
      console.error('Erro getAllMusicas:', error);
      return [];
    }
  }

  async getMusicaById(id: string) {
    const musicas = await this.getAllMusicas();
    return musicas.find(m => String(m.id) === String(id)) || null;
  }

  async deleteMusica(id: string, audioPath?: string, partiturasPaths?: Record<string, string>) {
    try {
        console.log(`[DELETE] Excluindo música ID: ${id}`);

        let pathsToDelete: string[] = [];
        if (audioPath) pathsToDelete.push(audioPath);
        if (partiturasPaths) {
            pathsToDelete = [...pathsToDelete, ...Object.values(partiturasPaths)];
        }
        
        if (pathsToDelete.length > 0) {
            console.log(`[DELETE] Apagando ${pathsToDelete.length} arquivos do storage...`);
            const { error: storageError } = await supabaseAcervo.storage.from('arquivos').remove(pathsToDelete);
            if (storageError) console.warn("Erro ao apagar arquivos:", storageError);
        }

        // 2. Apaga do Banco de Dados
        const { error: dbError } = await supabaseAcervo.from('musicas').delete().eq('id', id);
        if (dbError) throw dbError;

        console.log("[DELETE] Concluído!");
    } catch (error) {
        console.error("[DELETE ERRO]:", error);
        throw error;
    }
  }

  async uploadFileToStorage(uri: string, path: string, type: string) {
    try {
      console.log(`[UPLOAD] Iniciando upload via FormData... Path: ${path}`);

      const formData = new FormData();
      formData.append('file', {
        uri: uri,
        name: path.split('/').pop() || 'upload_file',
        type: type,
      } as any);

      const { data, error } = await supabaseAcervo.storage
        .from('arquivos')
        .upload(path, formData, {
           upsert: true
        });

      if (error) {
        console.error("[UPLOAD ERRO SUPABASE]:", error);
        throw error;
      }
      
      console.log(`[UPLOAD SUCESSO]: ${path}`);
      return path;
    } catch (error) {
      console.error("[UPLOAD ERRO FATAL]:", error);
      throw error;
    }
  }

  async addMusica(
    dados: { title: string, arranger: string },
    audioFile: any,
    pdfFiles: any[]
  ) {
    try {
      console.log("[ADD MUSICA] Iniciando...");
      const sanitizedTitle = slugify(dados.title);
      let audioPath = null;
      let partiturasPaths: Record<string, string> = {};

      if (audioFile) {
        const fileName = audioFile.name || `audio-${Date.now()}.mp3`;
        const path = `audio/${Date.now()}_${slugify(fileName)}`;
        await this.uploadFileToStorage(audioFile.uri, path, audioFile.mimeType || 'audio/mpeg');
        audioPath = path;
      }

      if (pdfFiles && pdfFiles.length > 0) {
        for (const file of pdfFiles) {
          const fileName = file.name || `partitura-${Date.now()}.pdf`;
          const instrumento = fileName.replace(/\.pdf$/i, '').trim();
          const path = `partituras/${sanitizedTitle}/${slugify(fileName)}`;

          await this.uploadFileToStorage(file.uri, path, file.mimeType || 'application/pdf');
          partiturasPaths[instrumento] = path;
        }
      }

      const { error } = await supabaseAcervo
        .from('musicas')
        .insert({
          title: dados.title,
          arranger: dados.arranger,
          audioPath: audioPath,
          partiturasPaths: partiturasPaths
        });

      if (error) throw error;
      console.log("[ADD MUSICA] Concluído!");
    } catch (error) {
      console.error("[ADD MUSICA ERRO]:", error);
      throw error;
    }
  }
}

export const acervoService = new AcervoService();