import { NextResponse } from "next/server";
import { getAdminSupabaseClient, getServerPublicSupabaseClient, hasServiceRoleKey } from "@/lib/supabaseServer";
import { verifyAdminRequest } from "@/lib/adminAuthServer";
import type { Database } from "@/types/database.types";

type ProductUpdate = Database["public"]["Tables"]["products"]["Update"];
type ProductImageRow = Database["public"]["Tables"]["product_images"]["Row"];

const MAX_ACTIVE_PRODUCTS = 20;
const MAX_IMAGES_PER_PRODUCT = 3;

function extractStoragePath(urlOrPath: string): string {
  if (!urlOrPath) return "";
  if (urlOrPath.startsWith("products/")) return urlOrPath;
  const match = urlOrPath.match(/hospital-images\/(products\/[^?#]+)/);
  if (match) return match[1];
  const urlParts = urlOrPath.split("/products/");
  if (urlParts.length > 1) return `products/${urlParts[1].split(/[?#]/)[0]}`;
  const filename = urlOrPath.split("/").pop()?.split(/[?#]/)[0];
  return filename ? `products/${filename}` : "";
}

function normalizeProductCategory(cat?: string): "Herbal Formulation" | "Therapeutic Oil" | "Wellness" | "Care" {
  const lower = (cat || "").toLowerCase().trim();
  if (lower.includes("oil")) return "Therapeutic Oil";
  if (lower.includes("herbal") || lower.includes("formulation")) return "Herbal Formulation";
  if (lower.includes("care")) return "Care";
  return "Wellness";
}

export async function GET(req: Request) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }

    const supabase = getAdminSupabaseClient() || getServerPublicSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { ok: false, error: "Database client not configured" },
        { status: 500 }
      );
    }

    const { data, error } = await supabase
      .from("products")
      .select("*, product_images(*)")
      .order("created_at", { ascending: false });

    if (error) {
      if (error.code === "PGRST205") {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Database table 'public.products' is not yet present in the Supabase schema cache. Please execute supabase/schema.sql in the Supabase Dashboard SQL Editor.",
          },
          { status: 500 }
        );
      }
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    const formatted = (data || []).map((row) => {
      const pImages = (row.product_images as ProductImageRow[] || []).sort(
        (a, b) => a.display_order - b.display_order
      );
      const images =
        pImages.length > 0
          ? pImages.map((pi) => pi.image_url)
          : row.images && row.images.length > 0
          ? row.images
          : row.image
          ? [row.image]
          : [];
      const storagePaths =
        pImages.length > 0
          ? pImages.map((pi) => pi.storage_path)
          : row.storage_paths || [];
      const primaryImage = images[0] || row.image || "";

      return {
        ...row,
        image: primaryImage,
        images,
        storage_paths: storagePaths,
        product_images: pImages,
      };
    });

    return NextResponse.json({ ok: true, data: formatted });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // 1. Validate admin session
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }

    if (!hasServiceRoleKey()) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Server Configuration Error: SUPABASE_SERVICE_ROLE_KEY is required in .env.local for administrative write operations. Please configure SUPABASE_SERVICE_ROLE_KEY in .env.local.",
        },
        { status: 500 }
      );
    }

    const supabase = getAdminSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { ok: false, error: "Database client not configured" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const {
      name,
      slug,
      category,
      price,
      stock,
      shortDescription,
      description,
      image,
      images,
      storagePaths,
      active,
    } = body;

    // 2. Validate product fields
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ ok: false, error: "Product name is required" }, { status: 400 });
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      return NextResponse.json({ ok: false, error: "Price cannot be negative" }, { status: 400 });
    }

    const numStock = Number(stock ?? 0);
    if (isNaN(numStock) || numStock < 0) {
      return NextResponse.json({ ok: false, error: "Stock cannot be negative" }, { status: 400 });
    }

    // Enforce 3 images maximum per product (Requirement: Maximum 3 images per product)
    const imageList: string[] = Array.isArray(images)
      ? images.filter((img): img is string => typeof img === "string" && img.trim().length > 0)
      : image && typeof image === "string" && image.trim().length > 0
      ? [image.trim()]
      : [];

    if (imageList.length > MAX_IMAGES_PER_PRODUCT) {
      return NextResponse.json(
        { ok: false, error: `Limit reached: Maximum ${MAX_IMAGES_PER_PRODUCT} images allowed per product.` },
        { status: 400 }
      );
    }

    const primaryImage = imageList[0] || (image && typeof image === "string" ? image.trim() : "");
    if (!primaryImage) {
      return NextResponse.json(
        { ok: false, error: "At least one product image is required." },
        { status: 400 }
      );
    }

    const isActive = active !== false;

    // 3. Validate product limit (Maximum 20 active products)
    if (isActive) {
      const { count, error: countError } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("active", true);

      if (countError) {
        if (countError.code === "PGRST205") {
          return NextResponse.json(
            {
              ok: false,
              error:
                "Database table 'public.products' is not yet present in the Supabase schema cache. Please execute supabase/schema.sql in the Supabase Dashboard SQL Editor.",
            },
            { status: 500 }
          );
        }
      } else if (count !== null && count >= MAX_ACTIVE_PRODUCTS) {
        return NextResponse.json(
          {
            ok: false,
            error: `Limit reached: Maximum ${MAX_ACTIVE_PRODUCTS} active products allowed. Please deactivate an existing formulation first.`,
          },
          { status: 400 }
        );
      }
    }

    const generatedSlug = (slug || name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // 4. Create product row
    const newRow = {
      name: name.trim(),
      slug: generatedSlug,
      category: normalizeProductCategory(category),
      price: numPrice,
      stock: numStock,
      short_description: shortDescription?.trim() || "",
      description: description?.trim() || shortDescription?.trim() || "",
      image: primaryImage,
      images: imageList,
      storage_paths: Array.isArray(storagePaths) ? storagePaths : [],
      active: isActive,
    };

    const { data: createdProduct, error: productError } = await supabase
      .from("products")
      .insert(newRow)
      .select()
      .single();

    if (productError) {
      if (productError.code === "PGRST205") {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Database table 'public.products' is not yet present in the Supabase schema cache. Please execute supabase/schema.sql in the Supabase Dashboard SQL Editor.",
          },
          { status: 500 }
        );
      }
      return NextResponse.json({ ok: false, error: productError.message }, { status: 400 });
    }

    // 5. Create product_images records
    const productImagesToInsert = imageList.map((imgUrl, idx) => {
      const pathFromList = Array.isArray(storagePaths) && storagePaths[idx] ? storagePaths[idx] : "";
      const sp = pathFromList || extractStoragePath(imgUrl) || `products/${createdProduct.slug}-${idx + 1}.webp`;
      const fileName = sp.split("/").pop() || `${createdProduct.slug}-${idx + 1}.webp`;

      return {
        product_id: createdProduct.id,
        storage_path: sp,
        image_url: imgUrl,
        file_name: fileName,
        display_order: idx,
        mime_type: "image/webp",
      };
    });

    if (productImagesToInsert.length > 0) {
      const { error: imgError } = await supabase
        .from("product_images")
        .insert(productImagesToInsert);

      if (imgError) {
        console.error("[Product Save] product_images insert error:", imgError.message);
        // Roll back the product row so we don't leave orphaned partial data
        await supabase.from("products").delete().eq("id", createdProduct.id);

        if (imgError.code === "PGRST205") {
          return NextResponse.json(
            {
              ok: false,
              error:
                "Database table 'public.product_images' is not yet present in the Supabase schema cache. Please execute supabase/schema.sql in the Supabase Dashboard SQL Editor.",
            },
            { status: 500 }
          );
        }
        return NextResponse.json(
          { ok: false, error: `Failed to save product images: ${imgError.message}` },
          { status: 400 }
        );
      }
    }

    // 6. Return success
    return NextResponse.json(
      {
        ok: true,
        data: {
          ...createdProduct,
          images: imageList,
          storage_paths: Array.isArray(storagePaths) ? storagePaths : [],
          product_images: productImagesToInsert,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }

    if (!hasServiceRoleKey()) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Server Configuration Error: SUPABASE_SERVICE_ROLE_KEY is required in .env.local for administrative write operations. Please configure SUPABASE_SERVICE_ROLE_KEY in .env.local.",
        },
        { status: 500 }
      );
    }

    const supabase = getAdminSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { ok: false, error: "Database client not configured" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const {
      id,
      name,
      category,
      price,
      stock,
      shortDescription,
      description,
      image,
      images,
      storagePaths,
      active,
    } = body;

    if (!id) {
      return NextResponse.json({ ok: false, error: "Product ID is required" }, { status: 400 });
    }

    const updates: ProductUpdate = {};

    if (name !== undefined) updates.name = String(name).trim();
    if (category !== undefined) updates.category = normalizeProductCategory(category);
    if (price !== undefined) {
      const numPrice = Number(price);
      if (isNaN(numPrice) || numPrice < 0) {
        return NextResponse.json({ ok: false, error: "Price cannot be negative" }, { status: 400 });
      }
      updates.price = numPrice;
    }
    if (stock !== undefined) {
      const numStock = Number(stock);
      if (isNaN(numStock) || numStock < 0) {
        return NextResponse.json({ ok: false, error: "Stock cannot be negative" }, { status: 400 });
      }
      updates.stock = numStock;
    }
    if (shortDescription !== undefined) updates.short_description = String(shortDescription).trim();
    if (description !== undefined) updates.description = String(description).trim();

    // Check images array (Maximum 3 images per product)
    let cleanedImages: string[] | undefined;
    if (images !== undefined) {
      if (Array.isArray(images)) {
        cleanedImages = images.filter((img): img is string => typeof img === "string" && img.trim().length > 0);
        if (cleanedImages.length > MAX_IMAGES_PER_PRODUCT) {
          return NextResponse.json(
            { ok: false, error: `Limit reached: Maximum ${MAX_IMAGES_PER_PRODUCT} images allowed per product.` },
            { status: 400 }
          );
        }
        updates.images = cleanedImages;
        if (cleanedImages.length > 0) {
          updates.image = cleanedImages[0];
        }
      }
    } else if (image !== undefined) {
      updates.image = image;
    }

    if (storagePaths !== undefined && Array.isArray(storagePaths)) {
      updates.storage_paths = storagePaths;
    }

    // Enforce 20 active products maximum when toggling to active
    if (active !== undefined) {
      const shouldBeActive = Boolean(active);
      if (shouldBeActive) {
        const { data: currentProduct, error: fetchErr } = await supabase
          .from("products")
          .select("active")
          .eq("id", id)
          .single();

        if (fetchErr && fetchErr.code === "PGRST205") {
          return NextResponse.json(
            {
              ok: false,
              error:
                "Database table 'public.products' is not yet present in the Supabase schema cache. Please execute supabase/schema.sql in the Supabase Dashboard SQL Editor.",
            },
            { status: 500 }
          );
        }

        if (currentProduct && currentProduct.active === false) {
          const { count, error: countError } = await supabase
            .from("products")
            .select("*", { count: "exact", head: true })
            .eq("active", true);

          if (!countError && count !== null && count >= MAX_ACTIVE_PRODUCTS) {
            return NextResponse.json(
              {
                ok: false,
                error: `Limit reached: Maximum ${MAX_ACTIVE_PRODUCTS} active products allowed. Please deactivate an existing formulation first.`,
              },
              { status: 400 }
            );
          }
        }
      }
      updates.active = shouldBeActive;
    }

    const { data: updatedProduct, error: updateErr } = await supabase
      .from("products")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (updateErr) {
      if (updateErr.code === "PGRST205") {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Database table 'public.products' is not yet present in the Supabase schema cache. Please execute supabase/schema.sql in the Supabase Dashboard SQL Editor.",
          },
          { status: 500 }
        );
      }
      return NextResponse.json({ ok: false, error: updateErr.message }, { status: 400 });
    }

    // Synchronize product_images table if images were updated
    if (cleanedImages !== undefined) {
      // Delete existing product_images records for this product
      await supabase.from("product_images").delete().eq("product_id", id);

      if (cleanedImages.length > 0) {
        const paths = Array.isArray(storagePaths) ? storagePaths : [];
        const newImageRows = cleanedImages.map((imgUrl, idx) => {
          const sp = paths[idx] || extractStoragePath(imgUrl) || `products/${updatedProduct.slug}-${idx + 1}.webp`;
          const fileName = sp.split("/").pop() || `${updatedProduct.slug}-${idx + 1}.webp`;
          return {
            product_id: id,
            storage_path: sp,
            image_url: imgUrl,
            file_name: fileName,
            display_order: idx,
            mime_type: "image/webp",
          };
        });

        await supabase.from("product_images").insert(newImageRows);
      }
    }

    return NextResponse.json({ ok: true, data: updatedProduct });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }

    if (!hasServiceRoleKey()) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Server Configuration Error: SUPABASE_SERVICE_ROLE_KEY is required in .env.local for administrative write operations. Please configure SUPABASE_SERVICE_ROLE_KEY in .env.local.",
        },
        { status: 500 }
      );
    }

    const supabase = getAdminSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { ok: false, error: "Database client not configured" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ ok: false, error: "Product ID is required" }, { status: 400 });
    }

    // Collect all storage paths from product_images and products.storage_paths
    const pathsToRemove = new Set<string>();

    const { data: pImages } = await supabase
      .from("product_images")
      .select("storage_path")
      .eq("product_id", id);

    if (pImages && Array.isArray(pImages)) {
      for (const pi of pImages) {
        if (pi.storage_path) pathsToRemove.add(pi.storage_path);
      }
    }

    const { data: product } = await supabase
      .from("products")
      .select("storage_paths")
      .eq("id", id)
      .maybeSingle();

    if (product?.storage_paths && Array.isArray(product.storage_paths)) {
      for (const sp of product.storage_paths) {
        if (sp) pathsToRemove.add(sp);
      }
    }

    // Clean up associated storage files from Supabase Storage
    if (pathsToRemove.size > 0) {
      try {
        await supabase.storage.from("hospital-images").remove(Array.from(pathsToRemove));
      } catch (storageErr) {
        console.warn("[Supabase Storage] Failed to remove product images:", storageErr);
      }
    }

    // Clean up dependent order items if any exist
    try {
      await supabase.from("order_items").delete().eq("product_id", id);
    } catch (orderErr) {
      console.warn("[Admin Products DELETE] Notice cleaning up order items:", orderErr);
    }

    // Delete product row (CASCADE deletes associated product_images records)
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      if (error.code === "PGRST205") {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Database table 'public.products' is not yet present in the Supabase schema cache. Please execute supabase/schema.sql in the Supabase Dashboard SQL Editor.",
          },
          { status: 500 }
        );
      }
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
