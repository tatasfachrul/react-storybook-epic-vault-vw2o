'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Filter } from "lucide-react";

interface ComponentItem {
  id: string
  name: string
  description: string
  category: 'basic' | 'complex' | 'layout' | 'domain'
  status: 'stable' | 'beta' | 'new'
  variants: string[]
}

interface CatalogSectionProps {
  components: ComponentItem[]
  initialCategory: string
  onSelectComponent: (componentId: string) => void
}

const statusColor: Record<string, string> = {
  stable: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  beta: 'bg-amber-100 text-amber-700 border-amber-200',
  new: 'bg-sky-100 text-sky-700 border-sky-200',
}

const categoryLabels: Record<string, string> = {
  all: 'All',
  basic: 'Basic UI',
  complex: 'Complex',
  layout: 'Layout',
  domain: 'Domain',
}

export default function CatalogSection({
  components,
  initialCategory,
  onSelectComponent,
}: CatalogSectionProps) {
  const safeComponents = Array.isArray(components) ? components : []

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState(initialCategory || 'all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [searchDebounced, setSearchDebounced] = useState('')

  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleSearch = useCallback((value: string) => {
    setSearch(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setSearchDebounced(value)
    }, 300)
  }, [])

  React.useEffect(() => {
    if (initialCategory && initialCategory !== 'all') {
      setCategory(initialCategory)
    }
  }, [initialCategory])

  const filtered = useMemo(() => {
    let result = [...safeComponents]
    if (category !== 'all') {
      result = result.filter(c => c.category === category)
    }
    if (statusFilter !== 'all') {
      result = result.filter(c => c.status === statusFilter)
    }
    if (searchDebounced.trim()) {
      const q = searchDebounced.toLowerCase()
      result = result.filter(c => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q))
    }
    if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortBy === 'status') {
      const order = { new: 0, beta: 1, stable: 2 }
      result.sort((a, b) => (order[a.status] ?? 2) - (order[b.status] ?? 2))
    } else if (sortBy === 'category') {
      result.sort((a, b) => a.category.localeCompare(b.category))
    }
    return result
  }, [safeComponents, category, statusFilter, searchDebounced, sortBy])

  const categoryKeys = ['all', 'basic', 'complex', 'layout', 'domain']

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[hsl(222,47%,11%)]">Component Catalog</h1>
        <p className="text-base text-[hsl(215,16%,47%)] mt-1 leading-relaxed">Browse and explore all available components</p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {categoryKeys.map((key) => (
            <button
              key={key}
              onClick={() => setCategory(key)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${category === key ? 'bg-[hsl(222,47%,11%)] text-white border-[hsl(222,47%,11%)]' : 'bg-white/60 text-[hsl(215,16%,47%)] border-[hsl(214,32%,91%)] hover:bg-white/80'}`}
            >
              {categoryLabels[key] ?? key}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(215,16%,47%)]" />
            <Input
              placeholder="Search components..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9 bg-white/60 border-[hsl(214,32%,91%)] rounded-[0.875rem]"
            />
          </div>
          <div className="flex gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px] bg-white/60 border-[hsl(214,32%,91%)] rounded-[0.875rem]">
                <Filter className="h-3.5 w-3.5 mr-1 text-[hsl(215,16%,47%)]" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="stable">Stable</SelectItem>
                <SelectItem value="beta">Beta</SelectItem>
                <SelectItem value="new">New</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[130px] bg-white/60 border-[hsl(214,32%,91%)] rounded-[0.875rem]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="category">Category</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="bg-[hsl(0,0%,98%)]/75 backdrop-blur-[16px] border border-white/[0.18] rounded-[0.875rem] shadow-md">
          <CardContent className="py-12 text-center">
            <Search className="h-10 w-10 text-[hsl(215,16%,47%)] mx-auto mb-3 opacity-40" />
            <p className="text-base font-medium text-[hsl(222,47%,11%)]">No components found</p>
            <p className="text-sm text-[hsl(215,16%,47%)] mt-1">Try adjusting your filters or search terms</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((comp) => (
            <Card
              key={comp.id}
              className="bg-[hsl(0,0%,98%)]/75 backdrop-blur-[16px] border border-white/[0.18] rounded-[0.875rem] shadow-md cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] group"
              onClick={() => onSelectComponent(comp.id)}
            >
              <CardContent className="pt-5 pb-4 px-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-base font-semibold text-[hsl(222,47%,11%)] group-hover:text-indigo-600 transition-colors">{comp.name}</h3>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${statusColor[comp.status] || ''}`}>
                    {comp.status}
                  </span>
                </div>
                <p className="text-sm text-[hsl(215,16%,47%)] leading-relaxed mb-3 line-clamp-2">{comp.description}</p>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px] capitalize">{comp.category}</Badge>
                  <span className="text-[10px] text-[hsl(215,16%,47%)]">{Array.isArray(comp.variants) ? comp.variants.length : 0} variants</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <p className="text-sm text-[hsl(215,16%,47%)] text-center">
        Showing {filtered.length} of {safeComponents.length} components
      </p>
    </div>
  )
}
