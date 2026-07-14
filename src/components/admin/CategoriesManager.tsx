"use client";

import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import ConfirmDialog from "./ui/ConfirmDialog";
import EmptyState from "./ui/EmptyState";
import Skeleton from "./ui/Skeleton";
import { useToast } from "./ui/ToastProvider";

export default function CategoriesManager() {
  const { showToast } = useToast();
  const categories = useQuery(api.categories.list);
  const create = useMutation(api.categories.create);
  const update = useMutation(api.categories.update);
  const remove = useMutation(api.categories.remove);
  const reorder = useMutation(api.categories.reorder);

  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<Id<"categories"> | null>(null);
  const [editName, setEditName] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<{ id: Id<"categories">; name: string } | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    setCreateError(null);
    try {
      await create({ name: newName.trim() });
      setNewName("");
      showToast("Category added.");
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Could not create category.");
    } finally {
      setCreating(false);
    }
  }

  function startEdit(id: Id<"categories">, name: string) {
    setEditingId(id);
    setEditName(name);
    setEditError(null);
  }

  async function saveEdit(id: Id<"categories">) {
    if (!editName.trim()) return;
    setSavingEdit(true);
    setEditError(null);
    try {
      await update({ id, name: editName.trim() });
      setEditingId(null);
      showToast("Category updated.");
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
      showToast("Category deleted.");
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Could not delete category.");
    } finally {
      setDeleting(false);
    }
  }

  function move(index: number, direction: -1 | 1) {
    if (!categories) return;
    const next = [...categories];
    const swapWith = index + direction;
    if (swapWith < 0 || swapWith >= next.length) return;
    [next[index], next[swapWith]] = [next[swapWith], next[index]];
    reorder({ orderedIds: next.map((c) => c._id) });
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
          <p className="mt-1 text-sm text-slate-500">Organize the menu — order here controls display order everywhere.</p>
        </div>
      </div>

      <form onSubmit={handleCreate} className="mt-6 flex flex-wrap gap-3">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New category name"
          className="min-w-[220px] flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
        />
        <button
          type="submit"
          disabled={creating || !newName.trim()}
          className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
        >
          {creating ? "Adding…" : "Add category"}
        </button>
      </form>
      {createError ? <p className="mt-2 text-sm font-medium text-red-600">{createError}</p> : null}

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {categories === undefined ? (
          <div className="space-y-3 p-4">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="p-6">
            <EmptyState title="No categories yet" description="Add your first category above to start building the menu." />
          </div>
        ) : (
          <ul className="divide-y divide-slate-200">
            {categories.map((category, index) => (
              <li key={category._id} className="flex items-center gap-3 px-4 py-3">
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
                    disabled={index === categories.length - 1}
                    aria-label="Move down"
                    className="text-slate-400 transition hover:text-slate-900 disabled:opacity-20"
                  >
                    ▼
                  </button>
                </div>

                <div className="min-w-0 flex-1">
                  {editingId === category._id ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        autoFocus
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="min-w-[180px] flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => saveEdit(category._id)}
                        disabled={savingEdit}
                        className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60"
                      >
                        Save
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
                    <p className="truncate font-semibold text-slate-900">{category.name}</p>
                  )}
                </div>

                {editingId !== category._id ? (
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(category._id, category.name)}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteTarget({ id: category._id, name: category.name });
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
        description="This can't be undone. Categories with products still assigned can't be deleted — move or delete those products first."
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
      {deleteError ? (
        <p className="mt-3 text-sm font-medium text-red-600">{deleteError}</p>
      ) : null}
    </div>
  );
}
