/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Save,
  Upload,
  ImagePlus,
  X,
  Loader2,
  FileText,
  FileSpreadsheet,
  File,
} from "lucide-react";
import Image from "next/image";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

// ─── Photo Slot Type ──────────────────────────────────────────────────────────
type PhotoSlot =
  | { type: "existing"; url: string }
  | { type: "new"; preview: string }
  | null;

// ─── File Preview Icon ────────────────────────────────────────────────────────
function FilePreviewIcon({ file }: { file: File }) {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";

  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) {
    const preview = URL.createObjectURL(file);
    return (
      <Image
        src={preview}
        alt={file.name}
        width={56}
        height={56}
        className="w-14 h-14 rounded-md object-cover"
        onLoad={() => URL.revokeObjectURL(preview)}
      />
    );
  }
  if (["xls", "xlsx", "csv"].includes(ext))
    return <FileSpreadsheet className="w-10 h-10 text-green-500" />;
  if (ext === "pdf")
    return <FileText className="w-10 h-10 text-red-500" />;
  if (["doc", "docx"].includes(ext))
    return <FileText className="w-10 h-10 text-blue-500" />;
  return <File className="w-10 h-10 text-gray-400" />;
}

export default function EditCampain() {
  const [campaignName, setCampaignName] = useState("");
  const [description, setDescription] = useState("");
  const [raisedGoals, setRaisedGoals] = useState("");
  const [studentFile, setStudentFile] = useState<File | null>(null);
  const [isDragOverDoc, setIsDragOverDoc] = useState(false);
  const [isDragOverImg, setIsDragOverImg] = useState(false);
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const [newPhotos, setNewPhotos] = useState<{ file: File; preview: string }[]>([]);

  const docInputRef = useRef<HTMLInputElement>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);

  const session = useSession();
  const TOKEN = session?.data?.user?.accessToken;
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  // ─── Fetch Campaign ───────────────────────────────────────────────────
  const { data: campaignData, isLoading: isFetching } = useQuery({
    queryKey: ["campaign", id],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/campaign/${id}`,
        {
          headers: { Authorization: `Bearer ${TOKEN}` },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch campaign");
      return res.json();
    },
    enabled: !!id && !!TOKEN,
  });

  // ─── Populate Form ────────────────────────────────────────────────────
  useEffect(() => {
    if (campaignData?.data) {
      const c = campaignData.data;
      setCampaignName(c.name || "");
      setDescription(c.description || "");
      setRaisedGoals(c.raiseGoal ? c.raiseGoal.toString() : "");
      setExistingPhotos(c.media?.map((m: { url: string }) => m.url) || []);
    }
  }, [campaignData]);

  // ─── Document Drag & Drop ─────────────────────────────────────────────
  const handleDocDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverDoc(true);
  }, []);
  const handleDocDragLeave = useCallback(() => setIsDragOverDoc(false), []);
  const handleDocDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverDoc(false);
    const file = e.dataTransfer.files?.[0];
    if (file) setStudentFile(file);
  }, []);
  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setStudentFile(file);
  };

  // ─── Image Drag & Drop ────────────────────────────────────────────────
  const handleImgDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverImg(true);
  }, []);
  const handleImgDragLeave = useCallback(() => setIsDragOverImg(false), []);
  const handleImgDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOverImg(false);
      const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith("image/")
      );
      addPhotos(files);
    },
    [newPhotos, existingPhotos]
  );
  const handleImgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addPhotos(files);
  };

  const totalPhotos = existingPhotos.length + newPhotos.length;

  const addPhotos = (files: File[]) => {
    const remaining = 5 - totalPhotos;
    if (remaining <= 0) return;
    const toAdd = files.slice(0, remaining).map((f) => ({
      file: f,
      preview: URL.createObjectURL(f),
    }));
    setNewPhotos((prev) => [...prev, ...toAdd]);
  };

  const removeExistingPhoto = (index: number) => {
    setExistingPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewPhoto = (index: number) => {
    setNewPhotos((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  // ─── Update Mutation ──────────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("name", campaignName.trim());
      formData.append("description", description.trim());
      formData.append("raiseGoal", raisedGoals);

      if (studentFile) formData.append("studentFile", studentFile);

      existingPhotos.forEach((url) => formData.append("existingMedia", url));
      newPhotos.forEach((photo) => formData.append("media", photo.file));

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/campaign/${id}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${TOKEN}` },
          body: formData,
        }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(
          errorData?.message || `Request failed with status ${res.status}`
        );
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Campaign updated successfully!");
      router.back();
    },
    onError: (error: Error) => {
      toast.error(`Failed to update campaign: ${error.message}`);
    },
  });

  const handleSave = () => {
    if (!campaignName.trim()) {
      toast.warning("Please enter a campaign name.");
      return;
    }
    if (!raisedGoals || Number(raisedGoals) <= 0) {
      toast.warning("Please enter a valid raised goal amount.");
      return;
    }
    updateMutation.mutate();
  };

  // ─── Build 5 photo slots ──────────────────────────────────────────────
  const allSlots: PhotoSlot[] = [
    ...existingPhotos.map((url) => ({ type: "existing" as const, url })),
    ...newPhotos.map((p) => ({ type: "new" as const, preview: p.preview })),
    ...Array(Math.max(0, 5 - totalPhotos)).fill(null),
  ].slice(0, 5);

  const isLoading = updateMutation.isPending;

  // ─── Skeleton ─────────────────────────────────────────────────────────
  if (isFetching) {
    return (
      <div className="min-h-screen py-7 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded mb-5" />
        <div className="bg-white rounded-xl p-6 shadow-sm mb-5 flex flex-col gap-4">
          <div className="h-5 w-32 bg-gray-200 rounded" />
          <div className="h-10 w-full bg-gray-200 rounded" />
          <div className="h-5 w-32 bg-gray-200 rounded" />
          <div className="h-24 w-full bg-gray-200 rounded" />
          <div className="h-5 w-32 bg-gray-200 rounded" />
          <div className="h-10 w-full bg-gray-200 rounded" />
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="h-5 w-40 bg-gray-200 rounded mb-4" />
          <div className="h-36 w-full bg-gray-200 rounded mb-4" />
          <div className="grid grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-7">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-[22px] font-bold text-gray-900">Edit Campaign</h1>
        <Button
          onClick={handleSave}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm h-[38px] px-5 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              Saving...
              <Loader2 className="w-4 h-4 animate-spin" />
            </>
          ) : (
            <>
              Save Changes
              <Save className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>

      {/* Top Form Card */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-5">
        {/* Campaign Name */}
        <div className="mb-4">
          <Label className="text-[13px] font-medium text-gray-600 mb-1.5 block">
            Campaign Name
          </Label>
          <Input
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            placeholder="Type campaign name here ..."
            disabled={isLoading}
            className="border-gray-200 focus-visible:ring-blue-500 text-gray-800 text-sm h-[42px]"
          />
        </div>

        {/* Campaign Description */}
        <div className="mb-4">
          <Label className="text-[13px] font-medium text-gray-600 mb-1.5 block">
            Campaign Description
          </Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Type campaign description here ..."
            rows={4}
            disabled={isLoading}
            className="border-gray-200 focus-visible:ring-blue-500 text-gray-800 text-sm resize-none"
          />
        </div>

        {/* Raised Goals */}
        <div className="mb-5">
          <Label className="text-[13px] font-medium text-gray-600 mb-1.5 block">
            Raised Goals
          </Label>
          <Input
            value={raisedGoals}
            onChange={(e) => setRaisedGoals(e.target.value)}
            placeholder="Enter Amount"
            type="number"
            min={0}
            disabled={isLoading}
            className="border-gray-200 focus-visible:ring-blue-500 text-gray-800 text-sm h-[42px]"
          />
        </div>

        {/* Upload Student List */}
        <div>
          <Label className="text-[13px] font-medium text-gray-600 mb-1.5 block">
            Upload student list
          </Label>

          {studentFile ? (
            <div className="border-2 border-blue-200 bg-blue-50 rounded-lg px-4 py-4 flex items-center gap-4">
              <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-lg bg-white border border-gray-200 overflow-hidden">
                <FilePreviewIcon file={studentFile} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {studentFile.name}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {(studentFile.size / 1024).toFixed(1)} KB &middot;{" "}
                  {studentFile.name.split(".").pop()?.toUpperCase()}
                </p>
              </div>
              {!isLoading && (
                <button
                  onClick={() => {
                    setStudentFile(null);
                    if (docInputRef.current) docInputRef.current.value = "";
                  }}
                  className="flex-shrink-0 w-7 h-7 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-red-500" />
                </button>
              )}
            </div>
          ) : (
            <div
              onDragOver={handleDocDragOver}
              onDragLeave={handleDocDragLeave}
              onDrop={handleDocDrop}
              onClick={() => !isLoading && docInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg flex flex-col items-center justify-center py-10 transition-colors select-none ${
                isLoading ? "cursor-not-allowed opacity-60" : "cursor-pointer"
              } ${
                isDragOverDoc
                  ? "border-blue-400 bg-blue-50"
                  : "border-gray-300 bg-white hover:border-blue-300 hover:bg-gray-50"
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                <Upload className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-sm text-gray-400">Drag and drop doc here</p>
            </div>
          )}

          <input
            ref={docInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.csv"
            className="hidden"
            onChange={handleDocChange}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Campaign Photos Card */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <Label className="text-[13px] font-medium text-gray-600 mb-3 block">
          Campaign Photos
        </Label>

        {/* Main Drop Zone */}
        <div
          onDragOver={handleImgDragOver}
          onDragLeave={handleImgDragLeave}
          onDrop={handleImgDrop}
          onClick={() => !isLoading && imgInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg flex flex-col items-center justify-center py-14 transition-colors select-none mb-4 ${
            isLoading ? "cursor-not-allowed opacity-60" : "cursor-pointer"
          } ${
            isDragOverImg
              ? "border-blue-400 bg-blue-50"
              : "border-gray-300 bg-white hover:border-blue-300 hover:bg-gray-50"
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
            <ImagePlus className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-sm text-gray-400">
            Drag and drop image here, or click add image
          </p>
          <input
            ref={imgInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImgChange}
            disabled={isLoading}
          />
        </div>

        {/* Photo Slots Row */}
        <div className="grid grid-cols-5 gap-3">
          {allSlots.map((slot, index) => (
            <div
              key={index}
              className="border-2 border-dashed border-gray-200 rounded-lg aspect-square flex items-center justify-center overflow-hidden relative bg-gray-50"
            >
              {slot ? (
                <>
                  <Image
                    width={300}
                    height={300}
                    src={slot.type === "existing" ? slot.url : slot.preview}
                    alt={`image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {!isLoading && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (slot.type === "existing") {
                          removeExistingPhoto(existingPhotos.indexOf(slot.url));
                        } else {
                          removeNewPhoto(index - existingPhotos.length);
                        }
                      }}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </>
              ) : (
                <span className="text-[11px] text-gray-400">
                  image {index + 1}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}