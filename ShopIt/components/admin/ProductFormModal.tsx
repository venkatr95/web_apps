"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ADMIN_CATEGORIES_QUERYResult } from "@/sanity.types";
import { image as imageUrlBuilder } from "@/sanity/image";
import { ImageIcon, Loader2, Package, Upload, X } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { handleApiError, safeApiCall } from "./apiHelpers";
import { Product } from "./types";

interface Brand {
  _id: string;
  title: string;
  name?: string;
}

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product?: Product | null; // If provided, we're editing
  categories: ADMIN_CATEGORIES_QUERYResult;
}

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  discount: string;
  stock: string;
  categoryIds: string[];
  brandId: string;
  status: string;
  variant: string;
  isFeatured: boolean;
  images: any[];
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  product,
  categories,
}) => {
  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    price: "",
    discount: "0",
    stock: "",
    categoryIds: [],
    brandId: "no-brand",
    status: "new",
    variant: "",
    isFeatured: false,
    images: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load existing product data when editing
  useEffect(() => {
    if (product && isOpen) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price?.toString() || "",
        discount: product.discount?.toString() || "0",
        stock: product.stock?.toString() || "",
        categoryIds: product.categories
          ? product.categories.map((cat) => cat._id)
          : product.category
            ? [product.category._id]
            : [],
        brandId: product.brand?._id || "no-brand",
        status: product.status || "new",
        variant: product.variant || "",
        isFeatured: product.isFeatured || product.featured || false,
        images: product.images
          ? product.images.map((img: any) => ({
              _key: img._key,
              _type: "image",
              asset: {
                _ref: img.asset?._id || img.asset?._ref,
                _type: "reference",
              },
              alt: img.alt || product.name || "Product image",
            }))
          : [],
      });
    } else if (isOpen) {
      // Reset form for new product
      setFormData({
        name: "",
        description: "",
        price: "",
        discount: "0",
        stock: "",
        categoryIds: [],
        brandId: "no-brand",
        status: "new",
        variant: "",
        isFeatured: false,
        images: [],
      });
    }
    setErrors({});
  }, [product, isOpen]);

  // Fetch brands when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchBrands();
    }
  }, [isOpen]);

  const fetchBrands = async () => {
    setLoadingBrands(true);
    try {
      const response = await safeApiCall("/api/admin/brands");
      setBrands(response.brands || []);
    } catch (error) {
      console.error("Error fetching brands:", error);
      // Set empty array as fallback
      setBrands([]);
    } finally {
      setLoadingBrands(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = "Valid price is required";
    }

    if (!formData.stock || parseInt(formData.stock) < 0) {
      newErrors.stock = "Valid stock quantity is required";
    }

    if (formData.categoryIds.length === 0) {
      newErrors.categoryIds = "At least one category is required";
    }

    const discount = parseFloat(formData.discount);
    if (discount < 0 || discount > 100) {
      newErrors.discount = "Discount must be between 0 and 100";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    setFormData((prev) => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(categoryId)
        ? prev.categoryIds.filter((id) => id !== categoryId)
        : [...prev.categoryIds, categoryId],
    }));

    if (errors.categoryIds) {
      setErrors((prev) => ({ ...prev, categoryIds: "" }));
    }
  };

  const handleImageUpload = async (files: FileList) => {
    if (files.length === 0) return;

    setUploadingImages(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const uploadFormData = new FormData();
        uploadFormData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        });

        if (!response.ok) {
          throw new Error(`Upload failed for ${file.name}`);
        }

        const result = await response.json();
        return {
          _key: `${result.asset._id}-${Date.now()}`,
          _type: "image",
          asset: {
            _ref: result.asset._id,
            _type: "reference",
          },
          alt: formData.name || "Product image",
        };
      });

      const uploadedImages = await Promise.all(uploadPromises);

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedImages],
      }));
    } catch (error) {
      handleApiError(error, "Image upload");
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const endpoint = "/api/admin/products";
      const method = product ? "PUT" : "POST";

      const payload = {
        ...formData,
        ...(product && { productId: product._id }),
      };

      await safeApiCall(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      onSuccess();
      onClose();
    } catch (error) {
      handleApiError(error, product ? "Product update" : "Product creation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? "Edit Product" : "Create New Product"}
          </DialogTitle>
          <DialogDescription>
            {product
              ? "Update the product information below"
              : "Fill in the details to create a new product"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter product name"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="variant">Product Type/Variant</Label>
              <Input
                id="variant"
                value={formData.variant}
                onChange={(e) => handleInputChange("variant", e.target.value)}
                placeholder="e.g., Size, Color, Model"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Enter product description"
              rows={3}
            />
          </div>

          {/* Pricing & Stock */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (USD) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                placeholder="0.00"
                className={errors.price ? "border-red-500" : ""}
              />
              {errors.price && (
                <p className="text-sm text-red-500">{errors.price}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount">Discount (%)</Label>
              <Input
                id="discount"
                type="number"
                min="0"
                max="100"
                value={formData.discount}
                onChange={(e) => handleInputChange("discount", e.target.value)}
                placeholder="0"
                className={errors.discount ? "border-red-500" : ""}
              />
              {errors.discount && (
                <p className="text-sm text-red-500">{errors.discount}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Stock Quantity *</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => handleInputChange("stock", e.target.value)}
                placeholder="0"
                className={errors.stock ? "border-red-500" : ""}
              />
              {errors.stock && (
                <p className="text-sm text-red-500">{errors.stock}</p>
              )}
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <Label>Categories *</Label>
            <div className="flex flex-wrap gap-2 p-3 border rounded-md min-h-[50px]">
              {categories.length === 0 ? (
                <p className="text-sm text-gray-500">Loading categories...</p>
              ) : (
                categories.map((category) => (
                  <Badge
                    key={category._id}
                    variant={
                      formData.categoryIds.includes(category._id)
                        ? "default"
                        : "outline"
                    }
                    className="cursor-pointer"
                    onClick={() => handleCategoryToggle(category._id)}
                  >
                    {category.title}
                    {formData.categoryIds.includes(category._id) && (
                      <X className="w-3 h-3 ml-1" />
                    )}
                  </Badge>
                ))
              )}
            </div>
            {errors.categoryIds && (
              <p className="text-sm text-red-500">{errors.categoryIds}</p>
            )}
          </div>

          {/* Brand & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Select
                value={formData.brandId}
                onValueChange={(value) => handleInputChange("brandId", value)}
                disabled={loadingBrands}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      loadingBrands ? "Loading brands..." : "Select a brand"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-brand">No Brand</SelectItem>
                  {brands.map((brand) => (
                    <SelectItem key={brand._id} value={brand._id}>
                      {brand.title || brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="hot">Hot</SelectItem>
                  <SelectItem value="sale">Sale</SelectItem>
                  <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Featured Toggle */}
          <div className="flex items-center space-x-2">
            <Switch
              id="featured"
              checked={formData.isFeatured}
              onCheckedChange={(checked) =>
                handleInputChange("isFeatured", checked)
              }
            />
            <Label htmlFor="featured">Featured Product</Label>
          </div>

          {/* Image Upload */}
          <div className="space-y-4">
            <Label>Product Images</Label>

            {/* Upload Button */}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImages}
              >
                {uploadingImages ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Images
                  </>
                )}
              </Button>
              <p className="text-sm text-gray-500">
                Supports: JPG, PNG, WebP (max 5MB each)
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) =>
                e.target.files && handleImageUpload(e.target.files)
              }
            />

            {/* Image Preview Grid */}
            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.images.map((image, index) => (
                  <div key={image._key || index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden border">
                      {image.asset?._ref ? (
                        <Image
                          src={imageUrlBuilder(image)
                            .width(200)
                            .height(200)
                            .url()}
                          alt={image.alt || "Product image"}
                          width={200}
                          height={200}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {product ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Package className="w-4 h-4 mr-2" />
                  {product ? "Update Product" : "Create Product"}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductFormModal;
