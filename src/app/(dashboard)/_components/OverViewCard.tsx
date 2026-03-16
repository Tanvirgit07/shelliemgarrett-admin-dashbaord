'use client'
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Image from "next/image";
import React from "react";
import cardImage1 from "@../../../public/images/cardImage1.png";
import cardImage2 from "@../../../public/images/cardImage2.png";
import cardIamge3 from "@../../../public/images/cardImage3.png";
import cardIamge4 from "@../../../public/images/cardImage4.png";

function OverViewCard() {
  const session = useSession();
  const TOKEN = session?.data?.user?.accessToken;

  const {
    data: overViewData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["overview-data"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/admin/stats`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
          },
        },
      );

      if (!res.ok) {
        throw new Error("Failed to fetch overview data");
      }

      return res.json();
    },
    enabled: !!TOKEN,
  });

  const totals = overViewData?.data?.totals || {};

  if (isError) return <p>Error: {(error as Error).message}</p>;

  // Skeleton Card
  const SkeletonCard = () => (
    <div className="bg-white rounded-[6px] border border-gray-200 p-5 flex items-center justify-between shadow-[0px_2px_6px_0px_#00000014] animate-pulse">
      <div className="space-y-2 w-full">
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        <div className="h-8 bg-gray-300 rounded w-1/2"></div>
      </div>
      <div className="w-14 h-14 bg-gray-300 rounded-full"></div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 py-6">
      {isLoading ? (
        <>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </>
      ) : (
        <>
          {/* Total Donation */}
          <div className="bg-white rounded-[6px] border border-gray-200 p-5 flex items-center justify-between shadow-[0px_2px_6px_0px_#00000014]">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">
                Total Donation
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {totals.donationAmount || 0}
              </p>
            </div>
            <div className="w-14 h-14 relative">
              <Image
                src={cardImage1}
                alt="Total Donation"
                fill
                className="object-contain"
              />
            </div>
          </div>

          {/* Total Campaigns */}
          <div className="bg-white rounded-[6px] border border-gray-200 p-5 flex items-center justify-between shadow-[0px_2px_6px_0px_#00000014]">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">
                Total Campaigns
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {totals.campaigns || 0}
              </p>
            </div>
            <div className="w-14 h-14 relative">
              <Image
                src={cardImage2}
                alt="Total Campaigns"
                fill
                className="object-contain"
              />
            </div>
          </div>

          {/* Total Donors */}
          <div className="bg-white rounded-[6px] border border-gray-200 p-5 flex items-center justify-between shadow-[0px_2px_6px_0px_#00000014]">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">
                Total Donors
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {totals.donors || 0}
              </p>
            </div>
            <div className="w-14 h-14 relative">
              <Image
                src={cardIamge3}
                alt="Total Donors"
                fill
                className="object-contain"
              />
            </div>
          </div>

          {/* Guest Users */}
          <div className="bg-white rounded-[6px] border border-gray-200 p-5 flex items-center justify-between shadow-[0px_2px_6px_0px_#00000014]">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Guest Users</p>
              <p className="text-3xl font-bold text-gray-900">
                {totals.guestUsers || 0}
              </p>
            </div>
            <div className="w-14 h-14 relative">
              <Image
                src={cardIamge4}
                alt="Guest Users"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default OverViewCard;