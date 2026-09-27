"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createResidentAction, updateResidentAction } from "@/actions/resident.actions";
import Link from "next/link";

function SubmitButton({ label, loadingLabel }: { label: string; loadingLabel: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70"
    >
      {pending ? loadingLabel : label}
    </button>
  );
}

type Resident = {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
};

export default function ResidentForm({ resident }: { resident?: Resident }) {
  const isEditing = !!resident;
  
  // Use bound action for update
  const actionToUse = isEditing 
    ? updateResidentAction.bind(null, resident.id) 
    : createResidentAction;

  const [state, action] = useActionState(actionToUse, null);

  return (
    <form action={action} className="space-y-6 max-w-2xl bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      {state?.success === false && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
          {state.message}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Nama Lengkap <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          defaultValue={resident?.name || ""}
          required
          className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
        {state?.success === false && state.fieldErrors?.name && (
          <p className="mt-1 text-sm text-red-500">{state.fieldErrors.name[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          Nomor HP
        </label>
        <input
          id="phone"
          name="phone"
          type="text"
          defaultValue={resident?.phone || ""}
          className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Contoh: 08123456789"
        />
        {state?.success === false && state.fieldErrors?.phone && (
          <p className="mt-1 text-sm text-red-500">{state.fieldErrors.phone[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
          Alamat
        </label>
        <textarea
          id="address"
          name="address"
          rows={3}
          defaultValue={resident?.address || ""}
          className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
        {state?.success === false && state.fieldErrors?.address && (
          <p className="mt-1 text-sm text-red-500">{state.fieldErrors.address[0]}</p>
        )}
      </div>

      <div className="flex gap-4">
        <SubmitButton 
          label="Simpan" 
          loadingLabel="Menyimpan..." 
        />
        <Link
          href={isEditing ? `/masyarakat/${resident.id}` : "/masyarakat"}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md text-center"
        >
          Batal
        </Link>
      </div>
    </form>
  );
}
