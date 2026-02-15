import { supabase } from "../lib/supabase";
import * as Linking from 'expo-linking';

class AuthService{
    //vou criar o metodo que fará o usuario ir para o Google

    async loginGoogle(){

        try{
            const redirectUrl = Linking.createURL("/google-auth");

            // pedindo pro Supabase o link do Google
            const {data, error} = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                redirectTo: redirectUrl,
                skipBrowserRedirect: true,
                },
            })

            if(error) throw error

            // retornando os dados para a tela. 
            return {
                url: data?.url,
                redirectUrl: redirectUrl
            }
        }
        catch (error) {
            throw error
        }
    }

    async criarSessao(url:string){
        try {
                // aq ele vai pegar o que vem depois do # ou ?
              const params = url.split("#")[1] || url.split("?")[1];

              if (!params) return; //se não tiver parametros, falhou
        
              //transformando em dados úteis
              const searchParams = new URLSearchParams(params);
              const access_token = searchParams.get("access_token");
              const refresh_token = searchParams.get("refresh_token");
        
              // achando os tokens, ele vai entregar pro Supabase
              if (access_token && refresh_token) {
                const { error } = await supabase.auth.setSession({
                  access_token,
                  refresh_token,
                });
                if (error) throw error;
                return true; // criou a sessão
              }
            } catch (error) {
              console.log("Erro ao processar URL:", error);
              return false;
            }
            return false;
    }

    async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

}

// instanciando meu obj
export const authService = new AuthService()