import { Request, Response } from 'express';
import { supabase } from '../lib/supabase';

export const createWinery = async (req: Request, res: Response) => {
  const { wineryName } = req.body;

  if (!wineryName) {
    return res.status(400).json({ error: 'Nome da Vinícola é obrigatório.' });
  }

  try {
    const slug = wineryName.toLowerCase().replace(/ /g, '-') + '-' + Math.random().toString(36).substring(2, 7);
    
    const { data, error } = await supabase
      .from('wineries')
      .insert([
        { 
          name: wineryName, 
          slug,
          plan_type: 'basic', // Começa no básico
          trial_started_at: new Date().toISOString() // Inicia o Trial de 15 dias
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ wineryId: data.id });
  } catch (error: any) {
    console.error('Erro no createWinery:', error.message);
    res.status(500).json({ error: 'Erro ao criar vinícola: ' + error.message });
  }
};
