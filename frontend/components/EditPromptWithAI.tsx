'use client'

import { useState } from 'react'
import { promptApi } from '@/lib/api'
import toast from 'react-hot-toast'

type EditPromptWithAIProps = {
  value: string
  onChange: (newValue: string) => void
  /** Placeholder for the edit instructions input */
  editInputPlaceholder?: string
  /** Main button text */
  buttonLabel?: string
  /** Apply button text */
  applyLabel?: string
  /** Additional class for the wrapper (e.g. alignment) */
  className?: string
}

const defaultEditPlaceholder = "E.g.: add white background, soft shadow, more vibrant colors..."
const defaultButtonLabel = "Edit prompt with AI"
const defaultApplyLabel = "Apply"

export function EditPromptWithAI({
  value,
  onChange,
  editInputPlaceholder = defaultEditPlaceholder,
  buttonLabel = defaultButtonLabel,
  applyLabel = defaultApplyLabel,
  className = '',
}: EditPromptWithAIProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [editInstructions, setEditInstructions] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleApply = async () => {
    const instructions = editInstructions.trim()
    if (!instructions) {
      toast.error('Describe how you want to edit the prompt')
      return
    }
    setIsLoading(true)
    try {
      const { edited_prompt } = await promptApi.edit(value || '', instructions)
      onChange(edited_prompt)
      setEditInstructions('')
      setIsOpen(false)
      toast.success('Prompt updated')
    } catch (e: unknown) {
      const msg = e && typeof e === 'object' && 'response' in e
        ? (e as { response?: { data?: { detail?: string } } }).response?.data?.detail
        : null
      toast.error(msg || 'Edit prompt failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setEditInstructions('')
    setIsOpen(false)
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`text-sm text-anthracite hover:underline font-medium ${className}`}
      >
        {buttonLabel}
      </button>
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <input
        type="text"
        value={editInstructions}
        onChange={(e) => setEditInstructions(e.target.value)}
        placeholder={editInputPlaceholder}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-vivid-yellow focus:border-transparent"
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleApply()
          if (e.key === 'Escape') handleCancel()
        }}
        autoFocus
        disabled={isLoading}
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleApply}
          disabled={isLoading || !editInstructions.trim()}
          className="px-3 py-1.5 bg-vivid-yellow text-rich-black rounded-md text-sm font-semibold disabled:opacity-50"
        >
          {isLoading ? '…' : applyLabel}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={isLoading}
          className="px-3 py-1.5 border border-gray-300 rounded-md text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
