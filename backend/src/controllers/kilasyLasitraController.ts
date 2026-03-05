import { Request, Response } from 'express';
import { prisma } from '../config/database.js';

export const getAll = async (req: Request, res: Response) => {
  try {
    const list = await prisma.kilasyLasitra.findMany({
      orderBy: { nom: 'asc' },
    });
    res.json(list);
  } catch (error) {
    console.error('Error fetching kilasy lasitra:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des modèles de classe' });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const { nom, trancheAge, description } = req.body;
    
    if (!nom || !trancheAge) {
      return res.status(400).json({ error: 'Le nom et la tranche d\'âge sont obligatoires' });
    }

    const lasitra = await prisma.kilasyLasitra.create({
      data: {
        nom,
        trancheAge,
        description: description || null,
      },
    });

    res.status(201).json(lasitra);
  } catch (error) {
    console.error('Error creating kilasy lasitra:', error);
    res.status(500).json({ error: 'Erreur lors de la création du modèle de classe' });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const { nom, trancheAge, description } = req.body;

    const lasitra = await prisma.kilasyLasitra.update({
      where: { id },
      data: {
        nom: nom !== undefined ? nom : undefined,
        trancheAge: trancheAge !== undefined ? trancheAge : undefined,
        description: description !== undefined ? description : null,
      },
    });

    res.json(lasitra);
  } catch (error) {
    console.error('Error updating kilasy lasitra:', error);
    res.status(500).json({ error: 'Erreur lors de la modification du modèle de classe' });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    
    await prisma.kilasyLasitra.delete({
      where: { id },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting kilasy lasitra:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du modèle de classe' });
  }
};
