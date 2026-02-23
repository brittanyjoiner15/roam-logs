'use client'

import { useState, useTransition } from 'react'
import { deleteJournalEntry } from '@/actions/journal'

type DeleteEntryButtonProps = {
  entryId: string
  username: string
}

export default function DeleteEntryButton({ entryId, username }: DeleteEntryButtonProps) {
  const [confirming, setConfirming] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteJournalEntry(entryId, username)
      if (result?.error) {
        setError(result.error)
        setConfirming(false)
      }
      // On success, deleteJournalEntry redirects
    })
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm text-gray-600">Delete this entry?</span>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="text-sm text-red-600 font-medium hover:underline disabled:opacity-50"
        >
          {isPending ? 'Deleting...' : 'Yes, delete'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={isPending}
          className="text-sm text-gray-500 hover:underline"
        >
          Cancel
        </button>
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-sm text-gray-400 hover:text-red-500 transition-colors"
    >
      Delete
    </button>
  )
}
