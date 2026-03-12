"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { ViewStudentModal } from "./ViewStudentModal";

// ── Types ──────────────────────────────────────────────
interface Campaign {
  campaignId: string;
  campaignName: string;
  campaignDescription: string;
  campaignGoal: string;
  campaignTotalRaised: number;
  userRaisedAmount: number;
  userStudentId: string;
  joinedAt: string;
}

interface Student {
  _id: string;
  name: string;
  email: string;
  role: string;
  profileImage: string;
  isVerified: boolean;
  createdAt: string;
  studentId?: string;
  campaignCount: number;
  totalRaisedByUser: number;
  campaigns: Campaign[];
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ApiResponse {
  status: boolean;
  message: string;
  data: {
    users: Student[];
    pagination: Pagination;
  };
}

// ── Icons ─────────────────────────────────────────────

function ChevronLeft() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

// ── Avatar fallback ────────────────────────────────────
function StudentAvatar({ src, name }: { src: string; name: string }) {
  if (src) {
    return (
      <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
        <Image src={src} alt={name} fill className="object-cover" />
      </div>
    );
  }
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="w-10 h-10 rounded-full flex-shrink-0 bg-blue-100 flex items-center justify-center">
      <span className="text-sm font-semibold text-blue-600">{initials}</span>
    </div>
  );
}

// ── Skeleton row ───────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-[#00000014]">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
          <div className="h-3.5 w-36 bg-gray-200 animate-pulse rounded" />
        </div>
      </td>
      <td className="px-4 py-4 text-center">
        <div className="h-3.5 w-20 bg-gray-200 animate-pulse rounded mx-auto" />
      </td>
      <td className="px-4 py-4 text-center">
        <div className="h-3.5 w-8 bg-gray-200 animate-pulse rounded mx-auto" />
      </td>
      <td className="px-4 py-4 text-center">
        <div className="w-9 h-9 bg-gray-200 animate-pulse rounded-lg mx-auto" />
      </td>
    </tr>
  );
}

// ── Main Component ─────────────────────────────────────
function StudentListPage() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const session = useSession();
  const TOKEN = session?.data?.user?.accessToken;

  const { data, isLoading, isError } = useQuery<ApiResponse>({
    queryKey: ["studentList", page],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/admin/studentlist?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${TOKEN}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch students");
      return res.json();
    },
  });

  const students = data?.data?.users ?? [];
  const pagination = data?.data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;
  const total = pagination?.total ?? 0;
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | "...")[] = [1];
    if (page > 3) pages.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-center relative mb-5">
        <h1 className="text-center text-[48px] font-medium leading-[150%] my-8">Student List</h1>
        {/* <button className="absolute right-0 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer">
          Save <SaveIcon />
        </button> */}
      </div>

      {/* Table Card */}
      <div className="rounded-xl overflow-hidden border border-[#00000014]">
        <table className="w-full">
          {/* Head */}
          <thead>
            <tr className="border-b border-[#00000014]">
              <th className="text-left text-sm font-semibold text-gray-600 px-5 py-4 w-[42%]">
                Student Name
              </th>
              <th className="text-center text-sm font-semibold text-gray-600 px-4 py-4 w-[20%]">
                Unique ID
              </th>
              <th className="text-center text-sm font-semibold text-gray-600 px-4 py-4 w-[23%]">
                Campaign Involvement
              </th>
              <th className="text-center text-sm font-semibold text-gray-600 px-4 py-4 w-[15%]">
                Action
              </th>
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            ) : isError ? (
              <tr>
                <td colSpan={4} className="text-center py-12 text-base text-red-500">
                  Failed to load students. Please try again.
                </td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-12 text-base text-gray-400">
                  No students found.
                </td>
              </tr>
            ) : (
              students.map((student, index) => (
                <tr
                  key={student._id}
                  className={`hover:bg-gray-50 transition-colors ${
                    index !== students.length - 1
                      ? "border-b border-[#00000014]"
                      : ""
                  }`}
                >
                  {/* Name + Avatar */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <StudentAvatar
                        src={student.profileImage}
                        name={student.name}
                      />
                      <span className="text-base text-gray-800 font-medium">
                        {student.name}
                      </span>
                    </div>
                  </td>

                  {/* Unique ID */}
                  <td className="px-4 py-4 text-center text-base text-gray-600">
                    {student.studentId ?? "—"}
                  </td>

                  {/* Campaign Involvement */}
                  <td className="px-4 py-4 text-center text-base text-gray-600">
                    {student.campaignCount}
                  </td>

                  {/* Action */}
                  <td className="px-4 py-4 text-center">
                    {/* <button
                      aria-label="View"
                      className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-[#] text-gray-500 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
                    >00000014
                      <EyeIcon />
                    </button> */}
                    <ViewStudentModal id = {student?.studentId} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-[#00000014]">
          <p className="text-sm text-gray-500">
            {total === 0
              ? "No results"
              : `Showing ${from} to ${to} of ${total} results`}
          </p>

          <div className="flex items-center gap-1">
            {/* Prev */}
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-10 h-10 flex items-center justify-center rounded border border-gray-200 text-black hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors bg-[#A8A8A8]"
            >
              <ChevronLeft />
            </button>

            {/* Page numbers */}
            {getPageNumbers().map((p, i) =>
              p === "..." ? (
                <span
                  key={`dots-${i}`}
                  className="w-7 h-7 flex items-center justify-center text-xs text-gray-400 select-none"
                >
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p as number)}
                  className={`w-10 h-10 flex items-center justify-center rounded text-xs font-semibold cursor-pointer transition-colors ${
                    page === p
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {p}
                </button>
              )
            )}

            {/* Next */}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              className="w-10 h-10 flex items-center justify-center rounded border border-gray-200 bg-[#A8A8A8] text-black hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentListPage;