import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    include: { variants: true },
  });

  let created = 0;
  for (const product of products) {
    if (product.variants.length > 0) continue;

    await prisma.productVariant.create({
      data: {
        productId: product.id,
        size: product.volume || "Standard",
        price: product.price,
        stock: product.stock,
        isDefault: true,
      },
    });
    created++;
  }

  console.log(`Backfilled ${created} product(s) with a default variant.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });