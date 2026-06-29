import { describe, expect, it } from "vitest"
import { getTemplate } from "@/lib/templates"
import {
  buildWikiIndex,
  getProjectScaffoldFiles,
} from "@/lib/project-scaffold"

describe("project-scaffold", () => {
  it("includes business-specific index sections", () => {
    const template = getTemplate("business")
    const index = buildWikiIndex(template)
    expect(index).toContain("## Projects")
    expect(index).toContain("## Slide Decks")
    expect(index).toContain("## Decisions")
  })

  it("emits project-specific agent skills and readme for new projects", () => {
    const template = getTemplate("general")
    const files = getProjectScaffoldFiles("my-wiki", template, "/tmp/my-wiki")
    const paths = files.map((f) => f.relativePath)
    expect(paths).toContain(".agents/skills/my-wiki-ingest/SKILL.md")
    expect(paths).toContain(".agents/skills/my-wiki-query/SKILL.md")
    expect(paths).toContain(".agents/skills/my-wiki-lint/SKILL.md")
    expect(paths).toContain("README.md")
    expect(paths).toContain(".gitignore")

    const ingest = files.find((f) => f.relativePath.endsWith("my-wiki-ingest/SKILL.md"))
    expect(ingest?.content).toContain("name: my-wiki-ingest")
  })
})
