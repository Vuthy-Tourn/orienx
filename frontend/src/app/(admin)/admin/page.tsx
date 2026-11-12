"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import {
  ShieldCheck,
  Users,
  Building2,
  BookOpen,
  Sliders,
  CheckCircle2,
  TrendingUp,
  Award,
  ArrowLeft,
  Save,
  BarChart3,
} from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { getLocalized } = useLanguage();
  const queryClient = useQueryClient();

  const isAdmin = user?.roles?.some((r) => r === "ADMIN" || r === "SUPER_ADMIN");

  const { data: analytics, isLoading: loadingAnalytics } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => apiFetch<any>("/admin/analytics"),
    enabled: !!isAdmin,
  });

  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => apiFetch<any[]>("/admin/users"),
    enabled: !!isAdmin,
  });

  const { data: rules } = useQuery({
    queryKey: ["admin-rules"],
    queryFn: async () => apiFetch<any[]>("/admin/rules"),
    enabled: !!isAdmin,
  });

  const activeRule = rules?.[0];
  const [wPersonality, setWPersonality] = useState<number>(0.20);
  const [wRiasec, setWRiasec] = useState<number>(0.35);
  const [wAcademic, setWAcademic] = useState<number>(0.30);
  const [wCareer, setWCareer] = useState<number>(0.15);
  const [saveSuccess, setSaveSuccess] = useState(false);

  React.useEffect(() => {
    if (activeRule) {
      setWPersonality(activeRule.weight_personality);
      setWRiasec(activeRule.weight_riasec);
      setWAcademic(activeRule.weight_academic_strengths);
      setWCareer(activeRule.weight_career_alignment);
    }
  }, [activeRule]);

  const { mutate: updateWeights, isPending: updatingWeights } = useMutation({
    mutationFn: async () => {
      if (!activeRule) return;
      return apiFetch(`/admin/rules/${activeRule.id}`, {
        method: "PUT",
        body: JSON.stringify({
          weight_personality: wPersonality,
          weight_riasec: wRiasec,
          weight_academic_strengths: wAcademic,
          weight_career_alignment: wCareer,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-rules"] });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    },
  });

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#F5F6FA]">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-[#E6E8F0] text-center space-y-4">
          <ShieldCheck className="w-12 h-12 text-rose-600 mx-auto" />
          <h2 className="text-xl font-bold text-[#111965]">Access Denied</h2>
          <p className="text-xs text-[#68708A]">
            You require Administrator privileges to access the OrienX Admin Panel. Please sign in as an admin.
          </p>
          <Link
            href="/login"
            className="inline-block px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#111965]"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F6FA] py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>OrienX Platform Administration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111965]">
              Administrative Control & Analytics Panel
            </h1>
            <p className="text-xs sm:text-sm text-[#68708A]">
              Monitor student engagement, audit assessments, and tune recommendation engine weights.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#111965] bg-white border border-[#E6E8F0] hover:bg-slate-50 transition-colors shadow-2xs self-start"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Switch to Student View</span>
          </Link>
        </div>

        {/* Analytics KPI Metrics */}
        {loadingAnalytics ? (
          <div className="py-12 text-center text-xs text-[#68708A]">Loading analytics...</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-[#E6E8F0] space-y-1 shadow-2xs">
              <div className="text-[10px] text-[#68708A] uppercase font-bold flex items-center justify-between">
                <span>Total Students</span>
                <Users className="w-3.5 h-3.5 text-[#111965]" />
              </div>
              <div className="text-2xl font-black text-[#111965]">{analytics?.total_students || 0}</div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#E6E8F0] space-y-1 shadow-2xs">
              <div className="text-[10px] text-[#68708A] uppercase font-bold flex items-center justify-between">
                <span>Universities</span>
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-[#111965]">{analytics?.total_universities || 0}</div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#E6E8F0] space-y-1 shadow-2xs">
              <div className="text-[10px] text-[#68708A] uppercase font-bold flex items-center justify-between">
                <span>Assessments Done</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-[#111965]">
                {(analytics?.completed_personality_assessments || 0) + (analytics?.completed_riasec_assessments || 0)}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#E6E8F0] space-y-1 shadow-2xs">
              <div className="text-[10px] text-[#68708A] uppercase font-bold flex items-center justify-between">
                <span>Recommendations</span>
                <TrendingUp className="w-3.5 h-3.5 text-[#F7CE4D]" />
              </div>
              <div className="text-2xl font-black text-[#111965]">{analytics?.generated_recommendations_count || 0}</div>
            </div>
          </div>
        )}

        {/* Recommendation Engine Weight Tuner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E6E8F0] shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#111965]" />
                <h2 className="text-base font-extrabold text-[#111965]">
                  Recommendation Engine Rule Weights Configuration
                </h2>
              </div>
              <p className="text-xs text-[#68708A]">
                Adjust live scoring coefficients for RIASEC Holland fit, academic strengths, personality, and career alignment.
              </p>
            </div>

            <button
              onClick={() => updateWeights()}
              disabled={updatingWeights}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-[#111965] bg-[#F7CE4D] hover:bg-[#E5BD3B] shadow-2xs transition-colors self-start sm:self-auto"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{updatingWeights ? "Saving..." : "Apply & Save Weights"}</span>
            </button>
          </div>

          {saveSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Recommendation rule parameters persisted to database!</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
            {/* 1. RIASEC Weight */}
            <div className="p-4 rounded-2xl bg-[#F5F6FA] border border-[#E6E8F0] space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-[#111965]">RIASEC Holland Fit</span>
                <span className="text-xs font-black text-[#111965]">{Math.round(wRiasec * 100)}%</span>
              </div>
              <input
                type="range"
                min={0.10}
                max={0.60}
                step={0.05}
                value={wRiasec}
                onChange={(e) => setWRiasec(parseFloat(e.target.value))}
                className="w-full accent-[#111965]"
              />
              <span className="text-[10px] text-[#68708A] block">Holland interest alignment</span>
            </div>

            {/* 2. Academic Strengths Weight */}
            <div className="p-4 rounded-2xl bg-[#F5F6FA] border border-[#E6E8F0] space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-[#111965]">Academic Strengths</span>
                <span className="text-xs font-black text-[#111965]">{Math.round(wAcademic * 100)}%</span>
              </div>
              <input
                type="range"
                min={0.10}
                max={0.60}
                step={0.05}
                value={wAcademic}
                onChange={(e) => setWAcademic(parseFloat(e.target.value))}
                className="w-full accent-[#111965]"
              />
              <span className="text-[10px] text-[#68708A] block">Prerequisite school subjects</span>
            </div>

            {/* 3. Personality Weight */}
            <div className="p-4 rounded-2xl bg-[#F5F6FA] border border-[#E6E8F0] space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-[#111965]">Personality Cognitive Fit</span>
                <span className="text-xs font-black text-[#111965]">{Math.round(wPersonality * 100)}%</span>
              </div>
              <input
                type="range"
                min={0.05}
                max={0.40}
                step={0.05}
                value={wPersonality}
                onChange={(e) => setWPersonality(parseFloat(e.target.value))}
                className="w-full accent-[#111965]"
              />
              <span className="text-[10px] text-[#68708A] block">MBTI preference dimensions</span>
            </div>

            {/* 4. Career Alignment Weight */}
            <div className="p-4 rounded-2xl bg-[#F5F6FA] border border-[#E6E8F0] space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-[#111965]">Career Alignment</span>
                <span className="text-xs font-black text-[#111965]">{Math.round(wCareer * 100)}%</span>
              </div>
              <input
                type="range"
                min={0.05}
                max={0.30}
                step={0.05}
                value={wCareer}
                onChange={(e) => setWCareer(parseFloat(e.target.value))}
                className="w-full accent-[#111965]"
              />
              <span className="text-[10px] text-[#68708A] block">Stated career aspirations</span>
            </div>
          </div>
        </div>

        {/* User Accounts Directory Table */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E6E8F0] shadow-2xs space-y-4">
          <h2 className="text-base font-extrabold text-[#111965]">
            Registered Users & Students Directory
          </h2>

          <div className="overflow-x-auto rounded-2xl border border-[#E6E8F0]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F5F6FA] border-b border-[#E6E8F0] text-[#68708A] font-bold">
                  <th className="p-3.5">Name & Email</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Province</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E8F0]">
                {users?.map((u: any) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-[#111965]">{u.full_name_en || "N/A"}</div>
                      <div className="text-[11px] text-[#68708A]">{u.email}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F0F2FA] text-[#111965]">
                        {u.roles?.join(", ")}
                      </span>
                    </td>
                    <td className="p-3.5 font-medium">{u.province || "Phnom Penh"}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {u.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-[#68708A]">{u.created_at?.split("T")[0] || "2026"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

