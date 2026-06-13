import prisma from '../../config/prisma';

export async function resolveLabId(query: any): Promise<bigint | null> {
  if (query.labId) return BigInt(query.labId as string);
  if (query.userId) {
    const lab = await prisma.lab.findUnique({ where: { userId: BigInt(query.userId as string) }, select: { id: true } });
    return lab?.id ?? null;
  }
  return null;
}
