"use server"

import { db } from "@/lib/db"
import { productSchema } from "../_schemas/productSchema"
import fs from "fs/promises"
import { notFound, redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { Product, ProductImage, Size, Color, Category,SubCategory, ProductType } from '@prisma/client'; // Adjust import path if needed

// Define a type for the product with related fields
type ProductWithRelations = Product & {
  images: ProductImage[];
  sizes: Size[];
  colors: Color[];
  categories: Category[];
};

export async function addProduct(prevState: unknown, formData: FormData) {
  const data = {
    name: formData.get('name')?.toString(),
    description: formData.get('description')?.toString(),
    priceInCents: Number(formData.get('priceInCents')),
    type: formData.get('type')?.toString() as ProductType,
    file: formData.get('file') as File,
    images: Array.from(formData.getAll('images')) as File[],
    stockQuantity: Number(formData.get('stockQuantity')),
    sizes: Array.from(formData.getAll('sizes')),
    colors: Array.from(formData.getAll('colors')),
    categories: Array.from(formData.getAll('categories')),
    subCategories: Array.from(formData.getAll('subCategories')),
    isFeatured: formData.get('isFeatured') === 'on'
  };
//console.log(data)

  const result = productSchema.safeParse(data);
  if (!result.success) {
    console.log(result.error.formErrors.fieldErrors)
    return result.error.formErrors.fieldErrors;
  }

  const { data: validatedData } = result;

  console.log('Create Result', validatedData);
  
  let filePath = null;
  if (validatedData.type === 'DIGITAL' && validatedData.file) {
    await fs.mkdir("public/products", { recursive: true });
    filePath = `public/products/${crypto.randomUUID()}-${validatedData.file.name}`;
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
      type: validatedData.type as ProductType, // Ensure this matches the enum
      filePath,
      imagePath: imagePaths[0], // Use the first image as the main image path
      isFeatured: validatedData.isFeatured || false,
      stockQuantity: validatedData.stockQuantity,
      images: {
        create: imagePaths.map(path => ({ imagePath: path }))
      },
      sizes: {
        connectOrCreate: validatedData.sizes?.map(size => ({
          where: { id: size }, // Adjust this based on your schema
          create: { name: size }
        }))
      },
      colors: {
        connectOrCreate: validatedData.colors?.map(color => ({
          where: { id: color }, // Adjust this based on your schema
          create: { name: color }
        }))
      },
      categories: {
        connectOrCreate: validatedData.categories?.map(category => ({
          where: { id: category }, // Adjust this based on your schema
          create: { name: category }
        }))
      },
    },
    include: {
      sizes: true,
      colors: true,
      categories: true,
    }
  });
  

  console.log('Created Product', createdProduct);

  revalidatePath("/");
  revalidatePath("/products");

  redirect("/admin/products");
}


export async function updateProduct(id: string, formData: FormData) {
  const data = {
    name: formData.get('name')?.toString(),
    description: formData.get('description')?.toString(),
    priceInCents: Number(formData.get('priceInCents')),
    type: formData.get('type')?.toString() as ProductType,
    file: formData.get('file') as File,
    images: Array.from(formData.getAll('images')) as File[],
    stockQuantity: Number(formData.get('stockQuantity')),
    sizes: Array.from(formData.getAll('sizes')),
    colors: Array.from(formData.getAll('colors')),
    categories: Array.from(formData.getAll('categories')),
    isFeatured: formData.get('isFeatured') === 'on'
  };

  const result = productSchema.safeParse(data);
  if (!result.success) {
    return result.error.formErrors.fieldErrors;
  }
  const { data: validatedData } = result;

  const product = await db.product.findUnique({
    where: { id },
    include: { images: true, sizes: true, colors: true, categories: true }
  });

  if (!product) throw new Error('Product not found');

let filePath = product.filePath;
  if (validatedData.type === 'DIGITAL' && validatedData.file) {
    await fs.mkdir("public/products", { recursive: true });

    // Optionally, delete the old file if it exists
    if (filePath) {
      await fs.unlink(`public/${filePath}`).catch(() => {});
    }

    // Save the new file
    filePath = `public/products/${crypto.randomUUID()}-${validatedData.file.name}`;
    await fs.writeFile(filePath, Buffer.from(await validatedData.file.arrayBuffer()));
  }

  // Delete old images
  await Promise.all(product.images.map(async (image) => {
    await fs.unlink(`public${image.imagePath}`).catch(() => {});
  }));

  const imagePaths = await Promise.all((validatedData.images || []).map(async (image) => {
    const imagePath = `/products/${crypto.randomUUID()}-${image.name}`;
    await fs.writeFile(`public${imagePath}`, Buffer.from(await image.arrayBuffer()));
    return imagePath;
  }));

  const updateData: any = {
    name: validatedData.name,
    description: validatedData.description,
    priceInCents: validatedData.priceInCents,
    type: validatedData.type,
    filePath,
    imagePath: imagePaths[0], // Use the first image as the main image path
    isFeatured: validatedData.isFeatured || false,
    stockQuantity: validatedData.stockQuantity,
    images: {
      deleteMany: {},
      create: imagePaths.map(path => ({ imagePath: path }))
    }
  };

  if (validatedData.type === 'PHYSICAL') {
    updateData.sizes = {
      disconnect: product.sizes.filter(size => !validatedData.sizes?.includes(size.id)).map(size => ({ id: size.id })),
      connectOrCreate: validatedData.sizes?.map(size => ({
        where: { id: size },
        create: { id: size, name: size }
      }))
    };
    updateData.colors = {
      disconnect: product.colors.filter(color => !validatedData.colors?.includes(color.id)).map(color => ({ id: color.id })),
      connectOrCreate: validatedData.colors?.map(color => ({
        where: { id: color },
        create: { id: color, name: color }
      }))
    };
  }

  updateData.categories = {
    disconnect: product.categories.filter(category => !validatedData.categories.includes(category.id)).map(category => ({ id: category.id })),
    connectOrCreate: validatedData.categories.map(category => ({
      where: { id: category },
      create: { id: category, name: category }
    }))
  };

  const updatedProduct = await db.product.update({
    where: { id },
    data: updateData,
    include: {
      sizes: true,
      colors: true,
      categories: true,
    }
  });

  revalidatePath("/");
  revalidatePath("/products");

  redirect("/admin/products");
}


export async function toggleProductAvailability(
  id: string,
  isAvailableForPurchase: boolean
) {
  await db.product.update({ where: { id }, data: { isAvailableForPurchase } })

  revalidatePath("/")
  revalidatePath("/products")
}

// export async function deleteProduct(id: string) {
//   const product = await db.product.delete({ where: { id } })
//   //const physicalProduct = await db.size.deleteMany({ where: {id: id } })
//   if (product == null) return notFound() 
//   if (product.filePath) {
//     await fs.unlink(product.filePath).catch(() => {});
//   }
//   if (product.imagePath) {
//     await fs.unlink(`public${product.imagePath}`).catch(() => {});
//   }

//   revalidatePath("/")
//   revalidatePath("/admin/products")
// }

export async function deleteProduct(id: string) {
  // const product = await db.product.findUnique({ where: { id }, include: { images: true } });
  // if (!product) return notFound();

  const product = await db.product.findUnique({ where: { id }, include: { images: true, sizes: true, colors: true, categories: true, subCategories: true } });
  if (!product) return notFound();

  // Delete the main file if it exists
  if (product.filePath) {
    console.log('FilePath',product.filePath)
    await fs.unlink(`${product.filePath}`).catch(() => {});
  }

  // Delete all images
  await Promise.all(product.images.map(async (image) => {
    console.log('ImagePath', image.imagePath)
    await fs.unlink(`public${image.imagePath}`).catch(() => {});
  }));

  await db.product.delete({ where: { id } });

  revalidatePath("/");
  revalidatePath("/admin/products");
  revalidatePath("/products");
}