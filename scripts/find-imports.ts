// This is a utility script to find all imports of a specific function
// You can run it with: npx ts-node scripts/find-imports.ts

import * as fs from "fs"
import * as path from "path"

const targetFunction = "createClientSide"
const targetModule = "@/lib/supabase/client"
const rootDir = path.resolve(__dirname, "..")

function findImportsInFile(filePath: string): void {
  try {
    const content = fs.readFileSync(filePath, "utf8")

    // Check for import statements
    const importRegex = new RegExp(
      `import\\s+{[^}]*\\b${targetFunction}\\b[^}]*}\\s+from\\s+['"]${targetModule}['"]`,
      "g",
    )
    const matches = content.match(importRegex)

    if (matches) {
      console.log(`Found in ${filePath}:`)
      matches.forEach((match) => console.log(`  ${match}`))
    }

    // Also check for direct usage
    const usageRegex = new RegExp(`\\b${targetFunction}\\(`, "g")
    const usageMatches = content.match(usageRegex)

    if (usageMatches && !matches) {
      console.log(`Usage found in ${filePath} but import not detected`)
    }
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error)
  }
}

function walkDirectory(dir: string): void {
  const files = fs.readdirSync(dir)

  for (const file of files) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory() && !filePath.includes("node_modules") && !filePath.includes(".next")) {
      walkDirectory(filePath)
    } else if (stat.isFile() && (filePath.endsWith(".ts") || filePath.endsWith(".tsx"))) {
      findImportsInFile(filePath)
    }
  }
}

console.log(`Searching for imports of '${targetFunction}' from '${targetModule}'...`)
walkDirectory(rootDir)
