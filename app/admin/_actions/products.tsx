"use server"

import { db } from "@/lib/db"
import { productSchema } from "../_schemas/productSchema"
import fs from "fs/promises"
import { notFound, redirect } from "next/navigation"
import { revalidatePath } from "next/cache"


export async function addProduct(prevState: unknown, formData: FormData) {
  const data = {
    name: formData.get('name')?.toString(),
    description: formData.get('description')?.toString(),
    priceInCents: Number(formData.get('priceInCents')),
    type: formData.get('type')?.toString(),
    file: formData.get('file') as File,
    images: Array.from(formData.getAll('images')) as File[],
    stockQuantity: Number(formData.get('stockQuantity')),
    sizes: JSON.parse(formData.get('sizes')?.toString() || '[]'),
    colors: JSON.parse(formData.get('colors')?.toString() || '[]'),
    categories: JSON.parse(formData.get('categories')?.toString() || '[]'),
    isFeatured: formData.get('isFeatured') === 'on'
  };

  const result = productSchema.safeParse(data);
  if (result.success === false) {
    return result.error.formErrors.fieldErrors;
  }

  const { data: validatedData } = result;

  console.log('Create Result',result)
  
  let filePath = null;
  if (validatedData.type === 'digital' && validatedData.file) {
    await fs.mkdir("products", { recursive: true });
    filePath = `products/${crypto.randomUUID()}-${validatedData.file.name}`;
    await fs.writeFile(filePath, Buffer.from(await validatedData.file.arrayBuffer()));
  }

  await fs.mkdir("public/products", { recursive: true });
  const imagePaths = await Promise.all((validatedData.images || []).map(async (image) => {
    const imagePath = `/products/${crypto.randomUUID()}-${image.name}`;
    await fs.writeFile(`public${imagePath}`, Buffer.from(await image.arrayBuffer()));
    return imagePath;
  }));
  console.log('Image paths being sent to DB:', imagePaths);

  const createdProduct = await db.product.create({
   
    data: {
      isAvailableForPurchase: false,
      name: validatedData.name,
      description: validatedData.description,
      priceInCents: validatedData.priceInCents,
      type: validatedData.type,
      filePath,
      imagePath: imagePaths[0], // Use the first image as the main image path
      isFeatured: validatedData.isFeatured || false,
      stockQuantity: validatedData.stockQuantity,
      images: {
        create: imagePaths.map(path => ({ imagePath: path }))
      },
      sizes: {
        connect: validatedData.sizes?.map(sizeId => ({ id: sizeId })) || []
      },
      colors: {
        connect: validatedData.colors?.map(colorId => ({ id: colorId })) || []
      },
      categories: {
        connect: validatedData.categories.map(categoryId => ({ id: categoryId }))
      }
    },
  });
console.log('Created Product',createdProduct)
 

  revalidatePath("/");
  revalidatePath("/products");

  redirect("/admin/products");
}


export async function updateProduct(id: string, prevState: unknown, formData: FormData) {
  // Extract form data manually
  const data = {
    name: formData.get('name')?.toString(),
    description: formData.get('description')?.toString(),
    priceInCents: Number(formData.get('priceInCents')),
    type: formData.get('type')?.toString(),
    file: formData.get('file') as File,
    images: Array.from(formData.getAll('images')) as File[],
    stockQuantity: Number(formData.get('stockQuantity')),
    sizes: JSON.parse(formData.get('sizes')?.toString() || '[]'),
    colors: JSON.parse(formData.get('colors')?.toString() || '[]'),
    categories: JSON.parse(formData.get('categories')?.toString() || '[]'),
    isFeatured: formData.get('isFeatured') === 'on'
  };

  const result = productSchema.safeParse(data);
  if (result.success === false) {
    return result.error.formErrors.fieldErrors;
  }

  const { data: validatedData } = result;
  //console.log('Update Result',result)

  const product = await db.product.findUnique({
    where: { id },
    include: { images: true }
  });
  if (product == null) return notFound();
  

 // Delete all existing image files
 await Promise.all(product.images.map(async (image) => {
  await fs.unlink(`public${image.imagePath}`).catch(() => {});
}));

let filePath = product.filePath;
if (validatedData.type === 'digital' && validatedData.file && validatedData.file.size > 0) {
  if (filePath) await fs.unlink(filePath).catch(() => {});
  filePath = `products/${crypto.randomUUID()}-${validatedData.file.name}`;
  await fs.writeFile(filePath, Buffer.from(await validatedData.file.arrayBuffer()));
}



 const newImagePaths = await Promise.all((validatedData.images || []).map(async (image) => {
  const imagePath = `/products/${crypto.randomUUID()}-${image.name}`;
  await fs.writeFile(`public${imagePath}`, Buffer.from(await image.arrayBuffer()));
  return imagePath;
}));


  await db.product.update({
    where: { id },
    data: {
      name: validatedData.name,
      description: validatedData.description,
      priceInCents: validatedData.priceInCents,
      type: validatedData.type,
      filePath,
      isFeatured: validatedData.isFeatured || false,
      stockQuantity: validatedData.stockQuantity,
      images: {
       deleteMany: {}, // Delete all previous images
        create: newImagePaths.map(path => ({ imagePath: path }))
      },
      sizes: {
        connect: validatedData.sizes?.map(sizeId => ({ id: sizeId })) || []
      },
      colors: {
        connect: validatedData.colors?.map(colorId => ({ id: colorId })) || []
      },
      categories: {
        connect: validatedData.categories.map(categoryId => ({ id: categoryId }))
      }
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/products");
 // revalidatePath("/products");

  redirect("/admin/products");
}


export async function toggleProductAvailability(
  id: string,
  isAvailableForPurchase: boolean
) {
  await db.product.update({ where: { id }, data: { isAvailableForPurchase } })

  revalidatePath("/")
  //revalidatePath("/products")
}

export async function deleteProduct(id: string) {
  const product = await db.product.delete({ where: { id } })

  if (product.filePath) {
    await fs.unlink(product.filePath).catch(() => {});
  }
  if (product.imagePath) {
    await fs.unlink(`public${product.imagePath}`).catch(() => {});
  }
  // if (product == null) return notFound()
  //   if (product.filePath) {
     
  // await fs.unlink(product.filePath)
  // await fs.unlink(`public${product.imagePath}`)
  //   }
  revalidatePath("/")
  revalidatePath("/admin/products")
}