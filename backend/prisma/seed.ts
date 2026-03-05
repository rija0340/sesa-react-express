import { PrismaClient } from '@prisma/client';
import dayjs from 'dayjs';

const prisma = new PrismaClient();

// Configuration
const START_DATE = dayjs().subtract(3, 'month').startOf('month'); // Il y a 3 mois
const END_DATE = dayjs();
const TEST_MODE = true; // Mettre à false pour la production

// 5 classes avec leurs catégories
const KILASY_DATA = [
  { nom: 'Ankizy', lasitra: 'Ankizy', nbrMambra: 25, trancheAge: '5-8 ans' },
  { nom: 'Tanoza Zandriny', lasitra: 'Tanoza', nbrMambra: 20, trancheAge: '9-12 ans' },
  { nom: 'Zatovo', lasitra: 'Zatovo', nbrMambra: 18, trancheAge: '13-17 ans' },
  { nom: 'Tanora Zokiny', lasitra: 'Tanora', nbrMambra: 22, trancheAge: '18-25 ans' },
  { nom: 'Lehibe', lasitra: 'Lehibe', nbrMambra: 30, trancheAge: '26+ ans' },
];

// Générer des données réalistes pour un registre
function generateRegistreData(kilasy: typeof KILASY_DATA[0], date: dayjs.Dayjs) {
  const isSpecialDay = date.month() === dayjs().month() && date.date() <= 7; // Premier sabbat du mois = plus de monde
  
  const baseMultiplier = isSpecialDay ? 1.3 : 1;
  
  // Variation aléatoire de présence (60-95%)
  const presenceRate = 0.6 + Math.random() * 0.35;
  const mambraTonga = Math.floor(kilasy.nbrMambra * presenceRate * baseMultiplier);
  
  // Mpamangy: 2-5 personnes
  const mpamangy = Math.floor(2 + Math.random() * 4);
  
  // Tonga rehetra = mambra + mpamangy + visiteurs occasionnels
  const tongaRehetra = mambraTonga + mpamangy + Math.floor(Math.random() * 5);
  
  // Nianatra Impito: 70-90% des présents
  const nianatraImpito = Math.floor(tongaRehetra * (0.7 + Math.random() * 0.2));
  
  // Asafi (Asa fitoriana): 50-80%
  const asafi = Math.floor(tongaRehetra * (0.5 + Math.random() * 0.3));
  
  // Asa Soa: 30-60%
  const asaSoa = Math.floor(tongaRehetra * (0.3 + Math.random() * 0.3));
  
  // Fampianarana Baiboly: 40-70%
  const fampianaranaBaiboly = Math.floor(tongaRehetra * (0.4 + Math.random() * 0.3));
  
  // Boky/Trakta: 1-3 par personne présente
  const bokyTrakta = Math.floor(tongaRehetra * (1 + Math.random() * 2));
  
  // Seminera/Kaoferansa: 0-10 (événements spéciaux)
  const semineraKaoferansa = Math.floor(Math.random() * 11);
  
  // Alasarona: 5-15%
  const alasarona = Math.floor(tongaRehetra * (0.05 + Math.random() * 0.1));
  
  // Nahavita Famp Taratasy: 20-40%
  const nahavitaFampTaratasy = Math.floor(tongaRehetra * (0.2 + Math.random() * 0.2));
  
  // Batisa TAMI: rare, 0-5 (surtout pour Ankizy)
  const batisaTami = kilasy.nom === 'Ankizy' ? Math.floor(Math.random() * 3) : Math.floor(Math.random() * 2);
  
  // Fanatitra (offrandes): 500-5000 Ar par personne, plus pour Lehibe
  const baseOffrande = kilasy.nom === 'Lehibe' ? 2000 : 1000;
  const fanatitra = Math.floor(tongaRehetra * (baseOffrande + Math.random() * baseOffrande));
  
  return {
    mambraTonga,
    mpamangy,
    tongaRehetra,
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
    nbrMambraKilasy: kilasy.nbrMambra,
  };
}

async function main() {
  console.log('🌱 Démarrage du seeding...');
  
  // Nettoyer les données existantes si TEST_MODE
  if (TEST_MODE) {
    console.log('🧹 Nettoyage des données existantes...');
    await prisma.registre.deleteMany({});
    await prisma.kilasy.deleteMany({});
    await prisma.kilasyLasitra.deleteMany({});
    console.log('✅ Données nettoyées');
  }
  
  // Créer les KilasyLasitra (catégories)
  console.log('📁 Création des catégories KilasyLasitra...');
  const lasitraMap = new Map<string, any>();
  
  for (const kilasyInfo of KILASY_DATA) {
    let lasitra = lasitraMap.get(kilasyInfo.lasitra);
    if (!lasitra) {
      // Vérifier si existe déjà
      lasitra = await prisma.kilasyLasitra.findFirst({
        where: { nom: kilasyInfo.lasitra },
      });
      
      if (!lasitra) {
        lasitra = await prisma.kilasyLasitra.create({
          data: {
            nom: kilasyInfo.lasitra,
            trancheAge: kilasyInfo.trancheAge,
            description: `Catégorie pour ${kilasyInfo.lasitra}`,
          },
        });
      }
      lasitraMap.set(kilasyInfo.lasitra, lasitra);
      console.log(`  ✓ ${kilasyInfo.lasitra}`);
    }
  }
  
  // Créer les Kilasy (classes)
  console.log('📚 Création des classes Kilasy...');
  const kilasyMap = new Map<string, any>();
  
  for (const kilasyInfo of KILASY_DATA) {
    const lasitra = lasitraMap.get(kilasyInfo.lasitra);
    
    // Vérifier si existe déjà
    let kilasy = await prisma.kilasy.findFirst({
      where: { nom: kilasyInfo.nom },
    });
    
    if (!kilasy) {
      kilasy = await prisma.kilasy.create({
        data: {
          nom: kilasyInfo.nom,
          description: `Classe ${kilasyInfo.nom} - ${kilasyInfo.trancheAge}`,
          nbrMambra: kilasyInfo.nbrMambra,
          nbrMambraUsed: 'registre',
          kilasyLasitra: lasitra ? { connect: { id: lasitra.id } } : undefined,
        },
      });
    }
    kilasyMap.set(kilasyInfo.nom, kilasy);
    console.log(`  ✓ ${kilasyInfo.nom} (${kilasyInfo.nbrMambra} membres)`);
  }
  
  // Générer les registres pour chaque samedi sur 3 mois
  console.log('📅 Génération des registres pour chaque samedi...');
  let currentDate = START_DATE.startOf('week').add(6, 'day'); // Premier samedi
  let totalRegistres = 0;
  
  while (currentDate.isBefore(END_DATE)) {
    // Créer un registre pour chaque classe
    for (const kilasyInfo of KILASY_DATA) {
      const kilasy = kilasyMap.get(kilasyInfo.nom);
      const registreData = generateRegistreData(kilasyInfo, currentDate);
      
      await prisma.registre.create({
        data: {
          ...registreData,
          kilasy: { connect: { id: kilasy.id } },
          createdAt: currentDate.toDate(),
          processedAt: currentDate.toDate(),
        },
      });
      totalRegistres++;
    }
    
    // Samedi suivant
    currentDate = currentDate.add(1, 'week');
  }
  
  console.log(`✅ ${totalRegistres} registres créés`);
  
  // Afficher un résumé
  console.log('\n📊 Résumé des données créées:');
  console.log(`  - ${KILASY_DATA.length} classes`);
  console.log(`  - ${lasitraMap.size} catégories`);
  console.log(`  - ${totalRegistres} registres`);
  console.log(`  - Période: ${START_DATE.format('DD/MM/YYYY')} au ${END_DATE.format('DD/MM/YYYY')}`);
  
  // Calculer quelques statistiques
  const stats = await prisma.registre.aggregate({
    _sum: {
      tongaRehetra: true,
      fanatitra: true,
      nianatraImpito: true,
    },
    _avg: {
      tongaRehetra: true,
      fanatitra: true,
    },
  });
  
  console.log('\n📈 Statistiques globales:');
  console.log(`  - Total présences: ${stats._sum.tongaRehetra || 0}`);
  console.log(`  - Présence moyenne/sabbat: ${Math.round(stats._avg.tongaRehetra || 0)}`);
  console.log(`  - Total offrandes: ${(stats._sum.fanatitra || 0).toLocaleString('fr-FR')} Ar`);
  console.log(`  - Total apprentissage: ${stats._sum.nianatraImpito || 0}`);
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
