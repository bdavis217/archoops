import { PrismaClient } from '@prisma/client';

async function deleteUser() {
  const prisma = new PrismaClient();
  
  try {
    const deletedUser = await prisma.user.delete({
      where: { email: 'brian@3wrkz.com' }
    });
    
    console.log('✅ User deleted successfully:');
    console.log('- Email:', deletedUser.email);
    console.log('- Display Name:', deletedUser.displayName);
    console.log('- Role:', deletedUser.role);
    console.log('\nYou can now create a new account with brian@3wrkz.com');
    
  } catch (error) {
    console.error('❌ Error deleting user:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

deleteUser();
