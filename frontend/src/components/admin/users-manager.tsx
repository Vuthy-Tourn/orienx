"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  Check,
  Crown,
  FilterX,
  GraduationCap,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
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
  avatar_url?: string | null;
  is_email_verified?: boolean;
  last_login_at?: string | null;
  created_at: string;
}

interface UserForm {
  email: string;
  password: string;
  full_name_en: string;
  full_name_km: string;
  province: string;
  avatar_url: string;
  status: string;
  roles: string[];
  is_email_verified: boolean;
}

const EMPTY_USER_FORM: UserForm = {
  email: "",
  password: "",
  full_name_en: "",
  full_name_km: "",
  province: "Phnom Penh",
  avatar_url: "",
  status: "ACTIVE",
  roles: ["STUDENT"],
  is_email_verified: true,
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const AVATAR_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

const ROLE_OPTIONS = ["STUDENT", "ADMIN", "SUPER_ADMIN"] as const;
const PAGE_SIZE = 10;

const USERS_COPY = {
  en: {
    title: "Users & access",
    subtitle: "Search students, suspend accounts, and manage platform roles.",
    searchPlaceholder: "Search by name or email…",
    clearSearch: "Clear search",
    reset: "Reset",
    resetTitle: "Reset all active filters",
    showing: "Showing",
    of: "of",
    users: "users",
    user: "user",
    loading: "Loading users…",
    noMatchTitle: "No users match those filters",
    noMatchBody:
      "Try adjusting your search query, or clear your active role and status filters to view all accounts.",
    resetAll: "Reset all filters",
    tableUser: "User",
    tableRoles: "Roles",
    tableStatus: "Status",
    tableJoined: "Joined",
    tableManage: "Manage",
    manage: "Manage",
    you: "You",
    manageTitle: "Manage account",
    accountStatus: "Account status",
    active: "Active",
    suspended: "Suspended",
    pending: "Pending",
    activeDesc: "Full sign-in access",
    suspendedDesc: "Access revoked",
    pendingDesc: "Needs verify",
    suspendNote:
      "Suspending an account also revokes its active refresh sessions immediately.",
    roles: "Roles",
    rolesNote: "At least one role must remain. Only a super admin can grant super admin.",
    cancel: "Cancel",
    saving: "Saving…",
    saveChanges: "Save changes",
    accountUpdated: "Account updated.",
    updateError: "Could not update this account.",
    cannotModify: "You cannot modify this account",
    manageAccount: "Manage account",
    role: "Role",
    status: "Status",
    allRoles: "All roles",
    allRolesDesc: "All registered account types",
    student: "Student",
    studentDesc: "Learners & test takers",
    admin: "Admin",
    adminDesc: "Platform & content moderators",
    superAdmin: "Super Admin",
    superAdminDesc: "Full system & permission control",
    allStatuses: "All statuses",
    allStatusesDesc: "Active, suspended & pending",
    activeFilterDesc: "Full platform & sign-in access",
    suspendedFilterDesc: "Access locked & sessions revoked",
    pendingFilterDesc: "Awaiting email verification",
    addUser: "Add user",
    newUser: "New user",
    editUser: "Edit user",
    userDetails: "User details",
    createHint: "Create a platform account and assign its initial access.",
    editHint: "Update account details, status, and platform roles.",
    email: "Email",
    password: "Password",
    passwordHint: "At least 8 characters",
    passwordKeep: "Leave blank to keep the current password.",
    fullNameEn: "Full name (English)",
    fullNameKm: "Full name (Khmer)",
    province: "Province",
    emailVerified: "Email verified",
    profileImage: "Profile image",
    profileImageHint: "Paste an image URL or upload a photo. PNG, JPG, WebP, or GIF up to 5 MB.",
    uploadPhoto: "Upload photo",
    uploadingPhoto: "Uploading…",
    removePhoto: "Remove photo",
    photoTypeError: "Choose a PNG, JPG, WebP, or GIF image.",
    photoSizeError: "Images must be 5 MB or smaller.",
    photoUploadError: "Could not upload this image.",
    tableActions: "Actions",
    edit: "Edit",
    delete: "Delete",
    deleteTitle: "Delete user?",
    deleteBody:
      "This account and its profile, assessment data, and active sessions will be permanently deleted. This action cannot be undone.",
    confirmDelete: "Delete user",
    userCreated: "User created.",
    userDeleted: "User deleted.",
    createError: "Could not create this user.",
    deleteError: "Could not delete this user.",
    fixFields: "Please fix the highlighted fields before saving.",
    emailRequired: "Email is required.",
    emailInvalid: "Enter a valid email address.",
    nameRequired: "Full name is required.",
    passwordMin: "Password must be at least 8 characters.",
    roleRequired: "Select at least one role.",
    createUser: "Create user",
    close: "Close",
  },
  km: {
    title: "អ្នកប្រើប្រាស់ & សិទ្ធិ",
    subtitle: "ស្វែងរកសិស្ស ផ្អាកគណនី និងគ្រប់គ្រងតួនាទីលើវេទិកា។",
    searchPlaceholder: "ស្វែងរកតាមឈ្មោះ ឬអ៊ីមែល…",
    clearSearch: "សម្អាតការស្វែងរក",
    reset: "កំណត់ឡើងវិញ",
    resetTitle: "កំណត់តម្រងសកម្មទាំងអស់ឡើងវិញ",
    showing: "បង្ហាញ",
    of: "ក្នុងចំណោម",
    users: "អ្នកប្រើប្រាស់",
    user: "អ្នកប្រើប្រាស់",
    loading: "កំពុងផ្ទុកអ្នកប្រើប្រាស់…",
    noMatchTitle: "គ្មានអ្នកប្រើប្រាស់ត្រូវនឹងតម្រងទាំងនេះទេ",
    noMatchBody:
      "សូមសាកល្បងកែការស្វែងរក ឬសម្អាតតម្រងតួនាទី និងស្ថានភាព ដើម្បីមើលគណនីទាំងអស់។",
    resetAll: "កំណត់តម្រងទាំងអស់ឡើងវិញ",
    tableUser: "អ្នកប្រើប្រាស់",
    tableRoles: "តួនាទី",
    tableStatus: "ស្ថានភាព",
    tableJoined: "បានចូលរួម",
    tableManage: "គ្រប់គ្រង",
    manage: "គ្រប់គ្រង",
    you: "អ្នក",
    manageTitle: "គ្រប់គ្រងគណនី",
    accountStatus: "ស្ថានភាពគណនី",
    active: "សកម្ម",
    suspended: "ផ្អាក",
    pending: "រង់ចាំ",
    activeDesc: "ចូលប្រើបានពេញលេញ",
    suspendedDesc: "បានដកសិទ្ធិចូលប្រើ",
    pendingDesc: "ត្រូវការផ្ទៀងផ្ទាត់",
    suspendNote:
      "ការផ្អាកគណនីនឹងដកសិទ្ធិសម័យចូលប្រើសកម្មភាពទាំងអស់ភ្លាមៗ។",
    roles: "តួនាទី",
    rolesNote:
      "ត្រូវរក្សាតួនាទីយ៉ាងតិចមួយ។ មានតែអ្នកគ្រប់គ្រងជាន់ខ្ពស់ទេដែលអាចផ្តល់សិទ្ធិអ្នកគ្រប់គ្រងជាន់ខ្ពស់។",
    cancel: "បោះបង់",
    saving: "កំពុងរក្សាទុក…",
    saveChanges: "រក្សាទុកការផ្លាស់ប្តូរ",
    accountUpdated: "បានធ្វើបច្ចុប្បន្នភាពគណនី។",
    updateError: "មិនអាចធ្វើបច្ចុប្បន្នភាពគណនីនេះបានទេ។",
    cannotModify: "អ្នកមិនអាចកែប្រែគណនីនេះបានទេ",
    manageAccount: "គ្រប់គ្រងគណនី",
    role: "តួនាទី",
    status: "ស្ថានភាព",
    allRoles: "តួនាទីទាំងអស់",
    allRolesDesc: "ប្រភេទគណនីដែលបានចុះឈ្មោះទាំងអស់",
    student: "សិស្ស",
    studentDesc: "អ្នករៀន & អ្នកធ្វើតេស្ត",
    admin: "អ្នកគ្រប់គ្រង",
    adminDesc: "អ្នកគ្រប់គ្រងវេទិកា & ខ្លឹមសារ",
    superAdmin: "អ្នកគ្រប់គ្រងជាន់ខ្ពស់",
    superAdminDesc: "ការគ្រប់គ្រងប្រព័ន្ធ & សិទ្ធិពេញលេញ",
    allStatuses: "ស្ថានភាពទាំងអស់",
    allStatusesDesc: "សកម្ម ផ្អាក & រង់ចាំ",
    activeFilterDesc: "ចូលប្រើវេទិកា & ចូលគណនីពេញលេញ",
    suspendedFilterDesc: "ចូលប្រើត្រូវបានចាក់សោ & សម័យចូលត្រូវបានដក",
    pendingFilterDesc: "កំពុងរង់ចាំផ្ទៀងផ្ទាត់អ៊ីមែល",
    addUser: "បន្ថែមអ្នកប្រើប្រាស់",
    newUser: "អ្នកប្រើប្រាស់ថ្មី",
    editUser: "កែប្រែអ្នកប្រើប្រាស់",
    userDetails: "ព័ត៌មានអ្នកប្រើប្រាស់",
    createHint: "បង្កើតគណនីវេទិកា និងកំណត់សិទ្ធិចូលប្រើដំបូង។",
    editHint: "ធ្វើបច្ចុប្បន្នភាពព័ត៌មានគណនី ស្ថានភាព និងតួនាទី។",
    email: "អ៊ីមែល",
    password: "ពាក្យសម្ងាត់",
    passwordHint: "យ៉ាងតិច ៨ តួអក្សរ",
    passwordKeep: "ទុកទទេ ដើម្បីរក្សាពាក្យសម្ងាត់បច្ចុប្បន្ន។",
    fullNameEn: "ឈ្មោះពេញ (អង់គ្លេស)",
    fullNameKm: "ឈ្មោះពេញ (ខ្មែរ)",
    province: "រាជធានី/ខេត្ត",
    emailVerified: "អ៊ីមែលបានផ្ទៀងផ្ទាត់",
    profileImage: "រូបភាពប្រវត្តិរូប",
    profileImageHint: "បិទភ្ជាប់ URL រូបភាព ឬផ្ទុករូបថត។ PNG, JPG, WebP ឬ GIF អតិបរមា 5 MB។",
    uploadPhoto: "ផ្ទុករូបថត",
    uploadingPhoto: "កំពុងផ្ទុក…",
    removePhoto: "ដករូបថតចេញ",
    photoTypeError: "ជ្រើសរើសរូបភាព PNG, JPG, WebP ឬ GIF។",
    photoSizeError: "រូបភាពត្រូវមានទំហំ 5 MB ឬតូចជាងនេះ។",
    photoUploadError: "មិនអាចផ្ទុករូបភាពនេះឡើងបានទេ។",
    tableActions: "សកម្មភាព",
    edit: "កែប្រែ",
    delete: "លុប",
    deleteTitle: "លុបអ្នកប្រើប្រាស់?",
    deleteBody:
      "គណនីនេះ ព័ត៌មានផ្ទាល់ខ្លួន ទិន្នន័យវាយតម្លៃ និងសម័យចូលប្រើសកម្មនឹងត្រូវលុបជាអចិន្ត្រៃយ៍។ សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។",
    confirmDelete: "លុបអ្នកប្រើប្រាស់",
    userCreated: "បានបង្កើតអ្នកប្រើប្រាស់។",
    userDeleted: "បានលុបអ្នកប្រើប្រាស់។",
    createError: "មិនអាចបង្កើតអ្នកប្រើប្រាស់នេះបានទេ។",
    deleteError: "មិនអាចលុបអ្នកប្រើប្រាស់នេះបានទេ។",
    fixFields: "សូមកែវាលដែលបានសម្គាល់មុនពេលរក្សាទុក។",
    emailRequired: "ត្រូវបំពេញអ៊ីមែល។",
    emailInvalid: "បញ្ចូលអាសយដ្ឋានអ៊ីមែលត្រឹមត្រូវ។",
    nameRequired: "ត្រូវបំពេញឈ្មោះពេញ។",
    passwordMin: "ពាក្យសម្ងាត់ត្រូវមានយ៉ាងតិច ៨ តួអក្សរ។",
    roleRequired: "ជ្រើសរើសតួនាទីយ៉ាងតិចមួយ។",
    createUser: "បង្កើតអ្នកប្រើប្រាស់",
    close: "បិទ",
  },
} as const;

function UserAvatar({
  src,
  name,
}: {
  src?: string | null;
  name?: string | null;
}) {
  const [failed, setFailed] = React.useState(false);
  const initials = (name || "?").trim().slice(0, 2).toUpperCase();

  React.useEffect(() => {
    setFailed(false);
  }, [src]);

  if (src && !failed) {
    return (
      <img
        src={src}
        alt=""
        className="h-9 w-9 shrink-0 rounded-full border border-[#E6E8F0] object-cover dark:border-white/10"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E6E8F0] bg-[#F0F2FA] text-[10px] font-black text-[#111965] dark:border-white/10 dark:bg-white/10 dark:text-[#F7CE4D]">
      {initials}
    </span>
  );
}

function roleBadge(role: string) {
  if (role === "SUPER_ADMIN") return "bg-purple-50 text-purple-700 border-purple-200";
  if (role === "ADMIN") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  return "bg-slate-100 text-slate-600 border-slate-200";
}

export function UsersManager() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const toast = useToast();
  const confirm = useConfirm();
  const { language } = useLanguage();
  const isKm = language === "km";
  const copy = USERS_COPY[language];
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [form, setForm] = useState<UserForm>(EMPTY_USER_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  const isSuperAdmin = currentUser?.roles?.includes("SUPER_ADMIN");
  const roleLabel = (role: string) =>
    role === "SUPER_ADMIN"
      ? copy.superAdmin
      : role === "ADMIN"
      ? copy.admin
      : copy.student;
  const statusLabel = (status: string) =>
    status === "SUSPENDED"
      ? copy.suspended
      : status === "PENDING"
      ? copy.pending
      : copy.active;

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => apiFetch<AdminUser[]>("/admin/users?limit=500"),
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
        label: copy.allRoles,
        description: copy.allRolesDesc,
        count: roleCounts.total,
        icon: Users,
      },
      {
        value: "STUDENT",
        label: copy.student,
        description: copy.studentDesc,
        count: roleCounts.STUDENT,
        icon: GraduationCap,
        badgeClass: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
      },
      {
        value: "ADMIN",
        label: copy.admin,
        description: copy.adminDesc,
        count: roleCounts.ADMIN,
        icon: ShieldCheck,
        badgeClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
      },
      {
        value: "SUPER_ADMIN",
        label: copy.superAdmin,
        description: copy.superAdminDesc,
        count: roleCounts.SUPER_ADMIN,
        icon: Crown,
        badgeClass: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300",
      },
    ],
    [roleCounts, copy]
  );

  const statusFilterOptions = useMemo<FilterOption[]>(
    () => [
      {
        value: "",
        label: copy.allStatuses,
        description: copy.allStatusesDesc,
        count: statusCounts.total,
        icon: Activity,
      },
      {
        value: "ACTIVE",
        label: copy.active,
        description: copy.activeFilterDesc,
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
        label: copy.suspended,
        description: copy.suspendedFilterDesc,
        count: statusCounts.SUSPENDED,
        indicator: <span className="inline-block h-2 w-2 rounded-full bg-rose-500" />,
        badgeClass: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
      },
      {
        value: "PENDING",
        label: copy.pending,
        description: copy.pendingFilterDesc,
        count: statusCounts.PENDING,
        indicator: <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />,
        badgeClass: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
      },
    ],
    [statusCounts, copy]
  );

  useEffect(() => {
    if (!dialogOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDialogOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dialogOpen]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    const email = form.email.trim();
    if (!email) errors.email = copy.emailRequired;
    else if (!EMAIL_PATTERN.test(email)) errors.email = copy.emailInvalid;
    if (!form.full_name_en.trim()) errors.full_name_en = copy.nameRequired;
    if (!editingUser && !form.password) errors.password = copy.passwordMin;
    else if (form.password && form.password.length < 8) {
      errors.password = copy.passwordMin;
    }
    if (form.roles.length === 0) errors.roles = copy.roleRequired;
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.warning(copy.fixFields);
      return false;
    }
    return true;
  };

  const { mutate: saveUser, isPending: saving } = useMutation({
    mutationFn: async () => {
      const payload: Record<string, unknown> = {
        email: form.email.trim(),
        full_name_en: form.full_name_en.trim(),
        full_name_km: form.full_name_km.trim() || null,
        province: form.province.trim() || "Phnom Penh",
        avatar_url: form.avatar_url.trim() || null,
        status: form.status,
        roles: form.roles,
        is_email_verified: form.is_email_verified,
      };
      if (form.password) payload.password = form.password;

      if (editingUser) {
        return apiFetch(`/admin/users/${editingUser.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      }
      return apiFetch("/admin/users", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-audit"] });
      queryClient.invalidateQueries({ queryKey: ["admin-analytics"] });
      setDialogOpen(false);
      toast.success(editingUser ? copy.accountUpdated : copy.userCreated);
    },
    onError: (err: unknown) =>
      toast.error(
        getErrorMessage(err, editingUser ? copy.updateError : copy.createError)
      ),
  });

  const { mutate: deleteUser, isPending: deletingUser } = useMutation({
    mutationFn: async (id: string) =>
      apiFetch(`/admin/users/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-audit"] });
      queryClient.invalidateQueries({ queryKey: ["admin-analytics"] });
      toast.success(copy.userDeleted);
    },
    onError: (err: unknown) =>
      toast.error(getErrorMessage(err, copy.deleteError)),
  });

  const closeDialog = () => {
    setDialogOpen(false);
    setFormErrors({});
  };

  const openCreate = () => {
    setEditingUser(null);
    setForm(EMPTY_USER_FORM);
    setFormErrors({});
    setDialogOpen(true);
  };

  const openEdit = (user: AdminUser) => {
    setEditingUser(user);
    setForm({
      email: user.email,
      password: "",
      full_name_en: user.full_name_en || "",
      full_name_km: user.full_name_km || "",
      province: user.province || "Phnom Penh",
      avatar_url: user.avatar_url || "",
      status: user.status,
      roles: [...user.roles],
      is_email_verified: Boolean(user.is_email_verified),
    });
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!validateForm()) return;
    saveUser();
  };

  const handleDelete = async (user: AdminUser) => {
    const name =
      (isKm && user.full_name_km
        ? user.full_name_km
        : user.full_name_en || user.email) || user.email;
    const confirmed = await confirm({
      title: isKm ? `លុប ${name}?` : `Delete ${name}?`,
      description: copy.deleteBody,
      confirmLabel: copy.confirmDelete,
      cancelLabel: copy.cancel,
      tone: "danger",
    });
    if (confirmed) deleteUser(user.id);
  };

  const updateForm = <K extends keyof UserForm>(key: K, value: UserForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFormErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleAvatarFile = async (file: File) => {
    if (!AVATAR_TYPES.includes(file.type)) {
      toast.error(copy.photoTypeError);
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      toast.error(copy.photoSizeError);
      return;
    }

    setUploadingAvatar(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const uploaded = await apiFetch<{ url: string }>("/uploads/avatar", {
        method: "POST",
        body,
      });
      if (!uploaded?.url) throw new Error(copy.photoUploadError);
      updateForm("avatar_url", uploaded.url);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, copy.photoUploadError));
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-black text-[#111965]">{copy.title}</h2>
          <p className="text-xs text-[#68708A]">
            {copy.subtitle}
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#F7CE4D] px-4 py-2.5 text-xs font-black text-[#111965] transition-colors hover:bg-[#E5BD3B]"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>{copy.addUser}</span>
        </button>
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
              placeholder={copy.searchPlaceholder}
              className="h-9 w-full rounded-xl border border-[#E6E8F0] bg-[#F5F6FA]/70 pl-9 pr-8 text-xs text-[#171A2C] outline-none transition-colors focus:border-[#111965] focus:bg-white dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:bg-slate-900"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-[#68708A] hover:text-[#171A2C] dark:text-slate-400 dark:hover:text-white"
                title={copy.clearSearch}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <AdminFilterDropdown
              label={copy.role}
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
              label={copy.status}
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
                title={copy.resetTitle}
              >
                <RotateCcw className="h-3 w-3" />
                <span>{copy.reset}</span>
              </button>
            )}

            <div className="hidden text-[11px] font-semibold text-[#68708A] dark:text-slate-400 xl:inline-block pl-2 border-l border-[#E6E8F0] dark:border-slate-800">
              {copy.showing} <strong className="text-[#111965] dark:text-slate-200">{filtered.length}</strong> {copy.of}{" "}
              {users?.length || 0}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-xs text-[#68708A]">
            <Loader2 className="h-4 w-4 animate-spin" />
            {copy.loading}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F0F2FA] text-[#111965] dark:bg-slate-800 dark:text-indigo-300">
              <FilterX className="h-6 w-6" />
            </div>
            <h3 className="mt-3 text-sm font-bold text-[#111965] dark:text-white">
              {copy.noMatchTitle}
            </h3>
            <p className="mt-1 max-w-sm text-xs text-[#68708A] dark:text-slate-400">
              {copy.noMatchBody}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#111965] px-3.5 py-2 text-xs font-bold text-white transition-colors hover:bg-[#1E277A] dark:bg-indigo-600 dark:hover:bg-indigo-500"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {copy.resetAll}
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-xs">
              <thead>
                <tr className="border-b border-[#E6E8F0] bg-[#F8FAFD] text-[11px] uppercase tracking-wider text-[#68708A]">
                  <th className="px-4 py-3 font-bold">{copy.tableUser}</th>
                  <th className="px-4 py-3 font-bold">{copy.tableRoles}</th>
                  <th className="px-4 py-3 font-bold">{copy.tableStatus}</th>
                  <th className="px-4 py-3 font-bold">{copy.tableJoined}</th>
                  <th className="px-4 py-3 text-right font-bold">{copy.tableActions}</th>
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
                        <div className="flex items-center gap-2.5">
                          <UserAvatar
                            src={user.avatar_url}
                            name={
                              isKm && user.full_name_km
                                ? user.full_name_km
                                : user.full_name_en || user.email
                            }
                          />
                          <div className="min-w-0">
                            <div className="font-bold text-[#111965]">
                              {isKm && user.full_name_km
                                ? user.full_name_km
                                : user.full_name_en ||
                                  user.full_name_km ||
                                  user.email.split("@")[0]}
                              {isSelf && (
                                <span className="ml-1.5 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
                                  {copy.you}
                                </span>
                              )}
                            </div>
                            <div className="truncate text-[11px] text-[#68708A]">{user.email}</div>
                          </div>
                        </div>
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
                              {roleLabel(role)}
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
                          {statusLabel(user.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[11px] text-[#68708A]">
                        {user.created_at
                          ? new Date(user.created_at).toLocaleDateString(
                              isKm ? "km-KH" : "en-US"
                            )
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEdit(user)}
                            disabled={locked}
                            title={locked ? copy.cannotModify : copy.editUser}
                            aria-label={copy.editUser}
                            className="rounded-lg p-1.5 text-[#68708A] transition-colors hover:bg-[#F0F2FA] hover:text-[#111965] dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(user)}
                            disabled={locked || deletingUser}
                            title={locked ? copy.cannotModify : copy.delete}
                            aria-label={copy.delete}
                            className="rounded-lg p-1.5 text-[#68708A] transition-colors hover:bg-[#F0F2FA] hover:text-[#111965] dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
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
            itemLabel={isKm ? "អ្នកប្រើប្រាស់" : "users"}
            itemSingular={isKm ? "អ្នកប្រើប្រាស់" : "user"}
          />
        )}
      </div>

      {dialogOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-[#0A0F3D]/50 p-4 backdrop-blur-sm sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={editingUser ? copy.editUser : copy.addUser}
          onClick={(event) => {
            if (!dialogRef.current?.contains(event.target as Node)) closeDialog();
          }}
        >
          <div className="flex min-h-full items-center justify-center">
            <div
              ref={dialogRef}
              className="w-full max-w-xl rounded-3xl border border-[#E6E8F0] bg-white p-5 shadow-2xl dark:border-white/10 dark:bg-[#090D24] sm:p-6"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3 border-b border-[#E6E8F0] pb-3 dark:border-white/10">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[#94A3B8]">
                    {editingUser ? copy.editUser : copy.newUser}
                  </div>
                  <h3 className="mt-1 text-base font-black text-[#111965] dark:text-white">
                    {editingUser ? copy.editUser : copy.addUser}
                  </h3>
                  <p className="mt-1 text-xs text-[#68708A] dark:text-slate-400">
                    {editingUser ? copy.editHint : copy.createHint}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeDialog}
                  className="rounded-lg p-1.5 text-[#68708A] hover:bg-slate-100 dark:hover:bg-white/10"
                  aria-label={copy.close}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  handleSave();
                }}
                className="mt-4 space-y-4"
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="space-y-1.5">
                    <span className="block text-[10px] font-black uppercase tracking-wider text-[#68708A] dark:text-slate-400">
                      {copy.email} *
                    </span>
                    <input
                      type="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={(event) => updateForm("email", event.target.value)}
                      className={cn(
                        "h-10 w-full rounded-xl border bg-[#F8FAFD] px-3 text-xs text-[#171A2C] outline-none focus:bg-white dark:border-white/10 dark:bg-white/[0.04] dark:text-white",
                        formErrors.email
                          ? "border-rose-400 focus:border-rose-500"
                          : "border-[#E6E8F0] focus:border-[#111965] dark:focus:border-[#F7CE4D]/60"
                      )}
                    />
                    {formErrors.email && (
                      <p className="text-[10px] font-semibold text-rose-600">
                        {formErrors.email}
                      </p>
                    )}
                  </label>

                  <label className="space-y-1.5">
                    <span className="block text-[10px] font-black uppercase tracking-wider text-[#68708A] dark:text-slate-400">
                      {copy.password}
                      {!editingUser ? " *" : ""}
                    </span>
                    <input
                      type="password"
                      autoComplete="new-password"
                      value={form.password}
                      onChange={(event) => updateForm("password", event.target.value)}
                      placeholder={editingUser ? copy.passwordKeep : copy.passwordHint}
                      className={cn(
                        "h-10 w-full rounded-xl border bg-[#F8FAFD] px-3 text-xs text-[#171A2C] outline-none placeholder:text-[#94A3B8] focus:bg-white dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-slate-500",
                        formErrors.password
                          ? "border-rose-400 focus:border-rose-500"
                          : "border-[#E6E8F0] focus:border-[#111965] dark:focus:border-[#F7CE4D]/60"
                      )}
                    />
                    {formErrors.password && (
                      <p className="text-[10px] font-semibold text-rose-600">
                        {formErrors.password}
                      </p>
                    )}
                  </label>

                  <label className="space-y-1.5">
                    <span className="block text-[10px] font-black uppercase tracking-wider text-[#68708A] dark:text-slate-400">
                      {copy.fullNameEn} *
                    </span>
                    <input
                      value={form.full_name_en}
                      onChange={(event) =>
                        updateForm("full_name_en", event.target.value)
                      }
                      className={cn(
                        "h-10 w-full rounded-xl border bg-[#F8FAFD] px-3 text-xs text-[#171A2C] outline-none focus:bg-white dark:border-white/10 dark:bg-white/[0.04] dark:text-white",
                        formErrors.full_name_en
                          ? "border-rose-400 focus:border-rose-500"
                          : "border-[#E6E8F0] focus:border-[#111965] dark:focus:border-[#F7CE4D]/60"
                      )}
                    />
                    {formErrors.full_name_en && (
                      <p className="text-[10px] font-semibold text-rose-600">
                        {formErrors.full_name_en}
                      </p>
                    )}
                  </label>

                  <label className="space-y-1.5">
                    <span className="block text-[10px] font-black uppercase tracking-wider text-[#68708A] dark:text-slate-400">
                      {copy.fullNameKm}
                    </span>
                    <input
                      value={form.full_name_km}
                      onChange={(event) =>
                        updateForm("full_name_km", event.target.value)
                      }
                      className="h-10 w-full rounded-xl border border-[#E6E8F0] bg-[#F8FAFD] px-3 text-xs text-[#171A2C] outline-none focus:border-[#111965] focus:bg-white dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:focus:border-[#F7CE4D]/60"
                    />
                  </label>

                  <label className="space-y-1.5">
                    <span className="block text-[10px] font-black uppercase tracking-wider text-[#68708A] dark:text-slate-400">
                      {copy.province}
                    </span>
                    <input
                      value={form.province}
                      onChange={(event) => updateForm("province", event.target.value)}
                      className="h-10 w-full rounded-xl border border-[#E6E8F0] bg-[#F8FAFD] px-3 text-xs text-[#171A2C] outline-none focus:border-[#111965] focus:bg-white dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:focus:border-[#F7CE4D]/60"
                    />
                  </label>

                  <label className="flex items-center gap-2 self-end pb-2 text-[11px] font-semibold text-[#475569] dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={form.is_email_verified}
                      onChange={(event) =>
                        updateForm("is_email_verified", event.target.checked)
                      }
                      className="h-4 w-4 rounded border-[#D8D1C5] accent-[#111965] dark:accent-[#F7CE4D]"
                    />
                    {copy.emailVerified}
                  </label>

                  <div className="space-y-1.5 sm:col-span-2">
                    <span className="block text-[10px] font-black uppercase tracking-wider text-[#68708A] dark:text-slate-400">
                      {copy.profileImage}
                    </span>
                    <div className="flex flex-col gap-3 rounded-xl border border-[#E6E8F0] bg-[#F8FAFD] p-3 dark:border-white/10 dark:bg-white/[0.04] sm:flex-row sm:items-start">
                      <UserAvatar
                        src={form.avatar_url}
                        name={form.full_name_en || form.email}
                      />
                      <div className="min-w-0 flex-1 space-y-2">
                        <input
                          value={form.avatar_url}
                          onChange={(event) =>
                            updateForm("avatar_url", event.target.value)
                          }
                          placeholder="https://…"
                          className="h-9 w-full rounded-lg border border-[#E6E8F0] bg-white px-2.5 text-xs text-[#171A2C] outline-none focus:border-[#111965] dark:border-white/10 dark:bg-slate-900/60 dark:text-white dark:focus:border-[#F7CE4D]/60"
                        />
                        <div className="flex flex-wrap items-center gap-2">
                          <label
                            className={cn(
                              "inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#E6E8F0] bg-white px-2.5 py-1.5 text-[11px] font-bold text-[#111965] transition-colors hover:border-[#111965]/30 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200",
                              uploadingAvatar && "pointer-events-none opacity-60"
                            )}
                          >
                            {uploadingAvatar ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Upload className="h-3 w-3" />
                            )}
                            {uploadingAvatar ? copy.uploadingPhoto : copy.uploadPhoto}
                            <input
                              type="file"
                              accept={AVATAR_TYPES.join(",")}
                              className="sr-only"
                              disabled={uploadingAvatar}
                              onChange={(event) => {
                                const file = event.target.files?.[0];
                                event.target.value = "";
                                if (file) handleAvatarFile(file);
                              }}
                            />
                          </label>
                          {form.avatar_url && (
                            <button
                              type="button"
                              onClick={() => updateForm("avatar_url", "")}
                              className="rounded-lg px-2 py-1.5 text-[11px] font-bold text-rose-600 transition-colors hover:bg-rose-50 dark:hover:bg-rose-500/10"
                            >
                              {copy.removePhoto}
                            </button>
                          )}
                          <span className="text-[10px] leading-relaxed text-[#94A3B8]">
                            {copy.profileImageHint}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#68708A] dark:text-slate-400">
                    {copy.accountStatus}
                  </span>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {[
                      {
                        value: "ACTIVE",
                        label: copy.active,
                        desc: copy.activeDesc,
                        dotColor: "bg-emerald-500",
                        activeClass:
                          "border-emerald-500 bg-emerald-50/60 text-emerald-950 dark:border-emerald-500 dark:bg-emerald-950/30 dark:text-emerald-200",
                      },
                      {
                        value: "SUSPENDED",
                        label: copy.suspended,
                        desc: copy.suspendedDesc,
                        dotColor: "bg-rose-500",
                        activeClass:
                          "border-rose-500 bg-rose-50/60 text-rose-950 dark:border-rose-500 dark:bg-rose-950/30 dark:text-rose-200",
                      },
                      {
                        value: "PENDING",
                        label: copy.pending,
                        desc: copy.pendingDesc,
                        dotColor: "bg-amber-500",
                        activeClass:
                          "border-amber-500 bg-amber-50/60 text-amber-950 dark:border-amber-500 dark:bg-amber-950/30 dark:text-amber-200",
                      },
                    ].map((option) => {
                      const isSelected = form.status === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => updateForm("status", option.value)}
                          className={cn(
                            "flex flex-col items-start gap-1 rounded-xl border p-2.5 text-left transition-all",
                            isSelected
                              ? cn(
                                  "shadow-xs ring-1 ring-black/5 dark:ring-white/10",
                                  option.activeClass
                                )
                              : "border-[#E6E8F0] bg-white text-[#68708A] hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
                          )}
                        >
                          <div className="flex w-full items-center justify-between">
                            <span className="flex items-center gap-1.5 text-xs font-bold text-[#171A2C] dark:text-slate-200">
                              <span
                                className={cn(
                                  "h-2 w-2 rounded-full",
                                  option.dotColor
                                )}
                              />
                              {option.label}
                            </span>
                            {isSelected && (
                              <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                            )}
                          </div>
                          <span className="text-[10px] text-[#68708A] dark:text-slate-400">
                            {option.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-[#68708A] dark:text-slate-400">
                    {copy.suspendNote}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#68708A] dark:text-slate-400">
                    {copy.roles}
                  </span>
                  <div className="grid gap-1.5 sm:grid-cols-3">
                    {ROLE_OPTIONS.map((role) => {
                      const disabled = role === "SUPER_ADMIN" && !isSuperAdmin;
                      const active = form.roles.includes(role);
                      return (
                        <button
                          key={role}
                          type="button"
                          disabled={disabled}
                          onClick={() =>
                            updateForm(
                              "roles",
                              active
                                ? form.roles.filter((item) => item !== role)
                                : [...form.roles, role]
                            )
                          }
                          className={cn(
                            "rounded-xl border px-3 py-2 text-left text-[11px] font-bold transition-colors",
                            active
                              ? "border-[#111965] bg-[#111965] text-white"
                              : "border-[#E6E8F0] bg-white text-[#68708A] hover:border-slate-300 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300",
                            disabled && "cursor-not-allowed opacity-40"
                          )}
                        >
                          {roleLabel(role)}
                        </button>
                      );
                    })}
                  </div>
                  {formErrors.roles && (
                    <p className="text-[10px] font-semibold text-rose-600">
                      {formErrors.roles}
                    </p>
                  )}
                  <p className="text-[11px] text-[#68708A] dark:text-slate-400">
                    {copy.rolesNote}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-[#E6E8F0] pt-4 dark:border-white/10">
                  <button
                    type="button"
                    onClick={closeDialog}
                    className="rounded-xl border border-[#E6E8F0] px-4 py-2 text-xs font-bold text-[#68708A] hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10"
                  >
                    {copy.cancel}
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#F7CE4D] px-4 py-2 text-xs font-black text-[#111965] hover:bg-[#E5BD3B] disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : editingUser ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Plus className="h-3.5 w-3.5" />
                    )}
                    {saving
                      ? copy.saving
                      : editingUser
                      ? copy.saveChanges
                      : copy.createUser}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
