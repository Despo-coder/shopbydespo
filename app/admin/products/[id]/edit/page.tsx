import { db } from "@/lib/db"
import PageHeader from "@/app/admin/_components/PageHeader"
import { ProductForm } from "../../_components/ProductForm"

export default async function EditProductPage({
  params: { id },
}: {
  params: { id: string }
}) {
  const product = await db.product.findUnique({
    where: { id },
    include: { 
      images: true,
      sizes: true,
      colors: true,
      categories: true
    }
  });
  

  return (
    <>
      <PageHeader>Edit Product</PageHeader>
      <ProductForm product={ product} />
    </>
  )
}