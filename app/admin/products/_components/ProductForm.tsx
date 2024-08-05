"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { formatCurrency } from "@/lib/formatters"
import { useState } from "react"
import { addProduct, updateProduct } from "../../_actions/products"
import { useFormState, useFormStatus } from "react-dom"
import { Product, ProductImage } from "@prisma/client"
import Image from "next/image"
import toast from "react-hot-toast"

type ProductWithImages = Product & { images: ProductImage[] }

export function ProductForm({ product }: { product?: ProductWithImages | null }) {
  const [error, action] = useFormState(
    product == null ? addProduct : updateProduct.bind(null, product.id!),
    {}
  )

  const [priceInCents, setPriceInCents] = useState<number | string>(
    product?.priceInCents ?? ''
  )

  const [productType, setProductType] = useState(product?.type || 'digital');
  
//console.log(product)

const handleSubmit = async (e:any) => { 
  e.preventDefault();

}



  return (
    <form action={action} className="space-y-8" >
      <div className="space-y-2 space-x-2">
        <Label htmlFor="type">Product Type</Label>
        <select 
          id="type" 
          name="type" 
          value={productType}
          onChange={(e) => setProductType(e.target.value)}
          required
          className="bg-transparent border-b-2 border-t-slate-500 rounded-xl p-2 focus:border-t-slate-200 focus:outline-none"
        >
          <option value="digital">Digital</option>
          <option value="physical">Physical</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          type="text"
          id="name"
          name="name"
          required
          defaultValue={product?.name || ""}
        />
        {error.name && <div className="text-destructive">{error.name}</div>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="priceInCents">Price In Cents</Label>
        <Input
          type="number"
          id="priceInCents"
          name="priceInCents"
          required
          value={priceInCents}
          onChange={e => {
            const value = e.target.value;
            setPriceInCents(value === '' ? '' : Number(value));
          }}
        />
        <div className="text-muted-foreground">
          {formatCurrency(Number(priceInCents || 0) / 100)}
        </div>
        {error.priceInCents && (
          <div className="text-destructive">{error.priceInCents}</div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          required
          defaultValue={product?.description}
        />
        {error.description && (
          <div className="text-destructive">{error.description}</div>
        )}
      </div>

     

      {productType === 'physical' && (
        <div className="space-y-2">
          <Label htmlFor="stockQuantity">Stock Quantity</Label>
          <Input
            type="number"
            id="stockQuantity"
            name="stockQuantity"
            defaultValue={product?.stockQuantity || 0}
          />
        </div>
      )}

      {productType === 'digital' && (
        <div className="space-y-2">
          <Label htmlFor="file">File</Label>
          <Input type="file" id="file" name="file" required={product == null} />
          {product != null && (
            <div className="text-muted-foreground">{product.filePath}</div>
          )}
          {error.file && <div className="text-destructive">{error.file}</div>}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="images">Images</Label>
        <Input type="file" id="images" name="images" multiple accept="image/*" />

        {product?.images && product.images.length > 0 && (
  <div className="flex flex-wrap gap-2 mt-2">
    {product.images.map((image) => (
      <Image
        key={image.id}
        src={image.imagePath}
        height={150}
        width={150}
        alt="Product Image"
      />
    ))}
  </div>
)}

        {error.images && <div className="text-destructive">{error.images}</div>}
      </div>
      <div className="flex  items-center  gap-4 space-y-2">
        <Label htmlFor="isFeatured" className="mt-2">Featured Product ?</Label>
        <Input
          type="checkbox"
          id="isFeatured"
          name="isFeatured"
          defaultChecked={product?.isFeatured || false}
          className=" w-4 h-4"
        />
      </div>

      <SubmitButton />
    </form>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save"}
    </Button>
  )
}
