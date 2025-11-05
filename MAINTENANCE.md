# 🧭 Project Maintenance Guide

> **Applies to:** Astro 5 / Starlight 0.36 / Svelte 5 / Tailwind 4 / pnpm 9  
> **Maintained by:** Dan Gilleland/Dynamic Generation Inc.

---

[![Build](https://img.shields.io/github/actions/workflow/status/dagilleland/cpsc-1520-dg/ci.yml?label=Build&logo=github)](../../actions)
[![Security Audit](https://img.shields.io/badge/Security-Audit%20Passing-brightgreen?logo=npm)](#security-audit)
[![Type Check](https://img.shields.io/badge/TypeScript-Check%20Passing-3178C6?logo=typescript)](#type--test-check)
[![pnpm](https://img.shields.io/badge/Package%20Manager-pnpm%209.9.0-F69220?logo=pnpm)](https://pnpm.io)

---

## 🗓 Weekly Tasks

### 1. Security Audit
```powershell
pnpm audit
```
- Fix issues via normal updates.  
- If a transitive dependency remains vulnerable, use `pnpm.overrides` to pin a patched version and rebuild.

### 2. Outdated Dependencies
```powershell
pnpm outdated
```
- Safe to bump patch/minor releases directly.  
- Test before upgrading major versions.

### 3. Type & Test Check
```powershell
pnpm astro check
pnpm test
```

### 4. Build Sanity
```powershell
pnpm build
Get-ChildItem -Recurse dist -Filter *.map | Select-String "@babel/runtime"
```
- No matches = no stray Babel helpers.

---

## 🗓 Monthly Tasks

### 1. Clean Install
```powershell
Remove-Item -Recurse -Force node_modules, pnpm-lock.yaml
pnpm install
```

### 2. Prune Global pnpm Store
```powershell
pnpm store prune
```
Removes cached packages no longer referenced by any project.

### 3. Re-resolve to Surface Deprecations
```powershell
pnpm install --resolution-only
```
If you see messages like  
` WARN  deprecated subdependencies found: sitemap@8.0.0`

Trace them:
```powershell
pnpm why <pkg>
pnpm list <pkg> --depth Infinity
pnpm view <pkg> deprecated
```

Mute unavoidable deprecations temporarily:
```json
{
  "pnpm": {
    "allowedDeprecatedVersions": {
      "sitemap": "*"
    }
  }
}
```

### 4. Unused Dependency Sweep
```powershell
pnpm add -D depcheck
npx depcheck
```
Remove unused packages and reinstall.

### 5. VS Code / TypeScript Hygiene
- Command Palette → **TypeScript: Select TypeScript Version → Use Workspace Version**  
- Command Palette → **TypeScript: Restart TS Server**  
- If `astro/tsconfigs/strict` shows “file not found,” a clean install fixes it.  
  Last resort:
  ```json
  "extends": "./node_modules/astro/tsconfigs/strict.json"
  ```

---

## 🚀 Pre-Release Checklist

1. **Lock Node & pnpm versions**
   - Create `.nvmrc` or `.node-version` (e.g., `20.x`) for CI consistency.

2. **Immutable Build**
   ```powershell
   Remove-Item -Recurse -Force node_modules, pnpm-lock.yaml
   pnpm install --frozen-lockfile
   pnpm astro check && pnpm test && pnpm build
   ```

3. **Smoke-Test Production**
   ```powershell
   pnpm preview
   ```

4. **Final Security Check**
   ```powershell
   pnpm audit
   ```

---

## 🧰 Helpful Scripts (optional)

Add to your `package.json`:

```json
{
  "scripts": {
    "check:types": "astro check",
    "check:sec": "pnpm audit",
    "check:outdated": "pnpm outdated",
    "clean:full": "powershell -NoProfile -Command \"Remove-Item -Recurse -Force node_modules, pnpm-lock.yaml; pnpm install; pnpm store prune\"",
    "verify:dist": "powershell -NoProfile -Command \"Get-ChildItem -Recurse dist -Filter *.map | Select-String '@babel/runtime'\"",
    "prerelease": "pnpm clean:full && pnpm check:types && pnpm test && pnpm build && pnpm check:sec"
  }
}
```

---

## ⚙️ Optional CI Skeleton (GitHub Actions)

```yaml
name: ci
on:
  pull_request:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm astro check
      - run: pnpm test
      - run: pnpm build
      - run: pnpm audit --audit-level=moderate
```

---

## 📝 Stack-Specific Notes

- **Tailwind v4 + Astro:** use `@tailwindcss/vite` plugin directly—no `@astrojs/tailwind` needed.  
- **Transitive fixes:** prefer parent package updates; if unavailable, apply `pnpm.overrides` and rebuild.  
- **Static sites:** even though most code is pre-rendered, audits and dependency hygiene still matter for future updates.

---

## 🧩 Quick Recovery

If your project becomes unstable after dependency updates, TypeScript misfires, or Astro shows missing type errors, follow this reset sequence.

### 1. Remove cached and generated artifacts
```powershell
Remove-Item -Recurse -Force node_modules, pnpm-lock.yaml, .astro, dist
```

### 2. Reinstall dependencies
```powershell
pnpm install
```

### 3. Prune global pnpm cache (optional)
```powershell
pnpm store prune
```

### 4. Restart VS Code TypeScript service
- Command Palette → **TypeScript: Restart TS Server**

### 5. Rebuild cleanly
```powershell
pnpm build
```

If problems persist, verify TypeScript is using the workspace version (not VS Code’s bundled one) and confirm the correct Node version is active:
```powershell
node -v
pnpm -v
```

---

_Last updated: 2025-11-05_
