// This utility helps diagnose module loading issues

export async function resolveModule(modulePath: string) {
  try {
    const module = await import(modulePath)
    return {
      success: true,
      exports: Object.keys(module),
      module,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      stack: error.stack,
    }
  }
}

export function checkExports(module: any, exportNames: string[]) {
  const results: Record<string, boolean> = {}

  for (const name of exportNames) {
    results[name] = typeof module[name] === "function" || typeof module[name] === "object"
  }

  return results
}
