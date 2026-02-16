import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const acervoUrl = process.env.EXPO_PUBLIC_ACERVO_URL || "";
const acervoKey = process.env.EXPO_PUBLIC_ACERVO_ANON_KEY || "";

export const supabaseAcervo = createClient(acervoUrl, acervoKey);