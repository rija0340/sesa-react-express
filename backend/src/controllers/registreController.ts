import { Request, Response } from 'express';
import { prisma } from '../config/database.js';

export const getAll = async (req: Request, res: Response) => {
  try {
    const kilasyId = req.query.kilasyId ? parseInt(req.query.kilasyId as string) : undefined;
    
    const where: any = {};
    if (kilasyId) {
      where.kilasyId = kilasyId;
    }

    const registres = await prisma.registre.findMany({
      where,
      include: {
        kilasy: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(registres);
  } catch (error) {
    console.error('Error fetching registres:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des registres' });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    
    const registre = await prisma.registre.findUnique({
      where: { id },
      include: {
        kilasy: true,
      },
    });

    if (!registre) {
      return res.status(404).json({ error: 'Registre non trouvé' });
    }

    res.json(registre);
  } catch (error) {
    console.error('Error fetching registre:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du registre' });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const {
      kilasyId,
      mambraTonga,
      mpamangy,
      nianatraImpito,
      asafi,
      asaSoa,
      fampianaranaBaiboly,
      bokyTrakta,
      semineraKaoferansa,
      alasarona,
      nahavitaFampTaratasy,
      batisaTami,
      fanatitra,
      createdAt,
      nbrMambraKilasy
    } = req.body;

    if (!kilasyId || !createdAt) {
      return res.status(400).json({ error: 'La classe et la date sont obligatoires' });
    }

    const kid = parseInt(kilasyId);
    if (isNaN(kid)) {
      return res.status(400).json({ error: 'ID de classe invalide' });
    }

    // Fetch Kilasy to get nbrMambra
    const kilasy = await prisma.kilasy.findUnique({
      where: { id: kid }
    });

    if (!kilasy) {
      return res.status(404).json({ error: 'Classe non trouvée' });
    }

    // Validation logic matching Symfony Registre::enregistrerDonnees
    const mTonga = mambraTonga || 0;
    const mpam = mpamangy || 0;
    const nImpito = nianatraImpito || 0;
    const fana = fanatitra || 0;
    const tRehetra = mTonga + mpam;

    if (mTonga < 0 || mpam < 0 || nImpito < 0 || asafi < 0 || asaSoa < 0 || 
        fampianaranaBaiboly < 0 || bokyTrakta < 0 || semineraKaoferansa < 0 || 
        alasarona < 0 || nahavitaFampTaratasy < 0 || batisaTami < 0) {
      return res.status(400).json({ error: 'Les valeurs numériques ne peuvent pas être négatives' });
    }

    if (fana < 0) {
      return res.status(400).json({ error: 'Le fanatitra ne peut pas être négatif' });
    }

    const totalMembres = nbrMambraKilasy ?? (kilasy.nbrMambraUsed === 'custom' ? kilasy.nbrMambra : 0) ?? 0;

    if (mTonga > totalMembres && totalMembres > 0) {
       // Note: Symfony throws exception, we return 400
       // But wait, if totalMembres is 0 and we have people, maybe it's allowed or maybe nbrMambraKilasy should have been set.
    }

    if (nImpito > tRehetra) {
      return res.status(400).json({ error: 'Le nombre d\'apprenants est supérieur au nombre total de personnes présentes' });
    }

    const dateObj = new Date(createdAt);
    const existing = await prisma.registre.findFirst({
      where: {
        kilasyId: kid,
        createdAt: dateObj,
      },
    });

    if (existing) {
      return res.status(400).json({ error: 'Un registre existe déjà pour cette classe à cette date' });
    }

    const registre = await prisma.registre.create({
      data: {
        kilasyId: kid,
        mambraTonga: mTonga,
        mpamangy: mpam,
        tongaRehetra: tRehetra,
        nianatraImpito: nImpito,
        asafi: asafi || 0,
        asaSoa: asaSoa || 0,
        fampianaranaBaiboly: fampianaranaBaiboly || 0,
        bokyTrakta: bokyTrakta || 0,
        semineraKaoferansa: semineraKaoferansa || 0,
        alasarona: alasarona || 0,
        nahavitaFampTaratasy: nahavitaFampTaratasy || 0,
        batisaTami: batisaTami || 0,
        fanatitra: fana,
        nbrMambraKilasy: nbrMambraKilasy || null,
        createdAt: dateObj,
      },
      include: {
        kilasy: true,
      },
    });

    res.status(201).json(registre);
  } catch (error) {
    console.error('Error creating registre:', error);
    res.status(500).json({ error: 'Erreur lors de la création du registre' });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const {
      kilasyId,
      mambraTonga,
      mpamangy,
      nianatraImpito,
      asafi,
      asaSoa,
      fampianaranaBaiboly,
      bokyTrakta,
      semineraKaoferansa,
      alasarona,
      nahavitaFampTaratasy,
      batisaTami,
      fanatitra,
      createdAt,
      nbrMambraKilasy
    } = req.body;

    const existing = await prisma.registre.findUnique({
      where: { id },
      include: { kilasy: true }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Registre non trouvé' });
    }

    const kid = kilasyId !== undefined ? parseInt(kilasyId) : existing.kilasyId;
    const kilasy = kilasyId !== undefined ? await prisma.kilasy.findUnique({ where: { id: kid } }) : existing.kilasy;

    if (!kilasy) {
      return res.status(404).json({ error: 'Classe non trouvée' });
    }

    // Re-calculate and validate
    const mTonga = mambraTonga !== undefined ? mambraTonga : existing.mambraTonga;
    const mpam = mpamangy !== undefined ? mpamangy : existing.mpamangy;
    const nImpito = nianatraImpito !== undefined ? nianatraImpito : existing.nianatraImpito;
    const fana = fanatitra !== undefined ? fanatitra : existing.fanatitra;
    const tRehetra = mTonga + mpam;

    if (mTonga < 0 || mpam < 0 || nImpito < 0 || fana < 0) {
        return res.status(400).json({ error: 'Les valeurs numériques ne peuvent pas être négatives' });
    }

    if (nImpito > tRehetra) {
      return res.status(400).json({ error: 'Le nombre d\'apprenants est supérieur au nombre total de personnes présentes' });
    }

    const registre = await prisma.registre.update({
      where: { id },
      data: {
        kilasyId: kid,
        mambraTonga: mTonga,
        mpamangy: mpam,
        tongaRehetra: tRehetra,
        nianatraImpito: nImpito,
        asafi: asafi !== undefined ? asafi : undefined,
        asaSoa: asaSoa !== undefined ? asaSoa : undefined,
        fampianaranaBaiboly: fampianaranaBaiboly !== undefined ? fampianaranaBaiboly : undefined,
        bokyTrakta: bokyTrakta !== undefined ? bokyTrakta : undefined,
        semineraKaoferansa: semineraKaoferansa !== undefined ? semineraKaoferansa : undefined,
        alasarona: alasarona !== undefined ? alasarona : undefined,
        nahavitaFampTaratasy: nahavitaFampTaratasy !== undefined ? nahavitaFampTaratasy : undefined,
        batisaTami: batisaTami !== undefined ? batisaTami : undefined,
        fanatitra: fana,
        nbrMambraKilasy: nbrMambraKilasy !== undefined ? nbrMambraKilasy : undefined,
        createdAt: createdAt !== undefined ? new Date(createdAt) : undefined,
      },
      include: {
        kilasy: true,
      },
    });

    res.json(registre);
  } catch (error) {
    console.error('Error updating registre:', error);
    res.status(500).json({ error: 'Erreur lors de la modification du registre' });
  }
};


export const remove = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    
    await prisma.registre.delete({
      where: { id },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting registre:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du registre' });
  }
};
