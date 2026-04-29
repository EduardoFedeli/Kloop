"use client"

import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"

interface Category {
  id: string
  name: string
  parentId: string | null
}

interface CategoryPickerProps {
  categories: Category[]
  value: string
  onChange: (categoryId: string, deptName: string, catName: string) => void
  error?: string
}

function SelectField({
  placeholder,
  value,
  options,
  onChange,
}: {
  placeholder: string
  value: string
  options: { id: string; name: string }[]
  onChange: (id: string) => void
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full bg-transparent border rounded-xl px-4 py-3.5 text-[14px] outline-none focus:border-[var(--color-teal)] transition-colors appearance-none cursor-pointer",
          !value
            ? "border-gray-200 dark:border-white/20 text-gray-400 dark:text-sage"
            : "border-gray-200 dark:border-white/20 text-[var(--foreground)]",
        )}
      >
        <option value="" disabled className="bg-white dark:bg-[var(--color-pine)]">
          {placeholder}
        </option>
        {options.map((opt) => (
          <option
            key={opt.id}
            value={opt.id}
            className="bg-white dark:bg-[var(--color-pine)] text-[var(--foreground)]"
          >
            {opt.name}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-400 dark:text-sage">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  )
}

export function CategoryPicker({ categories, value, onChange, error }: CategoryPickerProps) {
  const roots = useMemo(() => categories.filter((c) => c.parentId === null), [categories])

  const [selectedDeptId, setSelectedDeptId] = useState("")

  const children = useMemo(
    () => categories.filter((c) => c.parentId === selectedDeptId),
    [categories, selectedDeptId],
  )

  const handleDeptChange = (deptId: string) => {
    setSelectedDeptId(deptId)
    // Reset leaf when department changes
    onChange("", roots.find((r) => r.id === deptId)?.name ?? "", "")
  }

  const handleLeafChange = (leafId: string) => {
    const dept = roots.find((r) => r.id === selectedDeptId)
    const leaf = children.find((c) => c.id === leafId)
    onChange(leafId, dept?.name ?? "", leaf?.name ?? "")
  }

  const selectedLeafId = useMemo(() => {
    // Keep selected leaf in sync with the form value
    const isLeafInCurrentDept = children.some((c) => c.id === value)
    return isLeafInCurrentDept ? value : ""
  }, [children, value])

  return (
    <div className="space-y-3">
      <SelectField
        placeholder="Selecione o departamento"
        value={selectedDeptId}
        options={roots}
        onChange={handleDeptChange}
      />
      {selectedDeptId && children.length > 0 && (
        <SelectField
          placeholder="Selecione a categoria"
          value={selectedLeafId}
          options={children}
          onChange={handleLeafChange}
        />
      )}
      {error && (
        <p className="text-[12px] text-red-500 pl-1 font-medium">{error}</p>
      )}
    </div>
  )
}
