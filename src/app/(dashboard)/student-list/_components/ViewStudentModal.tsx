/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { EyeIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

interface Props {
  id?: string;
}

export function ViewStudentModal({ id }: Props) {
  const session = useSession();
  const TOKEN = session?.data?.user?.accessToken;
  const { data, isLoading } = useQuery({
    queryKey: ["student", id],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/admin/studentlist/${id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${TOKEN}`,
          },
        },
      );
      if (!res.ok) throw new Error("Failed to fetch student");
      return res.json();
    },
    enabled: !!id,
  });

  const user = data?.data?.user;
  const statistics = data?.data?.statistics;
  const campaigns = data?.data?.campaigns ?? [];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          aria-label="View"
          className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-[#00000014] text-gray-500 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
        >
          <EyeIcon />
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[22px] font-bold text-gray-900">
            Student Details
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <p className="text-gray-400 text-sm">Loading...</p>
          </div>
        ) : !user ? (
          <div className="flex items-center justify-center py-10">
            <p className="text-red-400 text-sm">Failed to load student data.</p>
          </div>
        ) : (
          <div className="space-y-6 py-2">
            {/* ── Avatar + Basic Info ── */}
            <div className="flex items-center gap-4">
              {user.profileImage ? (
                <Image
                  width={400}
                  height={400}
                  src={user.profileImage}
                  alt={user.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 text-[22px] font-bold">
                    {user.name
                      .split(" ")
                      .map((w: string) => w[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <p className="text-[20px] font-semibold text-gray-900">
                  {user.name}
                </p>
                <p className="text-[14px] text-gray-400">{user.email}</p>
                <span className="inline-block mt-1 text-[12px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium border border-blue-100">
                  ID: {user.studentId}
                </span>
              </div>
            </div>

            {/* ── Personal Info ── */}
            <div>
              <h3 className="text-[15px] font-semibold text-gray-700 mb-2 border-b pb-1">
                Personal Info
              </h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[14px]">
                <div className="flex justify-between">
                  <span className="text-gray-500">Gender</span>
                  <span className="font-medium capitalize text-gray-800">
                    {user.gender || "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date of Birth</span>
                  <span className="font-medium text-gray-800">
                    {user.dob || "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Language</span>
                  <span className="font-medium text-gray-800">
                    {user.language || "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Verified</span>
                  <span
                    className={`font-medium ${user.isVerified ? "text-green-600" : "text-red-500"}`}
                  >
                    {user.isVerified ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Role</span>
                  <span className="font-medium text-gray-800">{user.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Subscription</span>
                  <span
                    className={`font-medium ${user.hasActiveSubscription ? "text-green-600" : "text-gray-400"}`}
                  >
                    {user.hasActiveSubscription ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            {/* ── Address ── */}
            <div>
              <h3 className="text-[15px] font-semibold text-gray-700 mb-2 border-b pb-1">
                Address
              </h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[14px]">
                <div className="flex justify-between">
                  <span className="text-gray-500">Country</span>
                  <span className="font-medium text-gray-800">
                    {user.address?.country || "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">City/State</span>
                  <span className="font-medium text-gray-800">
                    {user.address?.cityState || "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Road/Area</span>
                  <span className="font-medium text-gray-800">
                    {user.address?.roadArea || "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Postal Code</span>
                  <span className="font-medium text-gray-800">
                    {user.address?.postalCode || "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* ── Statistics ── */}
            <div>
              <h3 className="text-[15px] font-semibold text-gray-700 mb-2 border-b pb-1">
                Statistics
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-blue-50 rounded-lg px-4 py-3 text-center">
                  <p className="text-[22px] font-bold text-blue-600">
                    {statistics?.totalCampaigns ?? 0}
                  </p>
                  <p className="text-[12px] text-gray-500 mt-0.5">Campaigns</p>
                </div>
                <div className="bg-green-50 rounded-lg px-4 py-3 text-center">
                  <p className="text-[22px] font-bold text-green-600">
                    $ {statistics?.totalRaisedByUser?.toLocaleString() ?? 0}
                  </p>
                  <p className="text-[12px] text-gray-500 mt-0.5">
                    Total Raised
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg px-4 py-3 text-center">
                  <p className="text-[22px] font-bold text-purple-600">
                    $ {statistics?.averagePerCampaign?.toLocaleString() ?? 0}
                  </p>
                  <p className="text-[12px] text-gray-500 mt-0.5">
                    Avg / Campaign
                  </p>
                </div>
              </div>
            </div>

            {/* ── Campaigns ── */}
            <div>
              <h3 className="text-[15px] font-semibold text-gray-700 mb-2 border-b pb-1">
                Campaigns ({campaigns.length})
              </h3>
              <div className="space-y-3">
                {campaigns.length === 0 ? (
                  <p className="text-gray-400 text-[13px]">
                    No campaigns joined yet.
                  </p>
                ) : (
                  campaigns.map((c: any) => (
                    <Link href={`/all-campaigns/${c.campaignId}`}  key={c.campaignId}>
                    <div
                     
                      className="border border-gray-100 rounded-lg p-3 flex gap-3 items-start"
                    >
                      {/* Campaign Image */}
                      {c.campaignMedia?.[0]?.url ? (
                        <Image
                          width={500}
                          height={500}
                          src={c.campaignMedia[0].url}
                          alt={c.campaignName}
                          className="w-14 h-14 rounded-md object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-md bg-gray-100 flex-shrink-0" />
                      )}

                      {/* Campaign Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-semibold text-gray-900 truncate">
                          {c.campaignName}
                        </p>
                        <p className="text-[12px] text-gray-400 truncate">
                          {c.campaignDescription}
                        </p>
                        <div className="flex gap-4 mt-1 text-[12px]">
                          <span className="text-gray-500">
                            Goal:{" "}
                            <span className="font-medium text-gray-700">
                              $ {Number(c.campaignGoal).toLocaleString()}
                            </span>
                          </span>
                          <span className="text-gray-500">
                            Raised:{" "}
                            <span className="font-medium text-green-600">
                              $ {c.campaignTotalRaised.toLocaleString()}
                            </span>
                          </span>
                          <span className="text-gray-500">
                            Donations:{" "}
                            <span className="font-medium text-gray-700">
                              {c.donationCount}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <DialogClose asChild>
            <button className="px-5 py-2 rounded-lg border border-gray-200 text-gray-600 text-[14px] hover:bg-gray-50 transition-colors cursor-pointer">
              Close
            </button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
