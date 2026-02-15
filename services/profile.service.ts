import { supabase } from "../lib/supabase"

class ProfileService{

    async getUserProfile(){
        try{
            const {data: {user}} = await supabase.auth.getUser()

            if (!user) return null

            const {data, error} = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

                if (error) throw error

                return data

        }catch(e){
            console.log("Erro ao buscar perfil:", e);
            return null
        }
    }
}

export const profileService = new ProfileService()