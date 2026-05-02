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
  required,
}: {
  placeholder: string
  value: string
  options: { id: string; name: string }[]
  onChange: (id: string) => void
  required?: boolean
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
          {placeholder}{required ? " *" : ""}
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

function directChildren(parentId: string, all: Category[]): Category[] {
  return all.filter((c) => c.parentId === parentId)
}

export function CategoryPicker({ categories, value, onChange, error }: CategoryPickerProps) {
  const roots = useMemo(() => categories.filter((c) => c.parentId === null), [categories])

  const [selectedDeptId, setSelectedDeptId] = useState("")
  const [selectedCatId, setSelectedCatId] = useState("")
  const [selectedSubId, setSelectedSubId] = useState("")

  const catOptions = useMemo(
    () => directChildren(selectedDeptId, categories),
    [categories, selectedDeptId],
  )

  const subOptions = useMemo(
    () => (selectedCatId ? directChildren(selectedCatId, categories) : []),
    [categories, selectedCatId],
  )

  const detailOptions = useMemo(
    () => (selectedSubId ? directChildren(selectedSubId, categories) : []),
    [categories, selectedSubId],
  )

  const showSubSelect = selectedCatId !== "" && subOptions.length > 0
  const showDetailSelect = selectedSubId !== "" && detailOptions.length > 0

  const handleDeptChange = (deptId: string) => {
    setSelectedDeptId(deptId)
    setSelectedCatId("")
    setSelectedSubId("")
    const dept = roots.find((r) => r.id === deptId)
    onChange("", dept?.name ?? "", "")
  }

  const handleCatChange = (catId: string) => {
    setSelectedCatId(catId)
    setSelectedSubId("")
    const dept = roots.find((r) => r.id === selectedDeptId)
    const cat = catOptions.find((c) => c.id === catId)
    const isLeaf = directChildren(catId, categories).length === 0
    onChange(isLeaf ? catId : "", dept?.name ?? "", cat?.name ?? "")
  }

  const handleSubChange = (subId: string) => {
    setSelectedSubId(subId)
    const dept = roots.find((r) => r.id === selectedDeptId)
    const cat = catOptions.find((c) => c.id === selectedCatId)
    const isLeaf = directChildren(subId, categories).length === 0
    onChange(isLeaf ? subId : "", dept?.name ?? "", cat?.name ?? "")
  }

  const handleDetailChange = (detailId: string) => {
    const dept = roots.find((r) => r.id === selectedDeptId)
    const cat = catOptions.find((c) => c.id === selectedCatId)
    onChange(detailId, dept?.name ?? "", cat?.name ?? "")
  }

  const selectedDetailValue = useMemo(
    () => (detailOptions.some((c) => c.id === value) ? value : ""),
    [detailOptions, value],
  )

  const needsSubcat = showSubSelect && !selectedSubId
  const needsDetail = showDetailSelect && !selectedDetailValue

  return (
    <div className="space-y-3">
      <SelectField
        placeholder="Selecione o departamento"
        value={selectedDeptId}
        options={roots}
        onChange={handleDeptChange}
      />

      {selectedDeptId && catOptions.length > 0 && (
        <SelectField
          placeholder="Selecione a categoria"
          value={selectedCatId}
          options={catOptions}
          onChange={handleCatChange}
          required
        />
      )}

      {showSubSelect && (
        <SelectField
          placeholder="Selecione a subcategoria"
          value={selectedSubId}
          options={subOptions}
          onChange={handleSubChange}
          required
        />
      )}

      {showDetailSelect && (
        <SelectField
          placeholder="Selecione o detalhe"
          value={selectedDetailValue}
          options={detailOptions}
          onChange={handleDetailChange}
          required
        />
      )}

      {error && (
        <p className="text-[12px] text-red-500 pl-1 font-medium">
          {needsSubcat || needsDetail
            ? "Escolha uma subcategoria pra continuar"
            : error}
        </p>
      )}
    </div>
  )
}
