import { isUserAdminComprehensive } from "@/lib/adminUtils";
import { client, writeClient } from "@/sanity/lib/client";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Get authenticated user
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - Not logged in" },
        { status: 401 }
      );
    }

    // Get current user details to check admin status
    const clerk = await clerkClient();
    const currentUser = await clerk.users.getUser(userId);
    const userEmail = currentUser.primaryEmailAddress?.emailAddress;

    // Check if current user is admin
    if (!userEmail || !(await isUserAdminComprehensive(userId, userEmail))) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("id");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");
    const category = searchParams.get("category") || "";
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "_createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    console.log("API Params - category:", category, "search:", search);

    // If requesting a specific product by ID, return full details
    if (productId) {
      const productQuery = `
        *[_type == "product" && _id == "${productId}"][0] {
          _id,
          _type,
          _createdAt,
          _updatedAt,
          _rev,
          name,
          slug,
          description,
          price,
          discount,
          stock,
          images[asset._ref != "" && asset._ref != null]{
            _key,
            alt,
            asset
          },
          categories[]->{
            _id,
            title,
            slug
          },
          brand->{
            _id,
            title,
            slug
          },
          status,
          variant,
          isFeatured
        }
      `;

      const product = await client.fetch(productQuery);

      if (!product) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        );
      }

      // Transform the data to match our interface
      const transformedProduct = {
        ...product,
        category: product.categories?.[0]
          ? {
              _id: product.categories[0]._id,
              name: product.categories[0].title,
              title: product.categories[0].title,
              slug: product.categories[0].slug,
            }
          : null,
        brand: product.brand
          ? {
              _id: product.brand._id,
              name: product.brand.title,
              title: product.brand.title,
              slug: product.brand.slug,
            }
          : null,
        featured: product.isFeatured,
      };

      return NextResponse.json({ product: transformedProduct });
    }

    // Build filter conditions
    const filterConditions = [];
    if (category) {
      // Use references to filter by category
      filterConditions.push(
        `references(*[_type == "category" && title == "${category}"]._id)`
      );
    }
    if (search) {
      filterConditions.push(
        `(name match "${search}*" || description match "${search}*")`
      );
    } // Build GROQ query
    const query = `
      *[_type == "product"${
        filterConditions.length > 0
          ? ` && (${filterConditions.join(" && ")})`
          : ""
      }] | order(${sortBy} ${sortOrder}) [${offset}...${offset + limit}] {
        _id,
        _createdAt,
        name,
        description,
        price,
        stock,
        images[asset._ref != "" && asset._ref != null]{
          asset->{
            _id,
            url
          },
          alt,
          _key
        },
        "category": categories[0]->{
          _id,
          "name": title,
          "title": title
        },
        "categories": categories[]->{
          _id,
          "name": title,
          "title": title
        },
        brand-> {
          _id,
          "name": title
        },
        "featured": isFeatured,
        status
      }
    `;

    // Get count query
    const countQuery = `
      count(*[_type == "product"${
        filterConditions.length > 0
          ? ` && (${filterConditions.join(" && ")})`
          : ""
      }])
    `;

    // Execute queries
    const [products, totalCount] = await Promise.all([
      client.fetch(query),
      client.fetch(countQuery),
    ]);

    return NextResponse.json({
      products,
      totalCount,
      hasNextPage: offset + limit < totalCount,
      pagination: {
        limit,
        offset,
        total: totalCount,
        currentPage: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Create a new product
export async function POST(req: NextRequest) {
  try {
    // Get authenticated user
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - Not logged in" },
        { status: 401 }
      );
    }

    // Get current user details to check admin status
    const clerk = await clerkClient();
    const currentUser = await clerk.users.getUser(userId);
    const userEmail = currentUser.primaryEmailAddress?.emailAddress;

    // Check if current user is admin
    if (!userEmail || !(await isUserAdminComprehensive(userId, userEmail))) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      name,
      description,
      price,
      discount = 0,
      stock,
      images = [],
      categoryIds = [],
      brandId,
      status = "new",
      variant,
      isFeatured = false,
    } = body;

    // Validate required fields
    if (!name || !price || stock === undefined) {
      return NextResponse.json(
        { error: "Name, price, and stock are required" },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Check if slug already exists
    const existingProduct = await client.fetch(
      `*[_type == "product" && slug.current == "${slug}"][0]`
    );

    if (existingProduct) {
      return NextResponse.json(
        { error: "A product with this name already exists" },
        { status: 400 }
      );
    }

    // Prepare the product document
    const productDoc = {
      _type: "product",
      name,
      slug: {
        _type: "slug",
        current: slug,
      },
      description,
      price: parseFloat(price),
      discount: parseFloat(discount) || 0,
      stock: parseInt(stock),
      images: images
        .filter((img: any) => {
          const ref = img.asset?._ref || img._ref;
          return ref && ref.trim() !== "";
        })
        .map((img: any) => ({
          _key: img._key || Math.random().toString(36),
          _type: "image",
          asset: {
            _type: "reference",
            _ref: img.asset?._ref || img._ref,
          },
          alt: img.alt || name,
        })),
      categories: categoryIds.map((id: string) => ({
        _type: "reference",
        _ref: id,
      })),
      brand:
        brandId && brandId !== "no-brand"
          ? {
              _type: "reference",
              _ref: brandId,
            }
          : undefined,
      status,
      variant,
      isFeatured,
    };

    // Create the product in Sanity
    const result = await writeClient.create(productDoc);

    // Revalidate related pages
    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/");

    return NextResponse.json(
      { message: "Product created successfully", product: result },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Update an existing product
export async function PUT(req: NextRequest) {
  try {
    // Get authenticated user
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - Not logged in" },
        { status: 401 }
      );
    }

    // Get current user details to check admin status
    const clerk = await clerkClient();
    const currentUser = await clerk.users.getUser(userId);
    const userEmail = currentUser.primaryEmailAddress?.emailAddress;

    // Check if current user is admin
    if (!userEmail || !(await isUserAdminComprehensive(userId, userEmail))) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { productId, ...updateData } = body;

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Check if product exists
    const existingProduct = await client.fetch(
      `*[_type == "product" && _id == "${productId}"][0]`
    );

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Prepare update patches
    const patches: Array<{ set?: Record<string, any>; unset?: string[] }> = [];

    // Update basic fields
    if (updateData.name !== undefined) {
      patches.push({ set: { name: updateData.name } });

      // Update slug if name changed
      const newSlug = updateData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      if (newSlug !== existingProduct.slug?.current) {
        // Check if new slug already exists
        const slugExists = await client.fetch(
          `*[_type == "product" && slug.current == "${newSlug}" && _id != "${productId}"][0]`
        );

        if (slugExists) {
          return NextResponse.json(
            { error: "A product with this name already exists" },
            { status: 400 }
          );
        }

        patches.push({ set: { "slug.current": newSlug } });
      }
    }

    if (updateData.description !== undefined) {
      patches.push({ set: { description: updateData.description } });
    }

    if (updateData.price !== undefined) {
      patches.push({ set: { price: parseFloat(updateData.price) } });
    }

    if (updateData.discount !== undefined) {
      patches.push({ set: { discount: parseFloat(updateData.discount) } });
    }

    if (updateData.stock !== undefined) {
      patches.push({ set: { stock: parseInt(updateData.stock) } });
    }

    if (updateData.images !== undefined) {
      const formattedImages = updateData.images
        .filter((img: any) => {
          const ref = img.asset?._ref || img._ref;
          return ref && ref.trim() !== "";
        })
        .map((img: any) => ({
          _key: img._key || Math.random().toString(36),
          _type: "image",
          asset: {
            _type: "reference",
            _ref: img.asset?._ref || img._ref,
          },
          alt: img.alt || updateData.name || existingProduct.name,
        }));
      patches.push({ set: { images: formattedImages } });
    }

    if (updateData.categoryIds !== undefined) {
      const categories = updateData.categoryIds.map((id: string) => ({
        _type: "reference",
        _ref: id,
      }));
      patches.push({ set: { categories } });
    }

    if (updateData.brandId !== undefined) {
      if (updateData.brandId && updateData.brandId !== "no-brand") {
        patches.push({
          set: {
            brand: {
              _type: "reference",
              _ref: updateData.brandId,
            },
          },
        });
      } else {
        patches.push({ unset: ["brand"] });
      }
    }

    if (updateData.status !== undefined) {
      patches.push({ set: { status: updateData.status } });
    }

    if (updateData.variant !== undefined) {
      patches.push({ set: { variant: updateData.variant } });
    }

    if (updateData.isFeatured !== undefined) {
      patches.push({ set: { isFeatured: updateData.isFeatured } });
    }

    // Apply patches
    let result = existingProduct;
    for (const patch of patches) {
      let patchOperation = writeClient.patch(productId);

      if ("set" in patch && patch.set) {
        patchOperation = patchOperation.set(patch.set);
      }

      if ("unset" in patch && patch.unset) {
        patchOperation = patchOperation.unset(patch.unset);
      }

      result = await patchOperation.commit();
    }

    // Revalidate related pages
    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath(`/products/${existingProduct.slug?.current}`);
    revalidatePath("/");

    return NextResponse.json({
      message: "Product updated successfully",
      product: result,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Delete products (single or bulk)
export async function DELETE(req: NextRequest) {
  try {
    // Get authenticated user
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - Not logged in" },
        { status: 401 }
      );
    }

    // Get current user details to check admin status
    const clerk = await clerkClient();
    const currentUser = await clerk.users.getUser(userId);
    const userEmail = currentUser.primaryEmailAddress?.emailAddress;

    // Check if current user is admin
    if (!userEmail || !(await isUserAdminComprehensive(userId, userEmail))) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { productIds } = body; // Array of product IDs to delete

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { error: "Product IDs array is required" },
        { status: 400 }
      );
    }

    // Check if all products exist
    const existingProducts = await client.fetch(
      `*[_type == "product" && _id in [${productIds.map((id: string) => `"${id}"`).join(", ")}]]`
    );

    if (existingProducts.length !== productIds.length) {
      return NextResponse.json(
        { error: "One or more products not found" },
        { status: 404 }
      );
    }

    // Delete all products
    const deletePromises = productIds.map((id: string) =>
      writeClient.delete(id)
    );

    await Promise.all(deletePromises);

    // Revalidate related pages
    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/");

    return NextResponse.json({
      message: `${productIds.length} product(s) deleted successfully`,
      deletedCount: productIds.length,
    });
  } catch (error) {
    console.error("Error deleting products:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
