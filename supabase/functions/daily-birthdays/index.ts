import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const messages = [
  "Hoje o dia é de festa! Feliz aniversário, {nome}! 🎻🎂",
  "Mais um ano de vida e de muita música! Parabéns, {nome}! 🎵🎉",
  "Desejamos muita harmonia no seu novo ano, {nome}! 🥳🎼",
  "Hoje os aplausos são todos para você! Feliz aniversário, {nome}! 👏🎂",
  "Que a vida continue tocando uma bela melodia para você, {nome}! 🎶🎁"
]

serve(async () => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )
    
    const hoje = new Date().toISOString().slice(5, 10) 
    
    const { data: aniversariantes, error: birthError } = await supabase
      .from('profiles')
      .select('id, nickname, push_token')
      .filter('birth_date', 'like', `%${hoje}%`)

    if (birthError) throw birthError

    if (!aniversariantes || aniversariantes.length === 0) {
      return new Response("Nenhum aniversariante hoje.", { status: 200 })
    }

    const { data: todos } = await supabase
      .from('profiles')
      .select('push_token')
      .not('push_token', 'is', null)
    
    const tokensGerais = todos?.map(m => m.push_token).filter(t => t !== null) || []

    for (const musico of aniversariantes) {
      const msgAleatoria = messages[Math.floor(Math.random() * messages.length)].replace('{nome}', musico.nickname)
      
      if (musico.push_token) {
        await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-push`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}` 
          },
          body: JSON.stringify({ 
            tokens: [musico.push_token], 
            title: "Parabéns!", 
            body: msgAleatoria 
          })
        })
      }

      const tokensOrquestra = tokensGerais.filter(t => t !== musico.push_token)
      if (tokensOrquestra.length > 0) {
        await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-push`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}` 
          },
          body: JSON.stringify({ 
            tokens: tokensOrquestra, 
            title: "Aniversariante do Dia! 🎂", 
            body: `Hoje é o aniversário de ${musico.nickname}! Deixe seus parabéns!` 
          })
        })
      }
    }

    return new Response("Notificações processadas.", { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})