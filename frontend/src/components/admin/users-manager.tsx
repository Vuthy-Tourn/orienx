"use client";

import React, { useMemo, useState } from "react";
import { Check, Loader2, Search, ShieldCheck, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

interface AdminUser {
  id: string;
  email: string;
  status: string;
  roles: string[];
  full_name_en?: string | null;
  full_name_km?: string | null;
  province?: string | null;
  is_email_verified?: boolean;
  last_login_at?: string | null;
  created_at: string;
}

const ROLE_OPTIONS = ["STUDENT", "ADMIN", "SUPER_ADMIN"] as const;
const STATUS_OPTIONS = ["ACTIVE", "SUSPENDED", "PENDING"] as const;

function roleBadge(role: string) {
  if (role === "SUPER_ADMIN") return "bg-purple-50 text-purple-700 border-purple-200";
  if (role === "ADMIN") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  return "bg-slate-100 text-slate-600 border-slate-200";
}

export function UsersManager() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [nextStatus, setNextStatus] = useState("ACTIVE");
  const [nextRoles, setNextRoles] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const isSuperAdmin = currentUser?.roles?.includes("SUPER_ADMIN");

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => apiFetch<AdminUser[]>("/admin/users?limit=200"),
  });

  const filtered = useMemo(() => {
    if (!users) return [];
    const needle = search.trim().toLowerCase();
    return users.filter((user) => {
      if (roleFilter && !user.roles.includes(roleFilter)) return false;
      if (statusFilter && user.status !== statusFilter) return false;
      if (!needle) return true;
      return (
        user.email.toLowerCase().includes(needle) ||
        (user.full_name_en || "").toLowerCase().includes(needle) ||
        (user.full_name_km || "").toLowerCase().includes(needle)
      );
    });
  }, [users, search, roleFilter, statusFilter]);

  const { mutate: save, isPending: saving } = useMutation({
    mutationFn: async () => {
      if (!selected) return;
      const tasks: Promise<any>[] = [];
      if (nextStatus !== selected.status) {
        tasks.push(
          apiFetch(`/admin/users/${selected.id}/status`, {
            method: "PATCH",
            body: JSON.stringify({ status: nextStatus }),
          })
        );
      }
      const currentRoles = [...selected.roles].sort();
      const wantedRoles = [...nextRoles].sort();
      if (JSON.stringify(currentRoles) !== JSON.stringify(wantedRoles)) {
        tasks.push(
          apiFetch(`/admin/users/${selected.id}/roles`, {
            method: "PATCH",
            body: JSON.stringify({ roles: wantedRoles }),
          })
        );
      }
      await Promise.all(tasks);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-audit"] });
      setSelected(null);
      setError(null);
    },
    onError: (err: any) => setError(err?.message || "Could not update this account."),
  });

  const openManage = (user: AdminUser) => {
    setSelected(user);
    setNextStatus(user.status);
    setNextRoles([...user.roles]);
    setError(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-black text-[#111965]">Users & access</h2>
        <p className="text-xs text-[#68708A]">
          Search students, suspend accounts, and manage platform roles.
        </p>
      </div>

      <div className="rounded-2xl border border-[#E6E8F0] bg-white shadow-2xs">
        <div className="flex flex-col gap-2 border-b border-[#E6E8F0] p-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#68708A]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name or email…"
              className="h-9 w-full rounded-lg border border-[#E6E8F0] bg-[#F5F6FA]/70 pl-9 pr-3 text-xs text-[#171A2C] outline-none focus:border-[#111965] focus:bg-white"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            className="h-9 rounded-lg border border-[#E6E8F0] bg-white px-2.5 text-xs font-semibold text-[#171A2C]"
          >
            <option value="">All roles</option>
            {ROLE_OPTIONS.map((role) => (
              <option key={role} value={role}>
                {role.replace("_", " ")}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-9 rounded-lg border border-[#E6E8F0] bg-white px-2.5 text-xs font-semibold text-[#171A2C]"
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-xs text-[#68708A]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading users…
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#68708A]">No users match those filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-xs">
              <thead>
                <tr className="border-b border-[#E6E8F0] bg-[#F8FAFD] text-[11px] uppercase tracking-wider text-[#68708A]">
                  <th className="px-4 py-3 font-bold">User</th>
                  <th className="px-4 py-3 font-bold">Roles</th>
                  <th className="px-4 py-3 font-bold">Status</th>
                  <th className="px-4 py-3 font-bold">Joined</th>
                  <th className="px-4 py-3 text-right font-bold">Manage</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => {
                  const isSelf = user.id === currentUser?.id;
                  const isTargetSuper = user.roles.includes("SUPER_ADMIN");
                  const locked = isSelf || (isTargetSuper && !isSuperAdmin);
                  return (
                    <tr key={user.id} className="border-b border-[#E6E8F0] last:border-b-0">
                      <td className="px-4 py-3">
                        <div className="font-bold text-[#111965]">
                          {user.full_name_en || user.full_name_km || user.email.split("@")[0]}
                          {isSelf && (
                            <span className="ml-1.5 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#68708A]">{user.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map((role) => (
                            <span
                              key={role}
                              className={cn(
                                "rounded-md border px-1.5 py-0.5 text-[10px] font-black",
                                roleBadge(role)
                              )}
                            >
                              {role.replace("_", " ")}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "rounded-md border px-2 py-0.5 text-[10px] font-black",
                            user.status === "ACTIVE"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : user.status === "SUSPENDED"
                              ? "border-rose-200 bg-rose-50 text-rose-700"
                              : "border-amber-200 bg-amber-50 text-amber-700"
                          )}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[11px] text-[#68708A]">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => openManage(user)}
                          disabled={locked}
                          title={locked ? "You cannot modify this account" : "Manage account"}
                          className="inline-flex items-center gap-1 rounded-lg border border-[#E6E8F0] px-2.5 py-1.5 text-[11px] font-bold text-[#111965] hover:bg-[#F0F2FA] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <ShieldCheck className="h-3 w-3" />
                          Manage
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#0A0F3D]/50 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Manage user"
        >
          <div className="my-8 w-full max-w-lg rounded-3xl border border-[#E6E8F0] bg-white p-5 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-3 border-b border-[#E6E8F0] pb-3">
              <div>
                <h3 className="text-base font-black text-[#111965]">Manage account</h3>
                <p className="text-xs text-[#68708A]">{selected.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-lg p-1.5 text-[#68708A] hover:bg-slate-100"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {error && (
              <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">
                {error}
              </div>
            )}

            <div className="mt-4 space-y-4">
              <label className="block space-y-1.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#68708A]">
                  Account status
                </span>
                <select
                  value={nextStatus}
                  onChange={(event) => setNextStatus(event.target.value)}
                  className="h-10 w-full rounded-xl border border-[#E6E8F0] bg-white px-3 text-xs font-semibold text-[#171A2C]"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-[#68708A]">
                  Suspending an account also revokes its active refresh sessions.
                </p>
              </label>

              <div className="space-y-1.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#68708A]">
                  Roles
                </span>
                <div className="grid gap-1.5 sm:grid-cols-3">
                  {ROLE_OPTIONS.map((role) => {
                    const disabled = role === "SUPER_ADMIN" && !isSuperAdmin;
                    const active = nextRoles.includes(role);
                    return (
                      <button
                        key={role}
                        type="button"
                        disabled={disabled}
                        onClick={() =>
                          setNextRoles((prev) =>
                            prev.includes(role)
                              ? prev.filter((item) => item !== role)
                              : [...prev, role]
                          )
                        }
                        className={cn(
                          "rounded-xl border px-3 py-2 text-left text-[11px] font-bold transition-colors",
                          active
                            ? "border-[#111965] bg-[#111965] text-white"
                            : "border-[#E6E8F0] bg-white text-[#68708A] hover:border-slate-300",
                          disabled && "cursor-not-allowed opacity-40"
                        )}
                      >
                        {role.replace("_", " ")}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-[#68708A]">
                  At least one role must remain. Only a super admin can grant super admin.
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2 border-t border-[#E6E8F0] pt-4">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-xl border border-[#E6E8F0] px-4 py-2 text-xs font-bold text-[#68708A] hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => save()}
                disabled={saving || nextRoles.length === 0}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#F7CE4D] px-4 py-2 text-xs font-black text-[#111965] hover:bg-[#E5BD3B] disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
