import { seed } from './seeder'

async function main() {
  await seed({ file: "prisma/language.json", schema: 'Languages' }).catch((error) => {
    console.error(`Error seeding data: ${error}`)
  });
  await seed({ file: "prisma/partymodes.json", schema: 'partyModes' }).catch((error) => {
    console.error(`Error seeding data: ${error}`)
  })
}

main();
