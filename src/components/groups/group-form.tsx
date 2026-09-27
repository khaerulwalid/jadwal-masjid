"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createGroupAction, updateGroupAction } from "@/actions/group.actions";
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

type Group = {
  id: string;
  name: string;
  sequenceNo: number;
};

export default function GroupForm({ group, suggestedSequence }: { group?: Group, suggestedSequence?: number }) {
  const isEditing = !!group;
  
  const actionToUse = isEditing 
    ? updateGroupAction.bind(null, group.id) 
    : createGroupAction;

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
          Nama Kelompok <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          defaultValue={group?.name || ""}
          required
          className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
        {state?.success === false && state.fieldErrors?.name && (
          <p className="mt-1 text-sm text-red-500">{state.fieldErrors.name[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="sequenceNo" className="block text-sm font-medium text-gray-700 mb-1">
          Urutan Rotasi <span className="text-red-500">*</span>
        </label>
        <input
          id="sequenceNo"
          name="sequenceNo"
          type="number"
          min="1"
          defaultValue={group?.sequenceNo || suggestedSequence || 1}
          required
          className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
        <p className="mt-1 text-xs text-gray-500">Angka unik yang menentukan giliran kelompok pada jadwal rotasi.</p>
        {state?.success === false && state.fieldErrors?.sequenceNo && (
          <p className="mt-1 text-sm text-red-500">{state.fieldErrors.sequenceNo[0]}</p>
        )}
      </div>

      <div className="flex gap-4">
        <SubmitButton 
          label="Simpan" 
          loadingLabel="Menyimpan..." 
        />
        <Link
          href={isEditing ? `/kelompok/${group.id}` : "/kelompok"}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md text-center"
        >
          Batal
        </Link>
      </div>
    </form>
  );
}
