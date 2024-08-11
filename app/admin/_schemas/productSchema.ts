import { z } from 'zod';

const fileSchema = z.instanceof(File).optional();
const imageSchema = z.instanceof(File).array().min(1, "At least one image is required");

export const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  priceInCents: z.number().int().positive("Price must be a positive integer"),
  type: z.enum(["PHYSICAL", "DIGITAL"]),
  file: z.union([z.undefined(), z.null(), z.instanceof(File)]).optional(),
  images: imageSchema,
  stockQuantity: z.number().int().nonnegative("Stock quantity must be a non-negative integer").optional(),
  sizes: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  categories: z.array(z.string()),
  isFeatured: z.boolean().optional()
}).refine((data) => {
  if (data.type === "DIGITAL" && (!data.file || !(data.file instanceof File) || data.file.size === 0)) {
    return false
  }
  return true
}, {
  message: "File is required for digital products",
  path: ["file"]
})

export type ProductFormData = z.infer<typeof productSchema>;
