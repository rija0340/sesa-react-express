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
  if (registres.length === 0) {
    return {
      totalRegistres: 0,
      numSabbats: 0,
      moyennePresence: 0,
      moyenneApprentissage: 0,
      totalMembresTonga: 0,
      totalNianatraImpito: 0,
    };
  }

  const sabbats = new Set(registres.map(r => r.createdAt.toISOString().split('T')[0]));
  const numSabbats = sabbats.size;

  const registresActifs = registres.filter(r => r.mambraTonga > 0);

  if (registresActifs.length === 0) {
    return {
      totalRegistres: registres.length,
      numSabbats,
      moyennePresence: 0,
      moyenneApprentissage: 0,
      totalMembresTonga: 0,
      totalNianatraImpito: 0,
    };
  }

  let totalPresence = 0;
  let totalApprentissage = 0;
  let totalMembresTonga = 0;
  let totalNianatraImpito = 0;

  for (const r of registresActifs) {
    const serialized = serializeRegistre(r);
    totalPresence += serialized.pourcentTonga;
    totalApprentissage += serialized.pourcentImpito;
    totalMembresTonga += r.mambraTonga;
    totalNianatraImpito += r.nianatraImpito;
  }

  return {
    totalRegistres: registres.length,
    totalRegistresActifs: registresActifs.length,
    numSabbats,
    moyennePresence: Number((totalPresence / registresActifs.length).toFixed(2)),
    moyenneApprentissage: Number((totalApprentissage / registresActifs.length).toFixed(2)),
    totalMembresTonga,
    totalNianatraImpito,
  };
};

export const getSummary = async (req: Request, res: Response) => {
  try {
    const { dateDebut, dateFin } = req.query;

    const where: any = {};
    if (dateDebut && dateFin) {
      // Inclure toute la journée de fin
      // On utilise le jour suivant à 00:00:00 pour être sûr d'inclure toute la journée
      const startDate = new Date(dateDebut as string);
      const endDate = new Date(dateFin as string);
      endDate.setDate(endDate.getDate() + 1); // Jour suivant
      
      where.createdAt = {
        gte: startDate,
        lt: endDate, // Strictement inférieur au jour suivant
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

    // Inclure toute la journée de fin
    const startDate = new Date(dateDebut as string);
    const endDate = new Date(dateFin as string);
    endDate.setDate(endDate.getDate() + 1); // Jour suivant

    const registres = await prisma.registre.findMany({
      where: {
        kilasyId: id,
        createdAt: {
          gte: startDate,
          lt: endDate, // Strictement inférieur au jour suivant
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
