import type { WikiTemplate } from "@/lib/templates"

const CORE_INDEX_SECTIONS = [
  { heading: "Entities", hint: "<!-- services, repos, people, tools -->" },
  { heading: "Concepts", hint: "<!-- patterns, techniques, frameworks -->" },
  { heading: "Sources", hint: "<!-- summaries of ingested external docs -->" },
  { heading: "Queries", hint: "<!-- open investigations -->" },
  { heading: "Comparisons", hint: "" },
  { heading: "Synthesis", hint: "<!-- cross-cutting summaries -->" },
] as const

const EXTRA_INDEX_SECTIONS: Record<string, string> = {
  "wiki/methodology": "Methodology",
  "wiki/findings": "Findings",
  "wiki/thesis": "Thesis",
  "wiki/characters": "Characters",
  "wiki/themes": "Themes",
  "wiki/plot-threads": "Plot Threads",
  "wiki/chapters": "Chapters",
  "wiki/goals": "Goals",
  "wiki/habits": "Habits",
  "wiki/reflections": "Reflections",
  "wiki/journal": "Journal",
  "wiki/meetings": "Meetings",
  "wiki/decisions": "Decisions",
  "wiki/projects": "Projects",
  "wiki/stakeholders": "Stakeholders",
  "wiki/slides": "Slide Decks",
}

export interface ProjectScaffoldFile {
  relativePath: string
  content: string
}

export function buildWikiIndex(template: WikiTemplate): string {
  const lines = [
    `# ${template.name} Wiki Index`,
    "",
    "Central catalog for this knowledge base. LLM: read this file first when answering queries.",
    "",
    "---",
    "",
    "## Overview",
    "",
    "- [[overview]] — high-level summary and current focus",
    "",
  ]

  for (const section of CORE_INDEX_SECTIONS) {
    lines.push(`## ${section.heading}`, "")
    if (section.hint) lines.push(section.hint, "")
  }

  for (const dir of template.extraDirs) {
    const heading = EXTRA_INDEX_SECTIONS[dir]
    if (!heading) continue
    if (CORE_INDEX_SECTIONS.some((s) => s.heading === heading)) continue
    lines.push(`## ${heading}`, "")
  }

  lines.push("---", "", "See [[log]] for chronological activity.", "")
  return lines.join("\n")
}

export function buildWikiLog(projectName: string, today: string): string {
  return [
    `# ${projectName} Log`,
    "",
    "Append-only activity log. Format: `## [YYYY-MM-DD] | action | Title`",
    "",
    "---",
    "",
    `## [${today}] | setup | Project created`,
    "",
    `- Template scaffold initialized`,
    "",
  ].join("\n")
}

export function buildWikiOverview(template: WikiTemplate): string {
  return [
    "---",
    "type: overview",
    `title: ${template.name} Overview`,
    "tags: []",
    "related: []",
    `created: ${todayIso()}`,
    `updated: ${todayIso()}`,
    "---",
    "",
    `# ${template.name} Overview`,
    "",
    "<!-- High-level summary of what this wiki covers and its current state. Update as knowledge compounds. -->",
    "",
  ].join("\n")
}

export function buildProjectReadme(
  projectName: string,
  template: WikiTemplate,
  absolutePath: string,
): string {
  return [
    `# ${projectName}`,
    "",
    `LLM Wiki project — **${template.name}** template (${template.icon} ${template.description}).`,
    "",
    "## Structure",
    "",
    "```",
    `${projectName}/`,
    "├── schema.md          # Rules for LLM agent (page types, naming, operations)",
    "├── purpose.md         # Goals, scope, open questions",
    "├── raw/",
    "│   ├── sources/       # Immutable inputs (never edited by LLM)",
    "│   └── assets/        # Images and attachments",
    "└── wiki/",
    "    ├── index.md       # Content catalog — read first",
    "    ├── log.md         # Append-only changelog",
    "    ├── overview.md",
    "    └── …              # typed page directories",
    "```",
    "",
    "## Open in LLM Wiki app",
    "",
    "1. Launch LLM Wiki desktop app",
    `2. **Open Project** → select \`${absolutePath}\``,
    "",
    "Requires `schema.md` + `wiki/` at project root.",
    "",
    "## Open in Cursor",
    "",
    "Add this folder to your workspace. Agent should read `schema.md` and `purpose.md` before ingest/query/lint.",
    "",
    "### Agent skills (`.agents/skills/`)",
    "",
    "| Skill | Invoke when |",
    "|-------|-------------|",
    "| **wiki-ingest** | Import docs, document investigations, file raw + wiki pages |",
    "| **wiki-query** | Search wiki markdown, cite paths, file answers to `queries/` / `synthesis/` |",
    "| **wiki-lint** | Health check — broken links, orphans, stale claims |",
    "| **llm-wiki** | Optional — LLM Wiki **desktop app** on `:19828` (hybrid search, graph) |",
    "",
    "Filesystem skills work without the desktop app.",
    "",
    "## Operations",
    "",
    "| Operation | When |",
    "|-----------|------|",
    "| **Ingest** | New source, investigation, meeting notes |",
    "| **Query** | Ask agent; file answers back as wiki pages |",
    "| **Lint** | Weekly or after major changes |",
    "",
    "See `schema.md` for full conventions.",
    "",
  ].join("\n")
}

export const PROJECT_GITIGNORE = [
  "# LLM Wiki desktop app runtime (regenerated on open/rescan)",
  ".llm-wiki/",
  "",
  "# Obsidian editor local state",
  ".obsidian/",
  "",
  "# OS / editor",
  ".DS_Store",
  "*.swp",
  "*~",
  "",
].join("\n")

export function getProjectScaffoldFiles(
  projectName: string,
  template: WikiTemplate,
  absolutePath: string,
  today = todayIso(),
): ProjectScaffoldFile[] {
  return [
    { relativePath: "schema.md", content: template.schema },
    { relativePath: "purpose.md", content: template.purpose },
    { relativePath: "README.md", content: buildProjectReadme(projectName, template, absolutePath) },
    { relativePath: ".gitignore", content: PROJECT_GITIGNORE },
    { relativePath: "wiki/index.md", content: buildWikiIndex(template) },
    { relativePath: "wiki/log.md", content: buildWikiLog(projectName, today) },
    { relativePath: "wiki/overview.md", content: buildWikiOverview(template) },
    ...getAgentSkillFiles(projectName),
  ]
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

function getAgentSkillFiles(projectName: string): ProjectScaffoldFile[] {
  const skillRoot = ".agents/skills"
  return [
    {
      relativePath: `${skillRoot}/wiki-ingest/SKILL.md`,
      content: buildIngestSkill(projectName),
    },
    {
      relativePath: `${skillRoot}/wiki-query/SKILL.md`,
      content: buildQuerySkill(projectName),
    },
    {
      relativePath: `${skillRoot}/wiki-lint/SKILL.md`,
      content: buildLintSkill(projectName),
    },
  ]
}

function buildIngestSkill(projectName: string): string {
  return `---
name: wiki-ingest
description: >-
  Ingest new sources into the ${projectName} markdown knowledge base. Use when
  the user asks to ingest, import, document, or file knowledge from external docs,
  investigations, PRs, or meeting notes. Reads schema.md and purpose.md, writes
  raw snapshots and synthesized wiki pages, updates index.md and log.md.
  Not for the LLM Wiki desktop app API unless user explicitly requests rescan.
---

# Wiki Ingest — ${projectName}

Turn external knowledge into **compounding wiki pages**, not chat-only summaries.

## Prerequisites

Read before writing:

1. \`schema.md\` — page types, naming, frontmatter, log format
2. \`purpose.md\` — goals, open questions, scope
3. \`wiki/index.md\` — existing catalog (avoid duplicates)

## Ingest Standards

1. **Raw is immutable** — save originals under \`raw/sources/\`; never edit raw after write.
2. **Wiki is synthesized** — summaries, cross-links; link out to external systems.
3. **One ingest touches many pages** — expect several wiki updates per significant source.
4. **Separate fact vs inference** — mark doc-vs-reality drift explicitly.
5. **Every ingest updates index + log** — no orphan pages outside the catalog.

## Workflow

1. Fetch or read source.
2. Write raw snapshot under \`raw/sources/{category}/\` with YAML header when external.
3. Create or update \`wiki/sources/{slug}.md\` — summary + links to raw.
4. Update related entity/concept/project pages per \`schema.md\` routing table.
5. Append \`wiki/log.md\`: \`## [YYYY-MM-DD] | ingest | Title\`
6. Update \`wiki/index.md\` entries.

## Quality Gate

- [ ] Raw saved under \`raw/sources/\` (if external source)
- [ ] No secrets in wiki pages
- [ ] \`wiki/index.md\` lists every new page
- [ ] \`wiki/log.md\` has append-only entry with correct action prefix
- [ ] Wikilinks point to real files
`
}

function buildQuerySkill(projectName: string): string {
  return `---
name: wiki-query
description: >-
  Query the ${projectName} markdown knowledge base. Use when the user asks what
  this wiki says about a topic, search the wiki, or ground answers in filed pages.
  Reads index.md first, cites wiki paths. Files valuable answers to wiki/queries/
  or synthesis/. Not the LLM Wiki desktop app — use llm-wiki skill for API on :19828.
---

# Wiki Query — ${projectName}

## Workflow

1. Read \`schema.md\` + \`purpose.md\`
2. Read \`wiki/index.md\` → shortlist relevant pages
3. Read pages; grep \`wiki/\` and \`raw/sources/\` for keywords if needed
4. Synthesize answer with \`wiki/...\` path citations
5. File durable answers to \`wiki/queries/\` or \`wiki/synthesis/\` + update log

## Output Format

1. **Direct answer** (2–4 sentences)
2. **Evidence** — bullets with wiki path citations
3. **Gaps** — what wiki does not cover
4. **Filed** — paths if pages were created/updated
`
}

function buildLintSkill(projectName: string): string {
  return `---
name: wiki-lint
description: >-
  Health-check the ${projectName} markdown knowledge base. Use when the user asks
  to lint, audit, or maintain the wiki; check orphan pages, broken wikilinks, or
  index drift. Filesystem-based; not the LLM Wiki desktop Lint tab.
---

# Wiki Lint — ${projectName}

## Checklist

| Check | Severity | Fix |
|-------|----------|-----|
| Broken \`[[link]]\` | warning | Fix path or create target page |
| Orphan page | info | Add inbound link from index or related page |
| Missing from index.md | warning | Add catalog entry |
| Invalid frontmatter | warning | Add YAML per schema.md |
| Contradiction between pages | action | Follow schema Contradiction Handling |

## Workflow

1. Read \`schema.md\` + \`wiki/index.md\`
2. Structural pass (links, orphans, index drift)
3. Semantic pass (stale claims vs purpose.md)
4. Write lint report; apply minimal fixes if asked
5. Append \`wiki/log.md\`: \`## [YYYY-MM-DD] | lint | ...\`
`
}
