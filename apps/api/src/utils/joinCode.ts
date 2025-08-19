import { prisma } from '../prisma.js';

export async function generateJoinCode(): Promise<string> {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  // Check if code already exists
  const existing = await prisma.class.findUnique({
    where: { joinCode: result }
  });
  
  if (existing) {
    return generateJoinCode(); // Recursively generate new code
  }
  
  return result;
}
