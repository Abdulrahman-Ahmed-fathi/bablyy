const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("=== Testing Task 1 DB and Settings Integration ===");
  let settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
  if (!settings) {
    settings = await prisma.siteSettings.create({ data: { id: "singleton" } });
  }
  console.log("Current showWhatsAppButton value in DB:", settings.showWhatsAppButton);

  const updatedOff = await prisma.siteSettings.update({
    where: { id: "singleton" },
    data: { showWhatsAppButton: false },
  });
  console.log("Updated showWhatsAppButton to false:", updatedOff.showWhatsAppButton);

  const updatedOn = await prisma.siteSettings.update({
    where: { id: "singleton" },
    data: { showWhatsAppButton: true },
  });
  console.log("Updated showWhatsAppButton back to true:", updatedOn.showWhatsAppButton);

  console.log("Task 1 DB verification PASSED!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
