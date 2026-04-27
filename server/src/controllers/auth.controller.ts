import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createWinery = async (req: Request, res: Response) => {
  const { wineryName } = req.body;

  if (!wineryName) {
    return res.status(400).json({ error: 'Nome da Vinícola é obrigatório.' });
  }

  try {
    const winery = await prisma.winery.create({
      data: {
        name: wineryName,
        slug: wineryName.toLowerCase().replace(/ /g, '-') + '-' + Math.random().toString(36).substring(2, 7),
      }
    });

    res.status(201).json({ wineryId: winery.id });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao criar vinícola: ' + error.message });
  }
};
