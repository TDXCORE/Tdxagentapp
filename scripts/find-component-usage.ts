// This is a utility script to find all usages of a specific component
// You can run it with: npx ts-node scripts/find-component-usage.ts

import * as fs from "fs"
import * as path from "path"

const targetComponent = "KpiCards"
const rootDir = path.resolve(__dirname, "..")

function findComponentUsageInFile(filePath: string): void {
  try {
    const content = fs.readFileSync(filePath, "utf8")

    // Check for import statements
    const importRegex = new RegExp(`import\\s+{[^}]*\\b${targetComponent}\\b[^}]*}\\s+from`, "g")
    const matches = content.match(importRegex)

    if (matches) {
      console.log(`Found in ${filePath}:`)
      matches.forEach((match) => console.log(`  ${match}`))
    }

    // Also check for direct usage
    const usageRegex = new RegExp(`<${targetComponent}\\b`, "g")
    const usageMatches = content.match(usageRegex)

    if (usageMatches && !matches) {
      console.log(`Usage found in ${filePath} but import not detected:`)
      usageMatches.forEach((match) => console.log(`  ${match}`))
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
      findComponentUsageInFile(filePath)
    }
  }
}

console.log(`Searching for usages of '${targetComponent}'...`)
walkDirectory(rootDir)
