'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { HiOutlineCube, HiOutlineCheckCircle, HiOutlineBeaker, HiOutlineSparkles } from 'react-icons/hi2'

interface ComponentItem {
  id: string
  name: string
  description: string
  category: 'basic' | 'complex' | 'layout' | 'domain'
  status: 'stable' | 'beta' | 'new'
}

interface Category {
  id: string
  name: string
  description: string
  count: number
}

interface DashboardSectionProps {
  components: ComponentItem[]
  categories: Category[]
  onSelectCategory: (categoryId: string) => void
  onSelectComponent: (componentId: string) => void
}

const statusColor: Record<string, string> = {
  stable: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  beta: 'bg-amber-100 text-amber-700 border-amber-200',
  new: 'bg-sky-100 text-sky-700 border-sky-200',
}

const categoryIcons: Record<string, React.ReactNode> = {
  basic: <HiOutlineCube className="h-6 w-6 text-indigo-500" />,
  complex: <HiOutlineBeaker className="h-6 w-6 text-violet-500" />,
  layout: <HiOutlineCheckCircle className="h-6 w-6 text-teal-500" />,
  domain: <HiOutlineSparkles className="h-6 w-6 text-rose-500" />,
}

export default function DashboardSection({
  components,
  categories,
  onSelectCategory,
  onSelectComponent,
}: DashboardSectionProps) {
  const safeComponents = Array.isArray(components) ? components : []
  const safeCategories = Array.isArray(categories) ? categories : []

  const totalCount = safeComponents.length
  const stableCount = safeComponents.filter(c => c.status === 'stable').length
  const betaCount = safeComponents.filter(c => c.status === 'beta').length
  const newCount = safeComponents.filter(c => c.status === 'new').length

  const recentComponents = safeComponents.slice(0, 5)

  const stats = [
    { label: 'Total Components', value: totalCount, color: 'text-[hsl(222,47%,11%)]', bgColor: 'bg-slate-100' },
    { label: 'Stable', value: stableCount, color: 'text-emerald-700', bgColor: 'bg-emerald-50' },
    { label: 'Beta', value: betaCount, color: 'text-amber-700', bgColor: 'bg-amber-50' },
    { label: 'New', value: newCount, color: 'text-sky-700', bgColor: 'bg-sky-50' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[hsl(222,47%,11%)]">Dashboard</h1>
        <p className="text-sm text-[hsl(215,16%,47%)] mt-1 leading-relaxed">Overview of your component library</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-[hsl(0,0%,98%)]/75 backdrop-blur-[16px] border border-white/[0.18] rounded-[0.875rem] shadow-md">
            <CardContent className="pt-5 pb-4 px-5">
              <p className="text-xs font-medium text-[hsl(215,16%,47%)] uppercase tracking-wide">{stat.label}</p>
              <p className={`text-3xl font-semibold mt-1 ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-semibold text-[hsl(222,47%,11%)]">Categories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {safeCategories.map((cat) => (
              <Card
                key={cat.id}
                className="bg-[hsl(0,0%,98%)]/75 backdrop-blur-[16px] border border-white/[0.18] rounded-[0.875rem] shadow-md cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
                onClick={() => onSelectCategory(cat.id)}
              >
                <CardContent className="pt-5 pb-4 px-5">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-white/60">
                      {categoryIcons[cat.id] || <HiOutlineCube className="h-6 w-6 text-slate-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-[hsl(222,47%,11%)]">{cat.name}</h3>
                        <Badge variant="secondary" className="text-xs">{cat.count}</Badge>
                      </div>
                      <p className="text-xs text-[hsl(215,16%,47%)] mt-1 leading-relaxed">{cat.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-base font-semibold text-[hsl(222,47%,11%)]">Recently Updated</h2>
          <Card className="bg-[hsl(0,0%,98%)]/75 backdrop-blur-[16px] border border-white/[0.18] rounded-[0.875rem] shadow-md">
            <CardContent className="p-0">
              {recentComponents.map((comp, idx) => (
                <React.Fragment key={comp.id}>
                  <button
                    className="w-full text-left px-4 py-3 hover:bg-white/40 transition-colors flex items-center justify-between"
                    onClick={() => onSelectComponent(comp.id)}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[hsl(222,47%,11%)] truncate">{comp.name}</p>
                      <p className="text-xs text-[hsl(215,16%,47%)] truncate">{comp.category}</p>
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${statusColor[comp.status] || ''}`}>
                      {comp.status}
                    </span>
                  </button>
                  {idx < recentComponents.length - 1 && <Separator />}
                </React.Fragment>
              ))}
            </CardContent>
          </Card>

          <h2 className="text-base font-semibold text-[hsl(222,47%,11%)] pt-2">Getting Started</h2>
          <Card className="bg-[hsl(0,0%,98%)]/75 backdrop-blur-[16px] border border-white/[0.18] rounded-[0.875rem] shadow-md">
            <CardContent className="pt-5 pb-4 px-5 space-y-3">
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold shrink-0">1</span>
                <p className="text-sm text-[hsl(215,16%,47%)] leading-relaxed">Browse components by category or search</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold shrink-0">2</span>
                <p className="text-sm text-[hsl(215,16%,47%)] leading-relaxed">Preview variants and customize props in the detail view</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold shrink-0">3</span>
                <p className="text-sm text-[hsl(215,16%,47%)] leading-relaxed">Copy the generated code snippet for your project</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold shrink-0">4</span>
                <p className="text-sm text-[hsl(215,16%,47%)] leading-relaxed">Ask the AI assistant for guidance and best practices</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
