/**
 * One-time migration: rename the steel fabrication CMS page slug to the
 * independent route slug.
 *
 * Run: node scripts/renameSteelFabricationPageSlug.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const PageContent = require('../models/PageContent');

const OLD_SLUG = 'business-steel-metal';
const NEW_SLUG = 'steel-fabrication-delhi-ncr';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const oldPage = await PageContent.findOne({ slug: OLD_SLUG });
  if (!oldPage) {
    console.log(`No page found with slug "${OLD_SLUG}". Nothing to migrate.`);
    process.exit(0);
  }

  const existingNewPage = await PageContent.findOne({ slug: NEW_SLUG });
  if (existingNewPage) {
    console.log(`A page already exists with slug "${NEW_SLUG}". Skipping rename to avoid overwriting content.`);
    process.exit(0);
  }

  oldPage.slug = NEW_SLUG;
  await oldPage.save();

  console.log(`Renamed page slug from "${OLD_SLUG}" to "${NEW_SLUG}".`);
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});