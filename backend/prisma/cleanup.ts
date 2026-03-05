import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('⚠️  ATTENTION: Nettoyage complet des données de test...\n');
  
  // Confirmation
  console.log('Ce script va supprimer:');
  console.log('  - Tous les registres');
  console.log('  - Toutes les classes (Kilasy)');
  console.log('  - Toutes les catégories (KilasyLasitra)');
  console.log('');
  
  // Compter les données existantes
  const registresCount = await prisma.registre.count();
  const kilasyCount = await prisma.kilasy.count();
  const lasitraCount = await prisma.kilasyLasitra.count();
  
  console.log('📊 Données actuelles:');
  console.log(`  - ${registresCount} registres`);
  console.log(`  - ${kilasyCount} classes (Kilasy)`);
  console.log(`  - ${lasitraCount} catégories (KilasyLasitra)`);
  console.log('');
  
  // Suppression en cascade
  console.log('🗑️  Suppression des registres...');
  await prisma.registre.deleteMany({});
  console.log(`  ✓ ${registresCount} registres supprimés`);
  
  console.log('🗑️  Suppression des classes...');
  await prisma.kilasy.deleteMany({});
  console.log(`  ✓ ${kilasyCount} classes supprimées`);
  
  console.log('🗑️  Suppression des catégories...');
  await prisma.kilasyLasitra.deleteMany({});
  console.log(`  ✓ ${lasitraCount} catégories supprimées`);
  
  console.log('\n✅ Nettoyage terminé avec succès!');
  console.log('📝 La base de données est maintenant vide et prête pour la production.');
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
