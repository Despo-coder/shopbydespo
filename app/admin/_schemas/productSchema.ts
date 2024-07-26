// import { z } from 'zod';

// export const productSchema = z.object({
//   name: z.string().min(1, "Name is required"),
//   priceInCents: z.number().min(0, "Price must be a positive number"),
//   description: z.string().min(1, "Description is required"),
//   file: z.instanceof(File).optional(),
//   image: z.instanceof(File).optional(),
// });

// export type ProductFormData = z.infer<typeof productSchema>;


import { z } from 'zod';

const fileSchema = z.instanceof(File, { message: "Required" })
const imageSchema = fileSchema.refine(
  file => file.size === 0 || file.type.startsWith("image/")
)

export const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  priceInCents: z.coerce.number().int().min(1),
  file: fileSchema.refine(file => file.size > 0, "Required"),
  image: imageSchema.refine(file => file.size > 0, "Required"),
})

export type ProductFormData = z.infer<typeof productSchema>;
