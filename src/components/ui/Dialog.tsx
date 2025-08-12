'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface DialogContextType {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

const DialogContext = createContext<DialogContextType | undefined>(undefined)

export function Dialog({ children, open, onOpenChange }: { children: ReactNode; open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <DialogContext.Provider value={{ isOpen: open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  )
}

export function DialogContent({ children, className = '' }: { children: ReactNode; className?: string }) {
  const context = useContext(DialogContext)
  if (!context) throw new Error('DialogContent must be used within Dialog')

  if (!context.isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => context.onOpenChange(false)}
      />
      
      {/* Modal */}
      <div className={`relative bg-white rounded-2xl shadow-2xl max-w-lg w-full ${className}`}>
        {children}
      </div>
    </div>
  )
}

export function DialogHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`p-6 border-b border-gray-200 ${className}`}>
      {children}
    </div>
  )
}

export function DialogTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={`text-xl font-bold text-gray-900 ${className}`}>
      {children}
    </h2>
  )
}
