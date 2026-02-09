# Image Migration (public/images -> S3 image_key)

## 1) Generate plan files

```bash
npm run plan:image-migration
```

Output: `scripts/output/image-migration`

- `manifest.json`: local file -> new S3 key mapping
- `upload.ps1`: Windows upload commands
- `upload.sh`: Linux/macOS upload commands
- `update-image-key.sql`: DB update SQL

## 2) Upload files to S3

PowerShell:

```powershell
Get-Content scripts/output/image-migration/upload.ps1 | Invoke-Expression
```

or run line-by-line.

## 3) Update DB image_key

Execute:

`scripts/output/image-migration/update-image-key.sql`

## 4) Verify

- check random keys in S3 bucket
- check DB `heroes.image_key`, `pets.image_key`
- check frontend renders via `${VITE_CDN_BASE_URL}/${imageKey}`

## Optional arguments

```bash
node scripts/generate-image-migration-plan.mjs \
  --bucket=senawiki-assets \
  --heroesDir=public/images/heroes \
  --petsDir=public/images/pets \
  --outDir=scripts/output/image-migration \
  --heroesTable=heroes \
  --petsTable=pets \
  --idColumn=id
```
