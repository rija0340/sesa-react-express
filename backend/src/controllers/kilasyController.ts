import { Request, Response } from 'express';
import { prisma } from '../config/database.js';

export const getAll = async (req: Request, res: Response) => {
  try {
    const kilasies = await prisma.kilasy.findMany({
      orderBy: { nom: 'asc' },
    });
    res.json(kilasies);
  } catch (error) {
    console.error('Error fetching kilasies:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des kilasies' });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    
    const kilasy = await prisma.kilasy.findUnique({
      where: { id },
      include: {
        kilasyLasitra: true,
        _count: {
          select: { registres: true },
        },
      },
    });

    if (!kilasy) {
      return res.status(404).json({ error: 'Classe non trouvée' });
    }

    res.json(kilasy);
  } catch (error) {
    console.error('Error fetching kilasy:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la classe' });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const { nom, description, nbrMambra, nbrMambraUsed, lasitraId } = req.body;

    if (!nom) {
      return res.status(400).json({ error: 'Le nom est obligatoire' });
    }

    const existing = await prisma.kilasy.findUnique({
      where: { nom },
    });

    if (existing) {
      return res.status(400).json({ error: 'Une classe avec ce nom existe déjà' });
    }

    if (nbrMambra !== null && nbrMambra < 0) {
      return res.status(400).json({ error: 'Le nombre de membres ne peut pas être négatif' });
    }

    if (nbrMambraUsed === 'custom' && nbrMambra === null) {
      return res.status(400).json({ error: 'Le nombre de membres est requis quand la stratégie est "custom"' });
    }

    const kilasy = await prisma.kilasy.create({
      data: {
        nom,
        description: description || null,
        nbrMambra: nbrMambra !== undefined ? nbrMambra : null,
        nbrMambraUsed: nbrMambraUsed || 'registre',
        lasitraId: lasitraId || null,
      },
    });

    res.status(201).json(kilasy);
  } catch (error) {
    console.error('Error creating kilasy:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la classe' });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const { nom, description, nbrMambra, nbrMambraUsed, lasitraId } = req.body;

    const existing = await prisma.kilasy.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Classe non trouvée' });
    }

    if (nom && nom !== existing.nom) {
      const nameExists = await prisma.kilasy.findUnique({
        where: { nom },
      });

      if (nameExists) {
        return res.status(400).json({ error: 'Une classe avec ce nom existe déjà' });
      }
    }

    const strategy = nbrMambraUsed !== undefined ? nbrMambraUsed : existing.nbrMambraUsed;
    const count = nbrMambra !== undefined ? nbrMambra : existing.nbrMambra;

    if (count !== null && count < 0) {
      return res.status(400).json({ error: 'Le nombre de membres ne peut pas être négatif' });
    }

    if (strategy === 'custom' && count === null) {
      return res.status(400).json({ error: 'Le nombre de membres est requis quand la stratégie est "custom"' });
    }

    const kilasy = await prisma.kilasy.update({
      where: { id },
      data: {
        nom: nom !== undefined ? nom : undefined,
        description: description !== undefined ? description : null,
        nbrMambra: nbrMambra !== undefined ? nbrMambra : undefined,
        nbrMambraUsed: nbrMambraUsed !== undefined ? nbrMambraUsed : undefined,
        lasitraId: lasitraId !== undefined ? lasitraId : undefined,
      },
    });

    res.json(kilasy);
  } catch (error) {
    console.error('Error updating kilasy:', error);
    res.status(500).json({ error: 'Erreur lors de la modification de la classe' });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    
    await prisma.kilasy.delete({
      where: { id },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting kilasy:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la classe' });
  }
};
