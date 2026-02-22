import * as Linking from 'expo-linking';
import { supabase } from "../lib/supabase";

class AuthService{

    async loginGoogle(){
        try{
            const redirectUrl = Linking.createURL("");

            const {data, error} = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                redirectTo: redirectUrl,
                skipBrowserRedirect: true,
                },
            })

            if(error) throw error

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

              const params = url.split("#")[1] || url.split("?")[1];

              if (!params) return;
              const searchParams = new URLSearchParams(params);
              const access_token = searchParams.get("access_token");
              const refresh_token = searchParams.get("refresh_token");

              if (access_token && refresh_token) {
                const { error } = await supabase.auth.setSession({
                  access_token,
                  refresh_token,
                });
                if (error) throw error;
                return true;
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