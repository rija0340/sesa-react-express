import { Request, Response } from 'express';
import { prisma } from '../config/database.js';

const serializeRegistre = (r: any) => {
  const kilasy = r.kilasy;
  const mTonga = r.mambraTonga;
  const mpam = r.mpamangy;
  const nImpito = r.nianatraImpito;
  const tRehetra = r.tongaRehetra;
  
  const nbrMambraKilasy = r.nbrMambraKilasy ?? (kilasy?.nbrMambraUsed === 'custom' ? kilasy.nbrMambra : 0) ?? 0;
  
  const pourcentTonga = nbrMambraKilasy > 0 ? Number(((mTonga * 100) / nbrMambraKilasy).toFixed(2)) : 0;
  const pourcentImpito = tRehetra > 0 ? Number(((nImpito * 100) / tRehetra).toFixed(2)) : 0;

  return {
    id: r.id,
    date: r.createdAt.toISOString().split('T')[0],
    kilasy: kilasy ? kilasy.nom : 'Inconnue',
    mambraTonga: mTonga,
    mpamangy: mpam,
    tongaRehetra: tRehetra,
    nianatraImpito: nImpito,
    asafi: r.asafi,
    asaSoa: r.asaSoa,
    fampianaranaBaiboly: r.fampianaranaBaiboly,
    bokyTrakta: r.bokyTrakta,
    semineraKaoferansa: r.semineraKaoferansa,
    alasarona: r.alasarona,
    nahavitaFampTaratasy: r.nahavitaFampTaratasy,
    batisaTami: r.batisaTami,
    fanatitra: r.fanatitra,
    nbrMambraKilasy,
    pourcentTonga,
    pourcentImpito,
  };
};

const calculerStatistiquesCollectives = (registres: any[]) => {
  if (!registres || registres.length === 0) {
    return {
      totalRegistres: 0,
      numSabbats: 0,
      moyennePresence: 0,
      moyenneApprentissage: 0,
      totalMembresTonga: 0,
      totalNianatraImpito: 0,
      totalFanatitra: 0,
    };
  }

  const sabbats = new Set(registres.map(r => r.createdAt.toISOString().split('T')[0]));
  const numSabbats = sabbats.size || 1;

  let totalPresence = 0;
  let totalApprentissage = 0;
  let totalMembresTonga = 0;
  let totalNianatraImpito = 0;
  let totalFanatitra = 0;
  let countWithPresence = 0;

  for (const r of registres) {
    const serialized = serializeRegistre(r);
    
    // Calculer la présence seulement si nbrMambraKilasy > 0
    if (serialized.nbrMambraKilasy > 0) {
      totalPresence += serialized.pourcentTonga;
      countWithPresence++;
    }
    
    // Calculer l'apprentissage seulement si tongaRehetra > 0
    if (serialized.tongaRehetra > 0) {
      totalApprentissage += serialized.pourcentImpito;
    }
    
    totalMembresTonga += (r.mambraTonga || 0);
    totalNianatraImpito += (r.nianatraImpito || 0);
    totalFanatitra += (r.fanatitra || 0);
  }

  const effectiveCount = countWithPresence > 0 ? countWithPresence : registres.length;

  return {
    totalRegistres: registres.length,
    numSabbats,
    moyennePresence: countWithPresence > 0 ? Number((totalPresence / countWithPresence).toFixed(2)) : 0,
    moyenneApprentissage: registres.length > 0 ? Number((totalApprentissage / registres.length).toFixed(2)) : 0,
    totalMembresTonga,
    totalNianatraImpito,
    totalFanatitra,
  };
};

export const getSummary = async (req: Request, res: Response) => {
  try {
    const { dateDebut, dateFin } = req.query;

    const where: any = {};
    if (dateDebut && dateFin) {
      // Inclure toute la journée de début et de fin
      // On crée des dates avec l'heure explicite pour éviter les problèmes de timezone
      const startDate = new Date(`${dateDebut}T00:00:00`);
      const endDate = new Date(`${dateFin}T23:59:59`);

      where.createdAt = {
        gte: startDate,
        lte: endDate, // Inclure toute la journée de fin
      };
    }

    const registres = await prisma.registre.findMany({
      where,
      include: { kilasy: true },
    });

    const stats = calculerStatistiquesCollectives(registres);
    const data = registres.map(serializeRegistre);

    res.json({
      periode: {
        du: dateDebut || null,
        au: dateFin || null,
      },
      statistiques: stats,
      data
    });
  } catch (error) {
    console.error('Error fetching summary stats:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
};

export const getStatsKilasy = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const kilasy = await prisma.kilasy.findUnique({
      where: { id },
      include: { registres: { include: { kilasy: true } } }
    });

    if (!kilasy) {
      return res.status(404).json({ error: 'Classe non trouvée' });
    }

    const stats = calculerStatistiquesCollectives(kilasy.registres);

    res.json({
      kilasy: {
        id: kilasy.id,
        nom: kilasy.nom,
        description: kilasy.description,
      },
      statistiques: {
        totalRegistres: stats.totalRegistres,
        tauxMoyenPresence: stats.moyennePresence,
        tauxMoyenApprentissage: stats.moyenneApprentissage,
      }
    });
  } catch (error) {
    console.error('Error fetching kilasy stats:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques de la classe' });
  }
};

export const getStatsKilasyPeriode = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const { dateDebut, dateFin } = req.query;

    if (!dateDebut || !dateFin) {
      return res.status(400).json({ error: 'Les paramètres dateDebut et dateFin sont requis' });
    }

    const kilasy = await prisma.kilasy.findUnique({
      where: { id }
    });

    if (!kilasy) {
      return res.status(404).json({ error: 'Classe non trouvée' });
    }

    // Inclure toute la journée de début et de fin avec heures explicites
    const startDate = new Date(`${dateDebut}T00:00:00`);
    const endDate = new Date(`${dateFin}T23:59:59`);

    const registres = await prisma.registre.findMany({
      where: {
        kilasyId: id,
        createdAt: {
          gte: startDate,
          lte: endDate,
        }
      },
      include: { kilasy: true }
    });

    const stats = calculerStatistiquesCollectives(registres);
    const data = registres.map(serializeRegistre);

    res.json({
      kilasy: {
        id: kilasy.id,
        nom: kilasy.nom,
        description: kilasy.description,
      },
      periode: {
        du: dateDebut,
        au: dateFin,
      },
      statistiques: stats,
      data
    });
  } catch (error) {
    console.error('Error fetching kilasy period stats:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
};
