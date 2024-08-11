'use client'
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/formatters";
import { addProduct, updateProduct } from "../../_actions/products";
import { useFormState, useFormStatus } from "react-dom";
import { Category, Color, Product, ProductImage, Size } from "@prisma/client";
import Image from "next/image";
import toast from "react-hot-toast";
import { Checkbox } from "@/components/ui/checkbox";

type ProductWithImages = Product & {
  images: ProductImage[];
  sizes: Size[];
  colors: Color[];
  categories: Category[];
};

export function ProductForm({ product }: { product?: ProductWithImages | null }) {
  const [error, action] = useFormState(
    async (prevState: any, formData: FormData) => {
      const result = await (product == null 
        ? addProduct(prevState, formData) 
        : updateProduct(product.id!, formData));
      if (result && Object.keys(result).length > 0) {
        toast.error('Failed to save product');
        return result;
      }
      toast.success('Product saved successfully');
      return {};
    },
    {}
  );

  const [priceInCents, setPriceInCents] = useState<number | string>(product?.priceInCents ?? '');
  const [productType, setProductType] = useState(product?.type || 'DIGITAL');
  const [sizes, setSizes] = useState<string[]>(product?.sizes?.map(size => size.name) || []);
  const [colors, setColors] = useState<string[]>(product?.colors?.map(color => color.name) || []);
  const [categories, setCategories] = useState<string[]>(product?.categories?.map(category => category.name) || []);
  const [selectedCategory, setSelectedCategory] = useState<string>(product?.categories[0]?.name || '');
  const [subCategory, setSubCategory] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => { 
    e.preventDefault();
  };

  const SIZES = ['SM', 'MD', 'LG', 'XL', 'XXL'];
  const COLORS = ['White', 'Black', 'Blue', 'Green', 'Red'];
  const CATEGORIES = ['Clothing', 'Jewelery', 'Kitchen', 'Electronics'];
  const SUBCATEGORIES = {
    Mens: ['Top', 'Bottom', 'Hats'],
    Womens: ['Top', 'Bottom', 'Hats']
  };

  const handleCheckboxChange = (type: 'sizes' | 'colors' | 'categories', value: string, checked: boolean) => {
    if (type === 'sizes') {
      setSizes(prev => checked ? [...prev, value] : prev.filter(item => item !== value));
    } else if (type === 'colors') {
      setColors(prev => checked ? [...prev, value] : prev.filter(item => item !== value));
    } else if (type === 'categories') {
      setCategories(prev => checked ? [...prev, value] : prev.filter(item => item !== value));
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedCategory(value);
    if (value !== 'Clothing') {
      setSubCategory('');
    }
  };

  return (
    <form action={action} className="space-y-8">
      <div className="space-y-2 space-x-2">
        <Label htmlFor="type">Product Type</Label>
        <select 
          id="type" 
          name="type" 
          value={productType}
          onChange={(e) => setProductType(e.target.value as "PHYSICAL" | "DIGITAL")}          
          required
          className="bg-transparent border-b-2 border-t-slate-500 rounded-xl p-2 focus:border-t-slate-200 focus:outline-none"
        >
          <option value="DIGITAL">Digital</option>
          <option value="PHYSICAL">Physical</option>
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

      {productType === 'PHYSICAL' && (
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

      {productType === 'DIGITAL' && (
        <div className="space-y-2">
          <Label htmlFor="file">File</Label>
          <Input type="file" id="file" name="file" required={product == null} />
          {product != null && (
            <div className="text-muted-foreground">{product.filePath}</div>
          )}
          {error.file && <div className="text-destructive">{error.file}</div>}
        </div>
      )}
   
      {productType === 'PHYSICAL' && (
        <>
          <div className="space-y-2">
            <Label>Sizes</Label>
            {SIZES.map((size) => (
              <div key={size} className="flex items-center space-x-2">
                <Checkbox
                  id={`size-${size}`}
                  name="sizes"
                  value={size}
                  checked={sizes.includes(size)}
                  onCheckedChange={(checked) => handleCheckboxChange('sizes', size, checked as boolean)}
                />
                <label
                  htmlFor={`size-${size}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {size}
                </label>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label>Colors</Label>
            {COLORS.map((color) => (
              <div key={color} className="flex items-center space-x-2">
                <Checkbox
                  id={`color-${color}`}
                  name="colors"
                  value={color}
                  checked={colors.includes(color)}
                  onCheckedChange={(checked) => handleCheckboxChange('colors', color, checked as boolean)}
                />
                <label
                  htmlFor={`color-${color}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {color}
                </label>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label>Categories</Label>
            {CATEGORIES.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category}`}
                  name="categories"
                  value={category}
                  checked={categories.includes(category)}
                  onCheckedChange={(checked) => handleCheckboxChange('categories', category, checked as boolean)}
                />
                <label
                  htmlFor={`category-${category}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {category}
                </label>
              </div>
            ))}
          </div>

          {selectedCategory === 'Clothing' && (
            <div className="space-y-2">
              <Label htmlFor="subCategory">SubCategory</Label>
              <select
                id="subCategory"
                name="subCategory"
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                className="bg-transparent border-b-2 border-t-slate-500 rounded-xl p-2 focus:border-t-slate-200 focus:outline-none"
              >
                <option value="">Select SubCategory</option>
                {(Object.keys(SUBCATEGORIES) as Array<keyof typeof SUBCATEGORIES>).map((gender) => (
                  <optgroup key={gender} label={gender}>
                    {SUBCATEGORIES[gender].map((subCat) => (
                      <option key={subCat} value={`${gender}-${subCat}`}>
                        {subCat}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          )}
        </>
      )}

      <div className="space-y-2">
        <Label htmlFor="images">Images</Label>
        <Input type="file" id="images" name="images" multiple accept="image/*" required={product == null}/>
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

      <div className="flex items-center gap-4 space-y-2">
        <Label htmlFor="isFeatured" className="mt-2">Featured Product?</Label>
        <Input
          type="checkbox"
          id="isFeatured"
          name="isFeatured"
          defaultChecked={product?.isFeatured || false}
          className="w-4 h-4"
        />
      </div>

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save"}
    </Button>
  );
}