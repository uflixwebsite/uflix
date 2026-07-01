/**
 * One-time migration: seeds the Category tree from the old Subcategory collection
 * and patches each product's categoryRef to point to the correct Category._id
 *
 * Run: node scripts/migrateSubcategoriesToCategoryTree.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');
const Product = require('../models/Product');

// Map from old Subcategory.category string → canonical root Category name + slug
const ROOT_CATEGORY_MAP = {
  'living':           { name: 'Living Room',       slug: 'living-room' },
  'living-room':      { name: 'Living Room',       slug: 'living-room' },
  'bedroom':          { name: 'Bedroom',            slug: 'bedroom' },
  'home-office':      { name: 'Home Office',        slug: 'home-office' },
  'modular-kitchen':  { name: 'Modular Kitchen',    slug: 'modular-kitchen' },
  'storage':          { name: 'Storage',            slug: 'storage' },
  'shop-fitting':     { name: 'Shop Fitting',       slug: 'shop-fitting' },
  'for-businesses':   { name: 'For Business',       slug: 'for-business' },
  // also handle products that stored their category as:
  'dining-room':      { name: 'Dining Room',        slug: 'dining-room' },
};

// These are all root categories we want to ensure exist
const ALL_ROOT_CATEGORIES = Object.values(ROOT_CATEGORY_MAP).filter(
  (v, i, arr) => arr.findIndex(x => x.slug === v.slug) === i
);

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // ── 1. Ensure all root categories exist ─────────────────────────────────────
  console.log('\n── Step 1: Ensure root categories ──');
  const rootIdBySlug = {};
  for (const rc of ALL_ROOT_CATEGORIES) {
    let cat = await Category.findOne({ slug: rc.slug });
    if (!cat) {
      cat = await Category.create({ name: rc.name, slug: rc.slug, parent: null });
      console.log(`  Created root: ${rc.name}`);
    } else {
      console.log(`  Exists:       ${cat.name} (${cat.slug})`);
    }
    rootIdBySlug[rc.slug] = cat._id;
  }

  // ── 2. Migrate old Subcategory docs → child Category docs ──────────────────
  console.log('\n── Step 2: Migrate old Subcategory → child Category ──');
  const subcategories = await Subcategory.find({}).lean();

  // subcategoryId → new Category _id mapping (for patching products later)
  const subIdToNewCatId = {};

  for (const sub of subcategories) {
    // Determine canonical root slug for this subcategory
    const catKey = (sub.category || '').toLowerCase().replace(/\s+/g, '-');
    const rootInfo = ROOT_CATEGORY_MAP[catKey];
    if (!rootInfo) {
      console.log(`  SKIP (no root mapping): ${sub.name} (category="${sub.category}")`);
      continue;
    }
    const parentId = rootIdBySlug[rootInfo.slug];
    if (!parentId) {
      console.log(`  SKIP (root not found): ${sub.name}`);
      continue;
    }

    // Generate slug from name
    const slug = sub.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Check if this child Category already exists under the same parent
    let child = await Category.findOne({ slug, parent: parentId });
    if (!child) {
      // Also try by name in case slug differs
      child = await Category.findOne({
        name: { $regex: new RegExp(`^${sub.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
        parent: parentId,
      });
    }

    if (!child) {
      child = await Category.create({
        name: sub.name.charAt(0).toUpperCase() + sub.name.slice(1),
        slug,
        parent: parentId,
      });
      console.log(`  Created child: ${rootInfo.name} → ${child.name}`);
    } else {
      console.log(`  Exists child:  ${rootInfo.name} → ${child.name}`);
    }

    subIdToNewCatId[sub._id.toString()] = child._id;
  }

  // ── 3. Patch products: set categoryRef ────────────────────────────────────
  console.log('\n── Step 3: Patch products with categoryRef ──');
  const products = await Product.find({}).lean();
  let updated = 0, skipped = 0;

  for (const product of products) {
    // Find the matching new Category _id
    let newCatId = null;

    // Case A: product already has subcategory._id matching an old Subcategory
    if (product.subcategory?._id) {
      newCatId = subIdToNewCatId[product.subcategory._id.toString()];
    }

    // Case B: match by subcategory.name + parent category string
    if (!newCatId && product.subcategory?.name) {
      const subName = product.subcategory.name.toLowerCase();
      const matchedSub = subcategories.find(s => s.name.toLowerCase() === subName);
      if (matchedSub) {
        newCatId = subIdToNewCatId[matchedSub._id.toString()];
      }
    }

    // Case C: match directly via categories[] string → root Category
    if (!newCatId && product.categories?.length) {
      const rootSlug = ROOT_CATEGORY_MAP[(product.categories[0] || '').toLowerCase().replace(/\s+/g, '-')]?.slug;
      if (rootSlug) newCatId = rootIdBySlug[rootSlug];
    }

    if (newCatId) {
      await Product.updateOne({ _id: product._id }, { $set: { categoryRef: newCatId } });
      updated++;
    } else {
      skipped++;
    }
  }
  console.log(`  Updated: ${updated}, Skipped (no match): ${skipped}`);

  console.log('\nMigration complete!');
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
