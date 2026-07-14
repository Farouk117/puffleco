"use client";

import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { formatNaira } from "@/lib/data";
import ConfirmDialog from "./ui/ConfirmDialog";
import EmptyState from "./ui/EmptyState";
import Skeleton from "./ui/Skeleton";
import { useToast } from "./ui/ToastProvider";

type EditState = { name: string; price: string; active: boolean; imageStorageId?: Id<"_storage">; imagePreview: string | null };

export default function ToppingsManager() {
  const { showToast } = useToast();
  const toppings = useQuery(api.toppings.listAll);
  const create = useMutation(api.toppings.create);
  const update = useMutation(api.toppings.update);
  const remove = useMutation(api.toppings.remove);
  const reorder = useMutation(api.toppings.reorder);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newImageId, setNewImageId] = useState<Id<"_storage"> | undefined>(undefined);
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
  const [newUploading, setNewUploading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<Id<"toppings"> | null>(null);
  const [edit, setEdit] = useState<EditState>({ name: "", price: "", active: true, imagePreview: null });
  const [editUploading, setEditUploading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<{ id: Id<"toppings">; name: string } | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function uploadFile(file: File): Promise<Id<"_storage">> {
    const uploadUrl = await generateUploadUrl();
    const res = await fetch(uploadUrl, { method: "POST", headers: { "Content-Type": file.type }, body: file });
    const { storageId } = await res.json();
    return storageId;
  }

  async function handleNewImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewImagePreview(URL.createObjectURL(file));
    setNewUploading(true);
    try {
      setNewImageId(await uploadFile(file));
    } catch {
      setCreateError("Image upload failed.");
    } finally {
      setNewUploading(false);
    }
  }

  async function handleEditImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setEdit((s) => ({ ...s, imagePreview: URL.createObjectURL(file) }));
    setEditUploading(true);
    try {
      const storageId = await uploadFile(file);
      setEdit((s) => ({ ...s, imageStorageId: storageId }));
    } catch {
      setEditError("Image upload failed.");
    } finally {
      setEditUploading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const price = Number(newPrice);
    if (!newName.trim() || Number.isNaN(price) || price < 0) return;
    setCreating(true);
    setCreateError(null);
    try {
      await create({ name: newName.trim(), price, imageStorageId: newImageId });
      setNewName("");
      setNewPrice("");
      setNewImageId(undefined);
      setNewImagePreview(null);
      showToast("Topping added.");
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Could not create topping.");
    } finally {
      setCreating(false);
    }
  }

  function startEdit(t: { _id: Id<"toppings">; name: string; price: number; active: boolean; imageStorageId?: Id<"_storage">; imageUrl: string | null }) {
    setEditingId(t._id);
    setEdit({ name: t.name, price: String(t.price), active: t.active, imageStorageId: t.imageStorageId, imagePreview: t.imageUrl });
    setEditError(null);
  }

  async function saveEdit(id: Id<"toppings">) {
    const price = Number(edit.price);
    if (!edit.name.trim() || Number.isNaN(price) || price < 0) {
      setEditError("Enter a valid name and price.");
      return;
    }
    setSavingEdit(true);
    setEditError(null);
    try {
      await update({ id, name: edit.name.trim(), price, active: edit.active, imageStorageId: edit.imageStorageId });
      setEditingId(null);
      showToast("Topping updated.");
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Could not save changes.");
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await remove({ id: deleteTarget.id });
      setDeleteTarget(null);
      showToast("Topping deleted.");
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Could not delete topping.");
    } finally {
      setDeleting(false);
    }
  }

  function move(index: number, direction: -1 | 1) {
    if (!toppings) return;
    const next = [...toppings];
    const swapWith = index + direction;
    if (swapWith < 0 || swapWith >= next.length) return;
    [next[index], next[swapWith]] = [next[swapWith], next[index]];
    reorder({ orderedIds: next.map((t) => t._id) });
  }

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Toppings</h1>
        <p className="mt-1 text-sm text-slate-500">Manage add-ons, images, and their prices. Inactive toppings are hidden from customers.</p>
      </div>

      <form onSubmit={handleCreate} className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">
          {newImagePreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={newImagePreview} alt="" className="h-full w-full object-cover" />
          ) : null}
        </div>
        <input type="file" accept="image/*" onChange={handleNewImageChange} className="w-32 text-xs" />
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Topping name"
          className="min-w-[180px] flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
        />
        <input
          value={newPrice}
          onChange={(e) => setNewPrice(e.target.value)}
          placeholder="Price (₦)"
          inputMode="numeric"
          className="w-28 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
        />
        <button
          type="submit"
          disabled={creating || newUploading || !newName.trim() || !newPrice}
          className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
        >
          {creating ? "Adding…" : newUploading ? "Uploading…" : "Add topping"}
        </button>
      </form>
      {createError ? <p className="mt-2 text-sm font-medium text-red-600">{createError}</p> : null}

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {toppings === undefined ? (
          <div className="space-y-3 p-4">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : toppings.length === 0 ? (
          <div className="p-6">
            <EmptyState title="No toppings yet" description="Add your first topping above." />
          </div>
        ) : (
          <ul className="divide-y divide-slate-200">
            {toppings.map((topping, index) => (
              <li key={topping._id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    aria-label="Move up"
                    className="text-slate-400 transition hover:text-slate-900 disabled:opacity-20"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === toppings.length - 1}
                    aria-label="Move down"
                    className="text-slate-400 transition hover:text-slate-900 disabled:opacity-20"
                  >
                    ▼
                  </button>
                </div>

                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                  {(editingId === topping._id ? edit.imagePreview : topping.imageUrl) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={(editingId === topping._id ? edit.imagePreview : topping.imageUrl) ?? undefined}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>

                <div className="min-w-0 flex-1">
                  {editingId === topping._id ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <input type="file" accept="image/*" onChange={handleEditImageChange} className="w-28 text-xs" />
                      <input
                        autoFocus
                        value={edit.name}
                        onChange={(e) => setEdit((s) => ({ ...s, name: e.target.value }))}
                        className="min-w-[140px] flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-slate-900"
                      />
                      <input
                        value={edit.price}
                        onChange={(e) => setEdit((s) => ({ ...s, price: e.target.value }))}
                        inputMode="numeric"
                        className="w-24 rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-slate-900"
                      />
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                        <input
                          type="checkbox"
                          checked={edit.active}
                          onChange={(e) => setEdit((s) => ({ ...s, active: e.target.checked }))}
                        />
                        Active
                      </label>
                      <button
                        type="button"
                        onClick={() => saveEdit(topping._id)}
                        disabled={savingEdit || editUploading}
                        className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60"
                      >
                        {editUploading ? "Uploading…" : "Save"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-600"
                      >
                        Cancel
                      </button>
                      {editError ? <p className="w-full text-xs font-medium text-red-600">{editError}</p> : null}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <p className="truncate font-semibold text-slate-900">{topping.name}</p>
                      <span className="text-sm font-bold text-slate-500">+{formatNaira(topping.price)}</span>
                      {!topping.active ? (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500">Inactive</span>
                      ) : null}
                    </div>
                  )}
                </div>

                {editingId !== topping._id ? (
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(topping)}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteTarget({ id: topping._id, name: topping.name });
                        setDeleteError(null);
                      }}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This can't be undone. Toppings still assigned to a product can't be deleted — remove them from those products first."
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
      {deleteError ? <p className="mt-3 text-sm font-medium text-red-600">{deleteError}</p> : null}
    </div>
  );
}
