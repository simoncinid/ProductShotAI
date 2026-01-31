'use client'

import { useState } from 'react'
import { promptApi } from '@/lib/api'
import toast from 'react-hot-toast'

type EditPromptWithAIProps = {
  value: string
  onChange: (newValue: string) => void
  /** Placeholder per l'input delle istruzioni di modifica */
  editInputPlaceholder?: string
  /** Testo del pulsante principale */
  buttonLabel?: string
  /** Testo del pulsante Applica */
  applyLabel?: string
  /** Classe aggiuntiva per il wrapper (es. allineamento) */
  className?: string
}

const defaultEditPlaceholder = "Es: aggiungi sfondo bianco, ombra soft, colori più vivaci..."
const defaultButtonLabel = "Edit prompt with AI"
const defaultApplyLabel = "Applica"

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
      toast.error('Scrivi come vuoi modificare il prompt')
      return
    }
    setIsLoading(true)
    try {
      const { edited_prompt } = await promptApi.edit(value || '', instructions)
      onChange(edited_prompt)
      setEditInstructions('')
      setIsOpen(false)
      toast.success('Prompt aggiornato')
    } catch (e: unknown) {
      const msg = e && typeof e === 'object' && 'response' in e
        ? (e as { response?: { data?: { detail?: string } } }).response?.data?.detail
        : null
      toast.error(msg || 'Modifica prompt fallita')
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
        className={`text-sm text-vivid-yellow hover:underline font-medium ${className}`}
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
          Annulla
        </button>
      </div>
    </div>
  )
}
