"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Edit2, ExternalLink, Plus, Trash2 } from "lucide-react";
import {
  adminCreateBlog,
  adminDeleteBlog,
  adminUpdateBlog,
  fetchAdminBlogs,
  type UnifiedBlog,
} from "@/lib/blogService";
import { Badge, Button, Input, Modal, Select, Textarea, useToast } from "@/components/ui";
import ImageUpload, { type ImageUploadResult } from "@/components/admin/ImageUpload";

interface BlogFormState {
  title: string;
  slug: string;
  category: string;
  author: string;
  readTime: string;
  excerpt: string;
  body: string;
  featuredImage: string;
  storagePath?: string;
  published: boolean;
}

const emptyForm: BlogFormState = {
  title: "",
  slug: "",
  category: "Ayurvedic Basics",
  author: "Charak Medical Team",
  readTime: "4 min read",
  excerpt: "",
  body: "",
  featuredImage: "",
  storagePath: "",
  published: true,
};

export default function BlogManager() {
  const toast = useToast();
  const [blogs, setBlogs] = useState<UnifiedBlog[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<UnifiedBlog | null>(null);
  const [blogToDelete, setBlogToDelete] = useState<UnifiedBlog | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState<BlogFormState>(emptyForm);

  const loadData = async () => {
    try {
      const list = await fetchAdminBlogs();
      setBlogs(list);
    } catch (err) {
      console.error("[BlogManager] Failed to load blogs from database:", err);
      setBlogs([]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingBlog(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: UnifiedBlog) => {
    setEditingBlog(b);
    setForm({
      title: b.title,
      slug: b.slug,
      category: b.category,
      author: b.author,
      readTime: b.readTime,
      excerpt: b.excerpt,
      body: Array.isArray(b.content) ? b.content.join("\n\n") : (b.body ? b.body.join("\n\n") : ""),
      featuredImage: b.featuredImage || "",
      storagePath: b.storagePath || "",
      published: b.published !== false,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.excerpt.trim() || isSaving) return;

    setIsSaving(true);
    try {
      const contentArray = form.body
        ? form.body.split("\n\n").filter(Boolean)
        : [form.excerpt.trim()];

      if (editingBlog) {
        await adminUpdateBlog(editingBlog.id, {
          title: form.title.trim(),
          slug: form.slug.trim() || form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          category: form.category,
          author: form.author.trim(),
          readTime: form.readTime.trim(),
          excerpt: form.excerpt.trim(),
          content: contentArray,
          body: contentArray,
          featuredImage: form.featuredImage || undefined,
          storagePath: form.storagePath || undefined,
          published: form.published,
        });
        toast.success("Article Updated", `"${form.title}" updated.`);
      } else {
        await adminCreateBlog({
          title: form.title.trim(),
          slug: form.slug.trim() || form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          category: form.category,
          author: form.author.trim(),
          readTime: form.readTime.trim(),
          excerpt: form.excerpt.trim(),
          content: contentArray,
          featuredImage: form.featuredImage || undefined,
          storagePath: form.storagePath || undefined,
          published: form.published,
        });
        toast.success("Article Saved", `"${form.title}" is saved.`);
      }

      setIsModalOpen(false);
      await loadData();
    } catch {
      toast.error("Save Failed", "Could not save article.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublished = async (b: UnifiedBlog) => {
    const nextState = !b.published;
    await adminUpdateBlog(b.id, { published: nextState });
    toast.info(
      nextState ? "Article Published" : "Article Drafted",
      `"${b.title}" is now ${nextState ? "visible publicly" : "drafted (hidden)"}.`
    );
    await loadData();
  };

  const handleConfirmDelete = async () => {
    if (!blogToDelete) return;
    try {
      await adminDeleteBlog(blogToDelete.id);
      await loadData();
      toast.success("Article Deleted", `"${blogToDelete.title}" removed.`);
    } catch {
      toast.error("Delete Failed", "Could not delete article.");
    } finally {
      setBlogToDelete(null);
    }
  };

  return (
    <div className="wrap admin-page-container">
      <div className="admin-page-header">
        <div>
          <Badge variant="gold">Educational Insights</Badge>
          <h1 style={{ marginTop: "6px" }}>Manage Health &amp; Ayurveda Blog</h1>
          <p>
            Publish articles on Tridoshas, classical Panchakarma detox, and Ayurvedic lifestyle guidelines.
          </p>
        </div>
        <div className="header-quick-actions" style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <Link href="/blog" target="_blank">
            <Button variant="ghost" size="sm" icon={<ExternalLink size={15} />}>
              Public Blog
            </Button>
          </Link>
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAdd}
            icon={<Plus size={16} />}
          >
            Create Blog
          </Button>
        </div>
      </div>

      {blogs.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            background: "#ffffff",
            borderRadius: "16px",
            border: "1px dashed var(--border)",
            marginTop: "16px",
          }}
        >
          <BookOpen size={48} color="var(--gold)" style={{ margin: "0 auto 16px", opacity: 0.8 }} />
          <h3 style={{ fontSize: "1.3rem", marginBottom: "8px", color: "var(--green)" }}>No blog posts yet.</h3>
          <p style={{ color: "var(--ink-light)", maxWidth: "440px", margin: "0 auto 20px", fontSize: "0.95rem" }}>
            Write and publish educational clinical articles on Ayurvedic healing, seasonal detox, and daily wellness.
          </p>
          <Button variant="primary" onClick={handleOpenAdd} icon={<Plus size={16} />}>
            Create Blog
          </Button>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Article Title</th>
                <th>Category</th>
                <th>Date</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {blogs.map((b) => (
                <tr key={b.id}>
                  <td>
                    <strong>{b.title}</strong>
                    <span className="text-muted text-xs" style={{ display: "block" }}>/{b.slug}</span>
                  </td>
                  <td>
                    <Badge variant="neutral">{b.category}</Badge>
                  </td>
                  <td>
                    <span className="text-sm text-muted">{b.date}</span>
                  </td>
                  <td>
                    <Badge variant={b.published !== false ? "success" : "neutral"}>
                      {b.published !== false ? "Published" : "Draft"}
                    </Badge>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div className="table-actions-cell">
                      <button
                        type="button"
                        className="action-icon-btn"
                        title="Edit Article"
                        onClick={() => handleOpenEdit(b)}
                      >
                        <Edit2 size={14} color="var(--gold)" />
                      </button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTogglePublished(b)}
                      >
                        {b.published !== false ? "Unpublish" : "Publish"}
                      </Button>
                      <button
                        type="button"
                        className="action-icon-btn"
                        title="Delete Article"
                        onClick={() => setBlogToDelete(b)}
                        style={{ color: "var(--crimson)" }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Blog Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBlog ? `Edit: ${editingBlog.title}` : "New Clinical Article"}
      >
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Input
            label="Article Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Understanding Tridoshas: Vata, Pitta, Kapha"
            required
          />
          <Input
            label="URL Slug (Unique)"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            placeholder="understanding-tridosha"
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <Select
              label="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              options={[
                { value: "Ayurvedic Basics", label: "Ayurvedic Basics" },
                { value: "Therapies", label: "Therapies & Panchakarma" },
                { value: "Lifestyle", label: "Lifestyle & Daily Rituals" },
                { value: "Joint Care", label: "Joint Care & Mobility" },
                { value: "Skin Health", label: "Skin Health" },
              ]}
            />
            <Input
              label="Estimated Read Time"
              value={form.readTime}
              onChange={(e) => setForm({ ...form, readTime: e.target.value })}
              placeholder="4 min read"
            />
          </div>

          <Input
            label="Author"
            value={form.author}
            onChange={(e) => setForm({ ...form, author: e.target.value })}
            placeholder="Charak Medical Team"
          />

          <Textarea
            label="Short Excerpt (Summary for Cards)"
            value={form.excerpt}
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            placeholder="A concise overview explaining the key concepts of the article..."
            rows={2}
            required
          />

          <Textarea
            label="Article Body (Separate paragraphs with double newlines)"
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            placeholder="Paragraph 1...&#10;&#10;Paragraph 2..."
            rows={5}
          />

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "8px", color: "var(--ink)" }}>
              Featured Cover Image (Optimized WebP)
            </label>
            <ImageUpload
              bucket="hospital-images"
              folder="blogs"
              currentImageUrl={form.featuredImage || undefined}
              onUploadComplete={(result: ImageUploadResult) => {
                setForm((prev) => ({
                  ...prev,
                  featuredImage: result.publicUrl,
                  storagePath: result.storagePath,
                }));
              }}
              onRemove={() => {
                setForm((prev) => ({
                  ...prev,
                  featuredImage: "",
                  storagePath: "",
                }));
              }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input
              type="checkbox"
              id="blog-published"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
            />
            <label htmlFor="blog-published" style={{ fontSize: "0.9rem", cursor: "pointer" }}>
              Publish immediately (visible to public website visitors)
            </label>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : editingBlog ? "Save Changes" : "Publish Article"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(blogToDelete)}
        onClose={() => setBlogToDelete(null)}
        title="Confirm Article Deletion"
      >
        <p>Are you sure you want to delete <strong>{blogToDelete?.title}</strong>? This action cannot be undone.</p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
          <Button variant="ghost" onClick={() => setBlogToDelete(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleConfirmDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
