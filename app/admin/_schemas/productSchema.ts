

import { z } from 'zod';

// const fileSchema = z.instanceof(File, { message: "Required" })
// const imageSchema = fileSchema.refine(
//   file => file.size === 0 || file.type.startsWith("image/")
// )

const fileSchema = z.instanceof(File).optional()
const imageSchema = z.instanceof(File).array().min(1, "At least one image is required")

export const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  priceInCents: z.number().int().positive("Price must be a positive integer"),
  type: z.enum(["physical", "digital"]),
  file: z.union([
    z.undefined(),
    z.null(),
    z.instanceof(File)
  ]).optional(),
  images:imageSchema,
  stockQuantity: z.number().int().nonnegative("Stock quantity must be a non-negative integer"),
  sizes: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  categories: z.array(z.string()),
  isFeatured: z.boolean().optional()
}).refine((data) => {
  if (data.type === "digital" && (!data.file || !(data.file instanceof File) || data.file.size === 0)) {
    return false
  }
  return true
}, {
  message: "File is required for digital products",
  path: ["file"]
})


export type ProductFormData = z.infer<typeof productSchema>;
