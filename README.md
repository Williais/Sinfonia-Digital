# 🎻 Sinfonia Digital | Orquestra Filarmônica do CEFEC

Um ecossistema móvel completo desenvolvido para modernizar, organizar e gamificar a gestão da **Orquestra Filarmônica do CEFEC**. 

Este aplicativo foi projetado para atender às necessidades de todos os membros da orquestra, desde os músicos instrumentistas até o Maestro e a administração, centralizando partituras, ensaios, comunicados e engajamento em uma única plataforma.

---

## 📖 Sobre o Projeto

Gerenciar uma orquestra exige sincronia perfeita não apenas na música, mas também na logística. O **Sinfonia Digital** nasce para substituir o uso de papéis físicos, planilhas descentralizadas e grupos de mensagens caóticos. 

O aplicativo atua em quatro frentes principais:
1. **Democratização do Acesso ao Repertório:** Um acervo digital na palma da mão.
2. **Organização Logística:** Agenda clara de ensaios e concertos com confirmação de presença.
3. **Gestão de Frequência Inteligente:** Chamada rápida para a diretoria, gerando dados precisos.
4. **Engajamento e Gamificação:** Sistema de níveis (XP), selos e ranking entre os naipes para incentivar a assiduidade dos músicos.

---

## ✨ Principais Funcionalidades

### 📚 Acervo Digital (Biblioteca Musical)
- **Acesso ao Repertório:** Partituras em PDF divididas por instrumentos (Cordas, Sopros, Percussão) e áudios de referência em MP3.
- **Upload Descomplicado:** Sistema de upload nativo via `FormData` direto para a nuvem, suportando envio múltiplo de PDFs e áudios simultaneamente.
- **Busca Rápida:** Filtros por categoria, nome da obra ou arranjador.
- **Player Integrado:** Reprodutor de áudio nativo na tela de detalhes da obra para estudo do músico.

### 📅 Agenda e Eventos
- **Eventos Detalhados:** Cadastro de Ensaios, Apresentações e Concertos com data, hora, local e descrições.
- **Status em Tempo Real:** Sinalização visual imediata caso um evento seja **Adiado** (com reagendamento automático) ou **Cancelado**.
- **RSVP do Músico:** Confirmação de presença rápida ("Vou" / "Não Vou") para auxiliar na montagem do palco.

### ✅ Gestão de Frequência (Chamada por Exceção)
- **Agilidade para o Maestro/Spalla:** Tela dedicada onde todos os músicos confirmados já aparecem como "Presentes" por padrão. O gestor apenas marca quem faltou (exceção), salvando tudo em massa (*Bulk Upsert*).
- **Ranking Dinâmico:** Cálculo automático em tempo real na tela inicial, mostrando quais naipes (ex: Violoncelos vs. Metais) têm a melhor taxa de frequência no mês.

### 📢 Mural de Avisos
- **Comunicação Direta:** Feed de comunicados oficiais da orquestra.
- **Níveis de Prioridade:** Avisos classificados como Baixa, Média ou Alta (urgente, destacado em vermelho na tela inicial do músico).

### 👤 Perfil e Gamificação
- **Identidade Musical:** Perfil personalizável com foto (Avatar), instrumento, tipo de posse (Próprio ou do CEFEC) e redes sociais.
- **Evolução de Nível:** O músico ganha XP ao participar de eventos, subindo de nível (Iniciante, Intermediário, Avançado, Virtuoso, Lenda).
- **Conquistas (Badges):** Exibição de selos e medalhas alcançadas pela assiduidade e dedicação à orquestra.

---

## 🔐 Perfis de Acesso (RBAC)

O sistema possui controle rigoroso de permissões com base no cargo (*Role*) do usuário:

* **Músico:** Acesso total à leitura do acervo, confirmação de presença na agenda, edição do próprio perfil e visualização do mural.
* **Chefe de Naipe:** Privilégios elevados para auxiliar na gestão do seu grupo específico.
* **Spalla / Maestro / Admin:** Acesso administrativo completo. Podem adicionar/excluir partituras, criar/cancelar eventos, emitir comunicados no mural e realizar o controle oficial da frequência.

---

## 🛠️ Tecnologias e Arquitetura

O projeto foi construído utilizando as melhores práticas do ecossistema React Native e integração serverless.

### Frontend
- **Framework:** [React Native](https://reactnative.dev/) com [Expo (SDK 54)](https://expo.dev/).
- **Roteamento:** `Expo Router` (File-based routing, navegação baseada em pastas).
- **UI / Estilização:** Estilização responsiva nativa (`StyleSheet`) com paleta de cores dark (Temática Noturna/Teatro).
- **Ícones:** `lucide-react-native`.
- **Seleção de Mídia e Arquivos:** `expo-document-picker` (para PDFs/MP3) e `expo-image-picker` (para Avatars).
- **Componentes Nativos:** `@react-native-community/datetimepicker` para calendários fluidos no iOS e Android.

### Backend & Nuvem (BaaS)
- **Plataforma:** [Supabase](https://supabase.com/).
- **Banco de Dados:** PostgreSQL com políticas de segurança em nível de linha (*Row Level Security - RLS*).
- **Autenticação:** Supabase Auth integrado ao aplicativo.
- **Storage:** Supabase Storage (Buckets separados para `arquivos` musicais e `avatars` de usuários).
- **Arquitetura Dual-DB:** O aplicativo foi arquitetado para conversar com instâncias de banco de dados distintas (um BD focado na gestão/agenda e outro exclusivo para o Acervo Digital, garantindo isolamento do catálogo musical).

### Estratégias de Código
- **TypeScript:** Tipagem estática rigorosa em todas as interfaces de dados (`Musica`, `Evento`, `Perfil`, `Aviso`).
- **Upload Multipart:** Uso de `FormData` e processamento de Blob via fetch nativo para contornar limitações de leitura de arquivos pesados em ambiente mobile, garantindo envios estáveis.
- **Lifecycle:** Uso intensivo de `useFocusEffect` para reidratação de dados silenciosa nas transições de telas (garantindo que listas de eventos e rankings estejam sempre atualizados).

---

## 📱 Estrutura de Telas (Navegação)

```text
/app
 ├── (auth)                # Telas de Login e Recuperação
 ├── (tabs)                # Bottom Tab Navigator Principal
 │    ├── index.tsx        # Home (Dashboard, Ranking, Aviso Urgente, Resumo)
 │    ├── agenda/          # Stack da Agenda (Lista de eventos e Detalhes)
 │    ├── acervo/          # Stack do Acervo (Categorias, Lista e Player)
 │    ├── mural/           # Feed de Comunicados
 │    └── perfil/          # Perfil do Músico (XP, Badges e Edição)
 └── frequencia/           # Stack Oculta (Acesso restrito para Maestro/Admin fazer chamada)