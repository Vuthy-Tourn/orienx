"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  Check,
  Crown,
  FilterX,
  GraduationCap,
  Loader2,
  RotateCcw,
  Search,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/contexts/auth-context";
import { cn, getErrorMessage } from "@/lib/utils";
import {
  AdminFilterDropdown,
  type FilterOption,
} from "./admin-filter-dropdown";
import { AdminPagination } from "./admin-pagination";

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
const PAGE_SIZE = 10;

function roleBadge(role: string) {
  if (role === "SUPER_ADMIN") return "bg-purple-50 text-purple-700 border-purple-200";
  if (role === "ADMIN") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  return "bg-slate-100 text-slate-600 border-slate-200";
}

export function UsersManager() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [nextStatus, setNextStatus] = useState("ACTIVE");
  const [nextRoles, setNextRoles] = useState<string[]>([]);

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

  const hasActiveFilters = Boolean(search || roleFilter || statusFilter);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const resetFilters = () => {
    setSearch("");
    setRoleFilter("");
    setStatusFilter("");
    setPage(1);
  };

  const roleCounts = useMemo(() => {
    if (!users) return { total: 0, STUDENT: 0, ADMIN: 0, SUPER_ADMIN: 0 };
    return {
      total: users.length,
      STUDENT: users.filter((u) => u.roles?.includes("STUDENT")).length,
      ADMIN: users.filter((u) => u.roles?.includes("ADMIN")).length,
      SUPER_ADMIN: users.filter((u) => u.roles?.includes("SUPER_ADMIN")).length,
    };
  }, [users]);

  const statusCounts = useMemo(() => {
    if (!users) return { total: 0, ACTIVE: 0, SUSPENDED: 0, PENDING: 0 };
    return {
      total: users.length,
      ACTIVE: users.filter((u) => u.status === "ACTIVE").length,
      SUSPENDED: users.filter((u) => u.status === "SUSPENDED").length,
      PENDING: users.filter((u) => u.status === "PENDING").length,
    };
  }, [users]);

  const roleFilterOptions = useMemo<FilterOption[]>(
    () => [
      {
        value: "",
        label: "All roles",
        description: "All registered account types",
        count: roleCounts.total,
        icon: Users,
      },
      {
        value: "STUDENT",
        label: "Student",
        description: "Learners & test takers",
        count: roleCounts.STUDENT,
        icon: GraduationCap,
        badgeClass: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
      },
      {
        value: "ADMIN",
        label: "Admin",
        description: "Platform & content moderators",
        count: roleCounts.ADMIN,
        icon: ShieldCheck,
        badgeClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
      },
      {
        value: "SUPER_ADMIN",
        label: "Super Admin",
        description: "Full system & permission control",
        count: roleCounts.SUPER_ADMIN,
        icon: Crown,
        badgeClass: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300",
      },
    ],
    [roleCounts]
  );

  const statusFilterOptions = useMemo<FilterOption[]>(
    () => [
      {
        value: "",
        label: "All statuses",
        description: "Active, suspended & pending",
        count: statusCounts.total,
        icon: Activity,
      },
      {
        value: "ACTIVE",
        label: "Active",
        description: "Full platform & sign-in access",
        count: statusCounts.ACTIVE,
        indicator: (
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
        ),
        badgeClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
      },
      {
        value: "SUSPENDED",
        label: "Suspended",
        description: "Access locked & sessions revoked",
        count: statusCounts.SUSPENDED,
        indicator: <span className="inline-block h-2 w-2 rounded-full bg-rose-500" />,
        badgeClass: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
      },
      {
        value: "PENDING",
        label: "Pending",
        description: "Awaiting email verification",
        count: statusCounts.PENDING,
        indicator: <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />,
        badgeClass: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
      },
    ],
    [statusCounts]
  );

  useEffect(() => {
    if (!selected) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selected]);

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
      toast.success("Account updated.");
    },
    onError: (err: unknown) =>
      toast.error(getErrorMessage(err, "Could not update this account.")),
  });

  const openManage = (user: AdminUser) => {
    setSelected(user);
    setNextStatus(user.status);
    setNextRoles([...user.roles]);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-black text-[#111965]">Users & access</h2>
        <p className="text-xs text-[#68708A]">
          Search students, suspend accounts, and manage platform roles.
        </p>
      </div>

      <div className="rounded-2xl border border-[#E6E8F0] bg-white shadow-2xs dark:border-slate-800 dark:bg-[#090D24]">
        {/* Filter Controls Toolbar */}
        <div className="flex flex-col gap-2.5 border-b border-[#E6E8F0] p-3 sm:flex-row sm:items-center dark:border-slate-800">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#68708A] dark:text-slate-400" />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search by name or email…"
              className="h-9 w-full rounded-xl border border-[#E6E8F0] bg-[#F5F6FA]/70 pl-9 pr-8 text-xs text-[#171A2C] outline-none transition-colors focus:border-[#111965] focus:bg-white dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:bg-slate-900"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-[#68708A] hover:text-[#171A2C] dark:text-slate-400 dark:hover:text-white"
                title="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <AdminFilterDropdown
              label="Role"
              value={roleFilter}
              onChange={(value) => {
                setRoleFilter(value);
                setPage(1);
              }}
              options={roleFilterOptions}
              icon={Users}
              menuWidth="w-72"
            />

            <AdminFilterDropdown
              label="Status"
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(value);
                setPage(1);
              }}
              options={statusFilterOptions}
              icon={Activity}
              menuWidth="w-72"
            />

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-dashed border-[#E6E8F0] px-2.5 text-xs font-bold text-[#68708A] transition-colors hover:border-slate-400 hover:text-[#111965] dark:border-slate-800 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-white"
                title="Reset all active filters"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset</span>
              </button>
            )}

            <div className="hidden text-[11px] font-semibold text-[#68708A] dark:text-slate-400 xl:inline-block pl-2 border-l border-[#E6E8F0] dark:border-slate-800">
              Showing <strong className="text-[#111965] dark:text-slate-200">{filtered.length}</strong> of{" "}
              {users?.length || 0}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-xs text-[#68708A]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading users…
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F0F2FA] text-[#111965] dark:bg-slate-800 dark:text-indigo-300">
              <FilterX className="h-6 w-6" />
            </div>
            <h3 className="mt-3 text-sm font-bold text-[#111965] dark:text-white">
              No users match those filters
            </h3>
            <p className="mt-1 max-w-sm text-xs text-[#68708A] dark:text-slate-400">
              Try adjusting your search query, or clear your active role and status filters to view all accounts.
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#111965] px-3.5 py-2 text-xs font-bold text-white transition-colors hover:bg-[#1E277A] dark:bg-indigo-600 dark:hover:bg-indigo-500"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset all filters
              </button>
            )}
          </div>
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
                {visible.map((user, index) => {
                  const isSelf = user.id === currentUser?.id;
                  const isTargetSuper = user.roles.includes("SUPER_ADMIN");
                  const locked = isSelf || (isTargetSuper && !isSuperAdmin);
                  return (
                    <tr
                      key={user.id}
                      className="admin-table-row border-b border-[#E6E8F0] last:border-b-0 dark:border-white/10"
                      style={{ animationDelay: `${Math.min(index, 12) * 22}ms` }}
                    >
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

        {!isLoading && (
          <AdminPagination
            page={currentPage}
            pageCount={pageCount}
            totalItems={filtered.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            itemLabel="users"
            itemSingular="user"
          />
        )}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-[#0A0F3D]/50 p-4 backdrop-blur-sm sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Manage user"
          onClick={(event) => {
            if (!dialogRef.current?.contains(event.target as Node)) setSelected(null);
          }}
        >
          <div className="flex min-h-full items-center justify-center">
            <div
              ref={dialogRef}
              className="w-full max-w-lg rounded-3xl border border-[#E6E8F0] bg-white p-5 shadow-2xl sm:p-6"
              onClick={(event) => event.stopPropagation()}
            >
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

            <div className="mt-4 space-y-4">
              <div className="space-y-1.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#68708A]">
                  Account status
                </span>
                <div className="grid gap-2 sm:grid-cols-3">
                  {[
                    {
                      value: "ACTIVE",
                      label: "Active",
                      desc: "Full sign-in access",
                      dotColor: "bg-emerald-500",
                      activeClass:
                        "border-emerald-500 bg-emerald-50/60 text-emerald-950 dark:border-emerald-500 dark:bg-emerald-950/30 dark:text-emerald-200",
                    },
                    {
                      value: "SUSPENDED",
                      label: "Suspended",
                      desc: "Access revoked",
                      dotColor: "bg-rose-500",
                      activeClass:
                        "border-rose-500 bg-rose-50/60 text-rose-950 dark:border-rose-500 dark:bg-rose-950/30 dark:text-rose-200",
                    },
                    {
                      value: "PENDING",
                      label: "Pending",
                      desc: "Needs verify",
                      dotColor: "bg-amber-500",
                      activeClass:
                        "border-amber-500 bg-amber-50/60 text-amber-950 dark:border-amber-500 dark:bg-amber-950/30 dark:text-amber-200",
                    },
                  ].map((opt) => {
                    const isSelected = nextStatus === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setNextStatus(opt.value)}
                        className={cn(
                          "flex flex-col items-start gap-1 rounded-xl border p-2.5 text-left transition-all",
                          isSelected
                            ? cn("shadow-xs ring-1 ring-black/5 dark:ring-white/10", opt.activeClass)
                            : "border-[#E6E8F0] bg-white text-[#68708A] hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
                        )}
                      >
                        <div className="flex w-full items-center justify-between">
                          <span className="flex items-center gap-1.5 text-xs font-bold text-[#171A2C] dark:text-slate-200">
                            <span className={cn("h-2 w-2 rounded-full", opt.dotColor)} />
                            {opt.label}
                          </span>
                          {isSelected && (
                            <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                          )}
                        </div>
                        <span className="text-[10px] text-[#68708A] dark:text-slate-400">
                          {opt.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-[#68708A]">
                  Suspending an account also revokes its active refresh sessions immediately.
                </p>
              </div>

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
        </div>
      )}
    </div>
  );
}
