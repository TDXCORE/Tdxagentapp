import { NextResponse } from "next/server"
import { resolveModule } from "@/lib/module-resolver"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const modulePath = url.searchParams.get("module") || "@/components/kpi-cards"
  const exportName = url.searchParams.get("export") || "KpiCards"

  try {
    const result = await resolveModule(modulePath)

    if (result.success) {
      const exports = result.exports
      const hasExport = exports.includes(exportName)
      const exportType = hasExport ? typeof result.module[exportName] : "not found"

      return NextResponse.json({
        success: true,
        modulePath,
        exports,
        hasExport,
        exportName,
        exportType,
      })
    } else {
      return NextResponse.json({
        success: false,
        modulePath,
        error: result.error,
        stack: result.stack,
      })
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      modulePath,
      error: error.message,
      stack: error.stack,
    })
  }
}
