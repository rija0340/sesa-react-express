import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('👤 Création de l\'utilisateur de test...\n');

  const username = 'raberia';
  const password = 'random123';

  // Vérifier si l'utilisateur existe déjà
  const existingUser = await prisma.user.findUnique({
    where: { username },
  });

  if (existingUser) {
    console.log(`⚠️  L'utilisateur "${username}" existe déjà. Suppression...`);
    await prisma.user.delete({
      where: { username },
    });
  }

  // Hacher le mot de passe
  const hashedPassword = await bcrypt.hash(password, 10);

  // Créer l'utilisateur
  const user = await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
      roles: JSON.stringify(['admin']),
    },
  });

  console.log('✅ Utilisateur créé avec succès !\n');
  console.log('📝 Informations de connexion :');
  console.log(`   Username: ${username}`);
  console.log(`   Password: ${password}`);
  console.log(`   Roles: admin\n`);
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
