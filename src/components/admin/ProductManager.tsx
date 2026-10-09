"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Edit2,
  ExternalLink,
  Eye,
  EyeOff,
  Plus,
  Search,
  Trash2,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import {
  subscribeProducts,
  fetchAdminProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
} from "@/lib/productService";
import type { Product, ProductCategory } from "@/types";
import {
  Badge,
  Button,
  Input,
  Modal,
  Select,
  Textarea,
  useToast,
} from "@/components/ui";
import ImageUpload, { type ImageUploadResult } from "@/components/admin/ImageUpload";

const MAX_ACTIVE_PRODUCTS = 20;
const MAX_IMAGES_PER_PRODUCT = 3;
const PAGE_SIZE = 6;

interface ProductFormData {
  name: string;
  category: ProductCategory;
  price: number;
  stock: number;
  shortDescription: string;
  description: string;
  images: string[];
  storagePaths: string[];
  active: boolean;
}

const emptyForm: ProductFormData = {
  name: "",
  category: "Wellness",
  price: 999,
  stock: 20,
  shortDescription: "",
  description: "",
  images: [],
  storagePaths: [],
  active: true,
};

/**
 * Compresses image file to WebP format targeting ~100-300 KB for slot replacement.
 */
async function compressImageToWebp(file: File, maxDim = 1600): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.onload = () => {
      const img = new window.Image();
      img.onerror = () => reject(new Error("Failed to load image"));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas context initialization failed"));
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error("WebP compression failed"));
          },
          "image/webp",
          0.82
        );
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export default function ProductManager() {
  const toast = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormData>(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [replacingIndex, setReplacingIndex] = useState<number | null>(null);

  // Confirmation Modal for Deletion
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const inFlightRef = useRef(false);

  const loadData = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    try {
      const list = await fetchAdminProducts();
      setProducts(list);
    } catch (err) {
      console.error("[ProductManager] Failed to load products from database:", err);
      setProducts([]);
    } finally {
      inFlightRef.current = false;
    }
  }, []);

  useEffect(() => {
    loadData();
    const unsub = subscribeProducts(loadData);
    return unsub;
  }, [loadData]);

  const activeCount = useMemo(() => {
    return products.filter((p) => p.active !== false).length;
  }, [products]);

  const categories = useMemo(() => {
    return ["All", "Herbal Formulation", "Therapeutic Oil", "Wellness", "Care"];
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.shortDescription.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        categoryFilter === "All" || p.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, categoryFilter]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, currentPage]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      active: activeCount < MAX_ACTIVE_PRODUCTS,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingId(p.id);
    const existingImages =
      p.images && p.images.length > 0
        ? p.images
        : p.image
        ? [p.image]
        : [];

    setForm({
      name: p.name,
      category: p.category,
      price: p.price,
      stock: p.stock,
      shortDescription: p.shortDescription,
      description: p.description,
      images: existingImages,
      storagePaths: p.storagePaths || [],
      active: p.active !== false,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Image Management Handlers
  const handleAddImage = (result: ImageUploadResult) => {
    if (form.images.length >= MAX_IMAGES_PER_PRODUCT) {
      toast.error("Limit Reached", `Maximum ${MAX_IMAGES_PER_PRODUCT} images allowed per product.`);
      return;
    }
    setForm((prev) => ({
      ...prev,
      images: [...prev.images, result.publicUrl],
      storagePaths: [...prev.storagePaths, result.storagePath || ""],
    }));
    setFormErrors((prev) => ({ ...prev, images: "" }));
  };

  const handleRemoveImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      storagePaths: prev.storagePaths.filter((_, i) => i !== index),
    }));
  };

  const handleMoveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= form.images.length) return;
    setForm((prev) => {
      const nextImages = [...prev.images];
      const nextPaths = [...prev.storagePaths];
      const [movedImg] = nextImages.splice(fromIndex, 1);
      const [movedPath] = nextPaths.splice(fromIndex, 1);
      nextImages.splice(toIndex, 0, movedImg);
      nextPaths.splice(toIndex, 0, movedPath);
      return {
        ...prev,
        images: nextImages,
        storagePaths: nextPaths,
      };
    });
  };

  const handleReplaceImageFile = async (index: number, file: File) => {
    setReplacingIndex(index);
    try {
      const compressedBlob = await compressImageToWebp(file);
      const formData = new FormData();
      const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
      formData.append("file", compressedBlob, newFileName);
      formData.append("bucket", "hospital-images");
      formData.append("folder", "products");

      const res = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Failed to upload replacement image.");
      }

      setForm((prev) => {
        const nextImages = [...prev.images];
        const nextPaths = [...prev.storagePaths];
        nextImages[index] = json.url;
        if (json.storagePath) nextPaths[index] = json.storagePath;
        return {
          ...prev,
          images: nextImages,
          storagePaths: nextPaths,
        };
      });
      toast.success("Image Replaced", `Slot #${index + 1} updated with optimized photo.`);
    } catch (err) {
      toast.error("Replace Failed", err instanceof Error ? err.message : "Upload error");
    } finally {
      setReplacingIndex(null);
    }
  };

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Product name is required.";
    if (form.price < 0 || isNaN(form.price)) errs.price = "Valid price is required.";
    if (form.stock < 0 || isNaN(form.stock)) errs.stock = "Valid stock number is required.";
    if (!form.shortDescription.trim()) errs.shortDescription = "Short summary is required.";
    if (form.images.length === 0) {
      errs.images = "At least one product image is required.";
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || isSaving) return;

    // Check active product count client-side (backed by server check)
    if (form.active) {
      if (!editingId && activeCount >= MAX_ACTIVE_PRODUCTS) {
        toast.error(
          "Limit Reached",
          `Maximum ${MAX_ACTIVE_PRODUCTS} active products allowed. Please deactivate an existing product first.`
        );
        return;
      } else if (editingId) {
        const currentItem = products.find((p) => p.id === editingId);
        if (currentItem && currentItem.active === false && activeCount >= MAX_ACTIVE_PRODUCTS) {
          toast.error(
            "Limit Reached",
            `Maximum ${MAX_ACTIVE_PRODUCTS} active products allowed. Please deactivate an existing product first.`
          );
          return;
        }
      }
    }

    setIsSaving(true);
    try {
      const primaryImage = form.images[0] || "";

      if (editingId) {
        await adminUpdateProduct(editingId, {
          name: form.name.trim(),
          category: form.category,
          price: Number(form.price),
          stock: Number(form.stock),
          shortDescription: form.shortDescription.trim(),
          description: form.description.trim() || form.shortDescription.trim(),
          image: primaryImage,
          images: form.images,
          storagePaths: form.storagePaths,
          active: form.active,
        });
        toast.success("Product Updated", `"${form.name}" was successfully updated.`);
      } else {
        const created = await adminCreateProduct({
          name: form.name.trim(),
          slug: form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          category: form.category,
          price: Number(form.price),
          stock: Number(form.stock),
          shortDescription: form.shortDescription.trim(),
          description: form.description.trim() || form.shortDescription.trim(),
          image: primaryImage,
          images: form.images,
          storagePaths: form.storagePaths,
          active: form.active,
        });
        toast.success("Product Added", `"${created.name}" is now saved.`);
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not save product to database.";
      toast.error("Save Failed", msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await adminDeleteProduct(productToDelete.id);
      toast.success("Product Removed", `"${productToDelete.name}" was deleted.`);
      setProductToDelete(null);
      await loadData();
    } catch (err) {
      toast.error("Delete Failed", err instanceof Error ? err.message : "Could not delete product.");
    }
  };

  const handleToggleActive = async (p: Product) => {
    const nextState = !p.active;
    if (nextState && activeCount >= MAX_ACTIVE_PRODUCTS) {
      toast.error(
        "Limit Reached",
        `Maximum ${MAX_ACTIVE_PRODUCTS} active products allowed. Deactivate another formulation first.`
      );
      return;
    }
    try {
      await adminUpdateProduct(p.id, { active: nextState });
      toast.info(
        nextState ? "Product Activated" : "Product Hidden",
        `"${p.name}" is now ${nextState ? "visible" : "hidden"} on the store.`
      );
      await loadData();
    } catch (err) {
      toast.error("Update Failed", err instanceof Error ? err.message : "Could not change visibility.");
    }
  };

  const handleQuickStockChange = async (p: Product, newStock: number) => {
    if (newStock < 0) return;
    try {
      await adminUpdateProduct(p.id, { stock: newStock });
      toast.success("Stock Adjusted", `${p.name} stock updated to ${newStock}.`);
      await loadData();
    } catch (err) {
      toast.error("Stock Update Failed", err instanceof Error ? err.message : "Could not update stock.");
    }
  };

  return (
    <div className="wrap admin-page-container">
      <div className="admin-page-header">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <Badge variant="gold">Dispensary Inventory</Badge>
            <Badge variant={activeCount >= MAX_ACTIVE_PRODUCTS ? "warning" : "neutral"} size="sm">
              Active: {activeCount} / {MAX_ACTIVE_PRODUCTS} Formulations
            </Badge>
          </div>
          <h1 style={{ marginTop: "6px" }}>Manage Herbal Formulations</h1>
          <p>
            Create, edit, change pricing and stocks, and toggle public visibility.
            Images compressed to WebP (100–300 KB) and stored in Supabase Storage.
          </p>
        </div>
        <div className="header-quick-actions" style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <Link href="/products" target="_blank">
            <Button variant="ghost" size="sm" icon={<ExternalLink size={15} />}>
              Public Store
            </Button>
          </Link>
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAdd}
            icon={<Plus size={16} />}
            id="admin-add-product-btn"
          >
            Add New Product
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-filter-bar">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search formulations by name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-pill-group">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`filter-pill ${categoryFilter === cat ? "active" : ""}`}
              onClick={() => setCategoryFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price (₹)</th>
              <th>Stock Status</th>
              <th>Visibility</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "36px", color: "var(--ink-muted)" }}>
                  No formulations found matching filters.
                </td>
              </tr>
            ) : (
              paginatedProducts.map((p) => {
                const isOutOfStock = p.stock <= 0;
                const photoCount = p.images?.length || (p.image ? 1 : 0);
                return (
                  <tr key={p.id}>
                    <td>
                      <div className="product-table-cell">
                        <div className="table-thumb" style={{ position: "relative" }}>
                          <Image
                            src={p.image || (p.images && p.images[0]) || "/images/g3.jpg"}
                            alt={p.name}
                            width={42}
                            height={42}
                            className="thumb-img"
                          />
                          {photoCount > 1 && (
                            <span
                              style={{
                                position: "absolute",
                                bottom: "-4px",
                                right: "-4px",
                                background: "var(--green)",
                                color: "#fff",
                                fontSize: "0.65rem",
                                fontWeight: 700,
                                borderRadius: "4px",
                                padding: "1px 3px",
                                lineHeight: 1,
                              }}
                              title={`${photoCount} images available`}
                            >
                              {photoCount}
                            </span>
                          )}
                        </div>
                        <div>
                          <strong>{p.name}</strong>
                          <div className="text-muted text-xs">/{p.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="category-pill">{p.category}</span>
                    </td>
                    <td>
                      <strong>₹{p.price.toLocaleString("en-IN")}</strong>
                    </td>
                    <td>
                      <div className="stock-control-cell">
                        <span className={isOutOfStock ? "stock-out" : "stock-in"}>
                          {isOutOfStock ? (
                            <Badge variant="danger" size="sm">Out of stock</Badge>
                          ) : p.stock <= 5 ? (
                            <Badge variant="warning" size="sm">{p.stock} units left</Badge>
                          ) : (
                            `${p.stock} units`
                          )}
                        </span>
                        <div className="quick-stock-buttons">
                          <button
                            type="button"
                            className="mini-btn"
                            title="Decrease stock by 5"
                            onClick={() =>
                              handleQuickStockChange(p, Math.max(0, p.stock - 5))
                            }
                          >
                            -5
                          </button>
                          <button
                            type="button"
                            className="mini-btn"
                            title="Increase stock by 5"
                            onClick={() => handleQuickStockChange(p, p.stock + 5)}
                          >
                            +5
                          </button>
                        </div>
                      </div>
                    </td>
                    <td>
                      <button
                        type="button"
                        className={`visibility-toggle ${p.active !== false ? "active" : "inactive"}`}
                        onClick={() => handleToggleActive(p)}
                        title={p.active !== false ? "Click to hide from store" : "Click to publish on store"}
                      >
                        {p.active !== false ? <Eye size={14} /> : <EyeOff size={14} />}
                        <span>{p.active !== false ? "Active" : "Hidden"}</span>
                      </button>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div className="table-actions-cell">
                        <Link href={`/products/${p.slug}`} target="_blank" className="action-icon-btn" title="View Public Page">
                          <ExternalLink size={15} />
                        </Link>
                        <button
                          type="button"
                          className="action-icon-btn"
                          title="Edit Formulation"
                          onClick={() => handleOpenEdit(p)}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          className="action-icon-btn danger"
                          title="Delete Formulation"
                          onClick={() => setProductToDelete(p)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="admin-pagination">
          <Button
            variant="ghost"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            icon={<ChevronLeft size={16} />}
          >
            Previous
          </Button>
          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            icon={<ChevronRight size={16} />}
          >
            Next
          </Button>
        </div>
      )}

      {/* Modal: Add or Edit Formulation */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Ayurvedic Formulation" : "Add New Formulation"}
        description="Configure details, 3 photos, inventory levels, and botanical indications."
        size="lg"
      >
        <form onSubmit={handleSubmit} className="admin-modal-form" style={{ marginTop: "12px" }}>
          <div className="modal-form-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
            <div style={{ gridColumn: "span 2" }}>
              <Input
                label="Product Name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Brahmi Rasayana"
                error={formErrors.name}
              />
            </div>

            <Select
              label="Category"
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value as ProductCategory })
              }
              options={[
                { value: "Wellness", label: "Wellness" },
                { value: "Herbal Formulation", label: "Herbal Formulation" },
                { value: "Therapeutic Oil", label: "Therapeutic Oil" },
                { value: "Care", label: "Care" },
              ]}
            />

            <Input
              label="Price (₹ INR)"
              required
              type="number"
              min={0}
              step="1"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              error={formErrors.price}
            />

            <Input
              label="Stock Units"
              required
              type="number"
              min={0}
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
              error={formErrors.stock}
            />

            <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
              <div style={{ fontSize: "0.85rem", color: "var(--ink-muted)", paddingBottom: "8px" }}>
                Active Status Limit: {activeCount} / {MAX_ACTIVE_PRODUCTS} active formulations in catalog.
              </div>
            </div>

            {/* PRODUCT IMAGE SYSTEM (Max 3 Images) */}
            <div style={{ gridColumn: "span 2", marginTop: "4px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "8px" }}>
                <label style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--ink)" }}>
                  Product Images (Maximum {MAX_IMAGES_PER_PRODUCT}) <span style={{ color: "var(--crimson)" }}>*</span>
                </label>
                <span style={{ fontSize: "0.8rem", color: "var(--ink-muted)" }}>
                  First image = Primary • Target ~100–300 KB WebP in Supabase Storage
                </span>
              </div>

              {formErrors.images && (
                <p style={{ color: "var(--crimson)", fontSize: "0.82rem", margin: "0 0 8px" }}>
                  {formErrors.images}
                </p>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                {[0, 1, 2].map((slotIndex) => {
                  const hasImage = slotIndex < form.images.length;
                  const imageUrl = form.images[slotIndex];
                  const isPrimary = slotIndex === 0 && hasImage;
                  const isReplacing = replacingIndex === slotIndex;

                  return (
                    <div
                      key={slotIndex}
                      style={{
                        border: isPrimary ? "2px solid var(--gold)" : "1px dashed var(--sand-deep, #cbd5e1)",
                        borderRadius: "10px",
                        padding: "10px",
                        background: "var(--cream, #fdfbf7)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                        minHeight: "185px",
                        position: "relative",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            color: isPrimary ? "var(--gold-hover, #9c6e28)" : "var(--ink-muted)",
                          }}
                        >
                          {isPrimary ? "★ Primary Image" : `Photo #${slotIndex + 1}`}
                        </span>

                        {hasImage && (
                          <div style={{ display: "flex", gap: "4px" }}>
                            {slotIndex > 0 && (
                              <button
                                type="button"
                                onClick={() => handleMoveImage(slotIndex, slotIndex - 1)}
                                title="Move Left (Reorder)"
                                style={{
                                  background: "#ffffff",
                                  border: "1px solid #cbd5e1",
                                  borderRadius: "4px",
                                  cursor: "pointer",
                                  padding: "2px 6px",
                                  fontSize: "0.75rem",
                                }}
                              >
                                <ArrowLeft size={12} />
                              </button>
                            )}
                            {slotIndex < form.images.length - 1 && (
                              <button
                                type="button"
                                onClick={() => handleMoveImage(slotIndex, slotIndex + 1)}
                                title="Move Right (Reorder)"
                                style={{
                                  background: "#ffffff",
                                  border: "1px solid #cbd5e1",
                                  borderRadius: "4px",
                                  cursor: "pointer",
                                  padding: "2px 6px",
                                  fontSize: "0.75rem",
                                }}
                              >
                                <ArrowRight size={12} />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(slotIndex)}
                              title="Remove Photo"
                              style={{
                                background: "#fee2e2",
                                border: "none",
                                color: "#dc2626",
                                borderRadius: "4px",
                                cursor: "pointer",
                                padding: "2px 6px",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        )}
                      </div>

                      {hasImage ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
                          <div
                            style={{
                              position: "relative",
                              width: "100%",
                              height: "100px",
                              borderRadius: "6px",
                              overflow: "hidden",
                              background: "#000",
                            }}
                          >
                            <Image
                              src={imageUrl}
                              alt={`Product photo ${slotIndex + 1}`}
                              fill
                              style={{ objectFit: "cover" }}
                              sizes="150px"
                            />
                          </div>
                          <label
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "4px",
                              padding: "4px 8px",
                              fontSize: "0.74rem",
                              borderRadius: "6px",
                              border: "1px solid #cbd5e1",
                              background: "#ffffff",
                              cursor: isReplacing ? "wait" : "pointer",
                              color: "var(--ink)",
                              marginTop: "auto",
                              fontWeight: 500,
                            }}
                          >
                            <RefreshCw size={11} className={isReplacing ? "animate-spin" : ""} />
                            <span>{isReplacing ? "Compressing..." : "Replace Photo"}</span>
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              style={{ display: "none" }}
                              disabled={isReplacing}
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handleReplaceImageFile(slotIndex, e.target.files[0]);
                                }
                              }}
                            />
                          </label>
                        </div>
                      ) : (
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                          {slotIndex === form.images.length ? (
                            <ImageUpload
                              bucket="hospital-images"
                              folder="products"
                              label={`+ Upload Photo #${slotIndex + 1}`}
                              onUploadComplete={(res) => handleAddImage(res)}
                            />
                          ) : (
                            <div
                              style={{
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#94a3b8",
                                fontSize: "0.76rem",
                                textAlign: "center",
                                padding: "12px 6px",
                              }}
                            >
                              Upload slot #{form.images.length + 1} first
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ gridColumn: "span 2" }}>
              <Input
                label="Short Description"
                required
                value={form.shortDescription}
                onChange={(e) =>
                  setForm({ ...form, shortDescription: e.target.value })
                }
                placeholder="Brief 1-line summary for product card..."
                error={formErrors.shortDescription}
              />
            </div>

            <div style={{ gridColumn: "span 2" }}>
              <Textarea
                label="Full Clinical Description"
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Detailed ingredients, classical usage, dosha indication..."
              />
            </div>

            <div style={{ gridColumn: "span 2" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.9rem" }}>
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                />
                <span>Active formulation (visible on public storefront — max 20 active)</span>
              </label>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" id="save-product-btn" disabled={isSaving}>
              {isSaving ? "Saving..." : editingId ? "Update Formulation" : "Save & Publish"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* REUSABLE MODAL: Delete Confirmation */}
      <Modal
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        title="Confirm Deletion"
        description={`Are you sure you want to delete "${productToDelete?.name}"?`}
        footer={
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <Button variant="ghost" onClick={() => setProductToDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete}>
              Delete Formulation
            </Button>
          </div>
        }
      >
        <p style={{ margin: 0, color: "var(--ink-light)", fontSize: "0.95rem" }}>
          This will permanently remove this item from the dispensary catalog and clean up its stored images.
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
