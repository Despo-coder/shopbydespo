import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { NextRequest, NextResponse } from "next/server"
import fs from "fs/promises"

export async function GET(
  req: NextRequest,
  { params: { id } }: { params: { id: string } }
) {
  const product = await db.product.findUnique({
    where: { id },
    select: { filePath: true, name: true, type: true },
  })

  if (product == null) return notFound()

  if (product.type === 'physical'|| !product.filePath) {
    return new NextResponse(JSON.stringify({ message: "Downloads are only available for digital products" }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const { size } = await fs.stat(product.filePath)
  const file = await fs.readFile(product.filePath)
  const extension = product.filePath.split(".").pop()

  return new NextResponse(file, {
    headers: {
      "Content-Disposition": `attachment; filename="${product.name}.${extension}"`,
      "Content-Length": size.toString(),
    },
  })
}
