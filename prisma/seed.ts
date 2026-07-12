import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("Admin@1234", 12);

  await prisma.adminUser.upsert({
    where: { email: "admin@store.com" },
    update: {},
    create: {
      email: "admin@store.com",
      password: hashedPassword,
    },
  });

  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "pour-homme" },
      update: {},
      create: { name: "Pour Homme", slug: "pour-homme" },
    }),
    prisma.category.upsert({
      where: { slug: "pour-femme" },
      update: {},
      create: { name: "Pour Femme", slug: "pour-femme" },
    }),
    prisma.category.upsert({
      where: { slug: "unisex" },
      update: {},
      create: { name: "Unisex", slug: "unisex" },
    }),
  ]);

  const products = [
    {
      name: "Noir Élégance",
      slug: "noir-elegance",
      description:
        "A sophisticated blend of dark woods and amber, crafted for the modern gentleman who commands attention without words.",
      price: 2450,
      comparePrice: 2890,
      imageUrl: "https://picsum.photos/seed/noir-elegance/800/1000",
      images: JSON.stringify([
        "https://picsum.photos/seed/noir-elegance-2/800/1000",
        "https://picsum.photos/seed/noir-elegance-3/800/1000",
      ]),
      stock: 24,
      isFeatured: true,
      volume: "100ml",
      gender: "Men",
      categoryId: categories[0].id,
      notes: JSON.stringify({
        top: ["Bergamot", "Black Pepper", "Cardamom"],
        heart: ["Iris", "Leather", "Cedarwood"],
        base: ["Amber", "Patchouli", "Musk"],
      }),
    },
    {
      name: "Velours Rose",
      slug: "velours-rose",
      description:
        "An enchanting floral bouquet wrapped in soft musk and vanilla, evoking timeless femininity and grace.",
      price: 2680,
      comparePrice: null,
      imageUrl: "https://picsum.photos/seed/velours-rose/800/1000",
      images: JSON.stringify([
        "https://picsum.photos/seed/velours-rose-2/800/1000",
      ]),
      stock: 18,
      isFeatured: true,
      volume: "50ml",
      gender: "Women",
      categoryId: categories[1].id,
      notes: JSON.stringify({
        top: ["Rose Petals", "Peony", "Lychee"],
        heart: ["Jasmine", "Magnolia", "Violet"],
        base: ["White Musk", "Vanilla", "Sandalwood"],
      }),
    },
    {
      name: "Lumière Dorée",
      slug: "lumiere-doree",
      description:
        "Golden citrus meets warm amber in this luminous unisex fragrance, perfect for day and evening wear.",
      price: 2190,
      comparePrice: 2490,
      imageUrl: "https://picsum.photos/seed/lumiere-doree/800/1000",
      images: JSON.stringify([]),
      stock: 30,
      isFeatured: true,
      volume: "100ml",
      gender: "Unisex",
      categoryId: categories[2].id,
      notes: JSON.stringify({
        top: ["Mandarin", "Grapefruit", "Neroli"],
        heart: ["Orange Blossom", "Jasmine", "Honey"],
        base: ["Amber", "Tonka Bean", "Vetiver"],
      }),
    },
    {
      name: "Sable Mystique",
      slug: "sable-mystique",
      description:
        "Oriental spices dance with smoky oud in this captivating scent for those who embrace the extraordinary.",
      price: 3200,
      comparePrice: null,
      imageUrl: "https://picsum.photos/seed/sable-mystique/800/1000",
      images: JSON.stringify([
        "https://picsum.photos/seed/sable-mystique-2/800/1000",
      ]),
      stock: 12,
      isFeatured: true,
      volume: "50ml",
      gender: "Unisex",
      categoryId: categories[2].id,
      notes: JSON.stringify({
        top: ["Saffron", "Cinnamon", "Pink Pepper"],
        heart: ["Oud", "Rose", "Incense"],
        base: ["Ambergris", "Leather", "Benzoin"],
      }),
    },
    {
      name: "Côte Marine",
      slug: "cote-marine",
      description:
        "Fresh sea breeze and sun-warmed skin captured in a bottle — effortless elegance for the discerning man.",
      price: 1980,
      comparePrice: null,
      imageUrl: "https://picsum.photos/seed/cote-marine/800/1000",
      images: JSON.stringify([]),
      stock: 22,
      isFeatured: false,
      volume: "100ml",
      gender: "Men",
      categoryId: categories[0].id,
      notes: JSON.stringify({
        top: ["Sea Salt", "Lemon", "Mint"],
        heart: ["Lavender", "Geranium", "Seaweed"],
        base: ["Driftwood", "Amber", "White Musk"],
      }),
    },
    {
      name: "Jardin Secret",
      slug: "jardin-secret",
      description:
        "A hidden garden of white florals and green leaves, whispering secrets of romance and desire.",
      price: 2750,
      comparePrice: 3100,
      imageUrl: "https://picsum.photos/seed/jardin-secret/800/1000",
      images: JSON.stringify([
        "https://picsum.photos/seed/jardin-secret-2/800/1000",
      ]),
      stock: 15,
      isFeatured: true,
      volume: "50ml",
      gender: "Women",
      categoryId: categories[1].id,
      notes: JSON.stringify({
        top: ["Green Leaves", "Pear", "Freesia"],
        heart: ["Tuberose", "Gardenia", "Lily of the Valley"],
        base: ["Cashmere Wood", "Musk", "Heliotrope"],
      }),
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    });
  }

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      storeName: "Maison de Parfum",
      tagline: "Scents that tell your story",
      heroTitle: "Discover Your Signature Scent",
      heroSubtitle:
        "Curated luxury fragrances for those who appreciate the art of perfumery",
      aboutText:
        "Founded on the belief that fragrance is the most intimate form of self-expression, Maison de Parfum brings together the world's finest perfumers to create scents that transcend time.\n\nEach bottle in our collection tells a story — of distant lands, cherished memories, and dreams yet to unfold.",
      phone: "+20 100 000 0000",
      email: "hello@maisondeparfum.com",
      whatsapp: "201000000000",
      address: "Zamalek, Cairo, Egypt",
      instagram: "https://instagram.com",
      facebook: "https://facebook.com",
    },
  });

  const noirProduct = await prisma.product.findUnique({
    where: { slug: "noir-elegance" },
  });
  const veloursProduct = await prisma.product.findUnique({
    where: { slug: "velours-rose" },
  });

  await prisma.offer.deleteMany({});
  await prisma.offer.createMany({
    data: [
      {
        title: "Summer Collection Sale",
        description: "20% off selected fragrances",
        discountPct: 20,
        isActive: true,
        productId: noirProduct?.id,
      },
      {
        title: "Welcome Offer",
        description: "10% off your entire order",
        discountPct: 10,
        isActive: true,
        productId: null,
      },
    ],
  });

  console.log("Seed completed successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
