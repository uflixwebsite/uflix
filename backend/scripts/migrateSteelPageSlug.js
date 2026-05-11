const dotenv = require('dotenv');
const mongoose = require('mongoose');
const PageContent = require('../models/PageContent');

dotenv.config();

const OLD_SLUG = 'business-steel-metal';
const CANONICAL_SLUG = 'steel-fabrication-delhi-ncr';

async function run() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not set');
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const legacyPage = await PageContent.findOne({ slug: OLD_SLUG });
  if (!legacyPage) {
    console.log(`No page found for ${OLD_SLUG}`);
    return;
  }

  const canonicalPage = await PageContent.findOne({ slug: CANONICAL_SLUG });

  if (canonicalPage) {
    canonicalPage.title = legacyPage.title;
    canonicalPage.description = legacyPage.description;
    canonicalPage.isPublished = legacyPage.isPublished;
    canonicalPage.sections = legacyPage.sections;
    canonicalPage.slug = CANONICAL_SLUG;
    await canonicalPage.save();
    await legacyPage.deleteOne();
    console.log(`Merged ${OLD_SLUG} into existing ${CANONICAL_SLUG} and removed the legacy page.`);
  } else {
    legacyPage.slug = CANONICAL_SLUG;
    await legacyPage.save();
    console.log(`Renamed ${OLD_SLUG} to ${CANONICAL_SLUG}.`);
  }

  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error(error);
  try {
    await mongoose.disconnect();
  } catch (disconnectError) {
    console.error(disconnectError);
  }
  process.exit(1);
});
