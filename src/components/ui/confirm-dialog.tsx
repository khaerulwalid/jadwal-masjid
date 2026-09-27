"use client";

import { AlertTriangle, Mosque } from "lucide-react";

export default function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmText = "Konfirmasi",
  cancelText = "Batal",
  variant = "default",
  isPending = false,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "danger";
  isPending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!isOpen) return null;

  const isDanger = variant === "danger";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="flex min-h-screen items-end justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-emerald-950/55 backdrop-blur-sm transition-opacity"
          onClick={!isPending ? onCancel : undefined}
          aria-hidden="true"
        />
        <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
        <div className="relative z-10 inline-block w-full transform overflow-hidden rounded-lg border border-emerald-900/10 bg-white text-left align-bottom shadow-2xl shadow-emerald-950/20 transition-all sm:my-8 sm:max-w-md sm:align-middle">
          <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#047857,#d6a73a,#0f766e)]" />
          <div className="px-5 pb-4 pt-6 sm:p-6">
            <div className="sm:flex sm:items-start">
              <div
                className={`mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-md sm:mx-0 ${
                  isDanger ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-800"
                }`}
              >
                {isDanger ? (
                  <AlertTriangle className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <Mosque className="h-6 w-6" aria-hidden="true" />
                )}
              </div>
              <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                <h3 id="confirm-title" className="text-base font-semibold leading-6 text-slate-950">
                  {title}
                </h3>
                {description && (
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {description}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="bg-emerald-50/60 px-5 py-4 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              onClick={onConfirm}
              disabled={isPending}
              className={`inline-flex w-full justify-center rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto disabled:cursor-not-allowed disabled:opacity-60 ${
                isDanger ? "bg-red-700 hover:bg-red-800" : "bg-emerald-700 hover:bg-emerald-800"
              }`}
            >
              {isPending ? "Memproses..." : confirmText}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={isPending}
              className="mt-3 inline-flex w-full justify-center rounded-md border border-emerald-900/15 bg-white px-4 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-50 sm:mt-0 sm:w-auto disabled:cursor-not-allowed disabled:opacity-60"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
