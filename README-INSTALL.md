
# Milk Center Management System - Installation Guide

## Quick Start (NPM Only)

This project has been configured to use **NPM only** - no Bun, no Yarn, no Git dependencies.

### Step 1: Install Dependencies

```bash
node install.js
```

If that fails, try the npm-only installer:

```bash
node install-npm-only.js
```

### Step 2: Start the Application

```bash
npm run dev
```

Or use the startup script:

```bash
node start.js
```

## Troubleshooting

### If you get bun errors:
- The project no longer uses bun
- All bun configuration files have been removed
- Use `npm` commands only

### If installation fails:
1. Clear npm cache: `npm cache clean --force`
2. Remove node_modules: `rm -rf node_modules`
3. Run: `node install.js`

### For Git-related errors:
- All Git operations have been disabled in .npmrc
- The project uses tarball downloads only
- No Git repositories are cloned during installation

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Features

- ✅ Customer Management
- ✅ Product Management  
- ✅ Invoice Generation
- ✅ Order Entry / Track Sheets
- ✅ Payment Tracking
- ✅ Analytics & Reports
- ✅ Electron Desktop App Support
