# CMS Content Import Files

These JSON files contain content to be imported into the Laravel Filament CMS at `cms.molochain.com/admin`.

## Why Manual Import?

The CMS API at `cms.molochain.com/api` is **read-only** (only supports GET/HEAD requests). Content must be added through the Filament admin panel.

## Import Instructions

### Step 1: Log in to CMS Admin
1. Go to https://cms.molochain.com/admin
2. Log in with admin credentials

### Step 2: Import Blog Posts
1. Navigate to **Blog > Posts**
2. Click **Import** or use Filament's import feature
3. Upload `blog-posts.json` or manually add each post

### Step 3: Import Testimonials
1. Navigate to **Testimonials**
2. Import `testimonials.json` or add manually

### Step 4: Import FAQs
1. Navigate to **FAQs**
2. Import `faqs.json` or add manually

### Step 5: Import Team Members
1. Navigate to **Team**
2. Import `team-members.json` or add manually

## File Contents

| File | Records | Description |
|------|---------|-------------|
| `blog-posts.json` | 6 | Industry articles about logistics, supply chain, customs |
| `testimonials.json` | 6 | Customer reviews with ratings |
| `faqs.json` | 10 | Common questions organized by category |
| `team-members.json` | 8 | Executive and department leadership profiles |

## Fallback Content

If the CMS is empty, the website automatically displays demo content from:
`client/src/data/demoContent.ts`

This ensures users always see content on Blog, Team, FAQ, and Testimonials pages.
