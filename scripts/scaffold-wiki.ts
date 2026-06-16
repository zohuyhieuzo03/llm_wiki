/**
 * Scaffold a new LLM Wiki project on disk (no desktop app required).
 *
 * Usage:
 *   node --experimental-strip-types scripts/scaffold-wiki.ts <name> <parent-dir> [template-id]
 *
 * Template ids: general | business | research | reading | personal
 */
import { mkdir, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { getProjectScaffoldFiles } from "../src/lib/project-scaffold.ts"
import { getTemplate, templates } from "../src/lib/templates.ts"

const CORE_DIRS = [
  "raw/sources",
  "raw/assets",
  "wiki/entities",
  "wiki/concepts",
  "wiki/sources",
  "wiki/queries",
  "wiki/comparisons",
  "wiki/synthesis",
]

async function main(): Promise<void> {
  const [name, parentDir, templateId = "general"] = process.argv.slice(2)
  if (!name?.trim() || !parentDir?.trim()) {
    console.error(
      "Usage: node --experimental-strip-types scripts/scaffold-wiki.ts <name> <parent-dir> [template-id]",
    )
    console.error(
      `Templates: ${templates.map((t) => t.id).join(" | ")}`,
    )
    process.exit(1)
  }

  const template = getTemplate(templateId)
  const root = join(parentDir, name)
  const absolutePath = root.replace(/\\/g, "/")

  const scaffoldFiles = getProjectScaffoldFiles(name, template, absolutePath)

  for (const dir of [...CORE_DIRS, ...template.extraDirs]) {
    await mkdir(join(root, dir), { recursive: true })
  }

  for (const file of scaffoldFiles) {
    const target = join(root, file.relativePath)
    await mkdir(join(target, ".."), { recursive: true })
    await writeFile(target, file.content, "utf8")
  }

  console.log(`Created wiki project: ${absolutePath}`)
  console.log(`Template: ${template.icon} ${template.name} (${template.id})`)
  console.log("")
  console.log("Next steps:")
  console.log(`  1. cd ${absolutePath}`)
  console.log("  2. Edit purpose.md — goals, scope, key questions")
  console.log("  3. Open in LLM Wiki app or add to Cursor workspace")
  console.log("  4. Drop sources in raw/sources/ → ingest")
}

main().catch((err: unknown) => {
  console.error(err)
  process.exit(1)
})
