import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const { tokens, title, body, data } = await req.json()

  const messages = tokens.map((token: string) => ({
    to: token,
    sound: 'default',
    title,
    body,
    data,
    priority: 'high'
  }))

  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(messages),
  })

  const result = await response.json()
  return new Response(JSON.stringify(result), { headers: { "Content-Type": "application/json" } })
})