'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { copyToClipboard } from '@/lib/clipboard'
import { HiOutlineChevronRight, HiOutlineClipboardDocument, HiOutlineCheckCircle, HiOutlineArrowLeft } from 'react-icons/hi2'
import { TbSun, TbMoon, TbGridDots } from 'react-icons/tb'

interface PropItem {
  name: string
  type: string
  default: string
  required: boolean
  description: string
}

interface ComponentItem {
  id: string
  name: string
  description: string
  category: 'basic' | 'complex' | 'layout' | 'domain'
  status: 'stable' | 'beta' | 'new'
  props: PropItem[]
  variants: string[]
  code: string
  guidelines: string
  accessibility: string
  relatedComponents: string[]
}

interface DetailSectionProps {
  component: ComponentItem | null
  onBack: () => void
  onNavigateToComponent: (componentId: string) => void
  allComponents: ComponentItem[]
}

const statusColor: Record<string, string> = {
  stable: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  beta: 'bg-amber-100 text-amber-700 border-amber-200',
  new: 'bg-sky-100 text-sky-700 border-sky-200',
}

const categoryLabels: Record<string, string> = {
  basic: 'Basic UI',
  complex: 'Complex',
  layout: 'Layout',
  domain: 'Domain',
}

export default function DetailSection({ component, onBack, onNavigateToComponent, allComponents }: DetailSectionProps) {
  const [canvasBg, setCanvasBg] = useState<'light' | 'dark' | 'grid'>('light')
  const [selectedVariant, setSelectedVariant] = useState(0)
  const [propValues, setPropValues] = useState<Record<string, string | boolean | number>>({})
  const [copied, setCopied] = useState(false)

  const comp = component
  const safeProps = Array.isArray(comp?.props) ? comp.props : []
  const safeVariants = Array.isArray(comp?.variants) ? comp.variants : []
  const safeRelated = Array.isArray(comp?.relatedComponents) ? comp.relatedComponents : []

  React.useEffect(() => {
    if (comp) {
      const defaults: Record<string, string | boolean | number> = {}
      safeProps.forEach(p => {
        if (p.type === 'boolean') defaults[p.name] = p.default === 'true'
        else if (p.type === 'number') defaults[p.name] = Number(p.default) || 0
        else defaults[p.name] = p.default || ''
      })
      if (safeVariants.length > 0) defaults['variant'] = safeVariants[0]
      setPropValues(defaults)
      setSelectedVariant(0)
    }
  }, [comp?.id])

  const handlePropChange = useCallback((propName: string, value: string | boolean | number) => {
    setPropValues(prev => ({ ...prev, [propName]: value }))
  }, [])

  const currentCode = useMemo(() => {
    if (!comp) return ''
    let code = comp.code || `<${comp.name} />`
    const propStrings: string[] = []
    Object.entries(propValues).forEach(([key, val]) => {
      if (key === 'children') return
      if (typeof val === 'boolean') { if (val) propStrings.push(key); else propStrings.push(`${key}={false}`) }
      else if (typeof val === 'number') propStrings.push(`${key}={${val}}`)
      else if (val && val !== '' && val !== 'default') propStrings.push(`${key}="${val}"`)
    })
    const propsStr = propStrings.length > 0 ? ' ' + propStrings.join(' ') : ''
    const childrenVal = typeof propValues['children'] === 'string' ? propValues['children'] : comp.name
    code = `<${comp.name}${propsStr}>${childrenVal}</${comp.name}>`
    return code
  }, [comp, propValues])

  const handleCopy = useCallback(async () => {
    const ok = await copyToClipboard(currentCode)
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2000) }
  }, [currentCode])

  const canvasBgClass = canvasBg === 'light' ? 'bg-white' : canvasBg === 'dark' ? 'bg-slate-900' : 'bg-white bg-[url(\'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAyMCAwIEwgMCAwIDAgMjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2UyZThmMCIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+\')]'

  if (!comp) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-[hsl(215,16%,47%)]">Select a component to view its details</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs text-[hsl(215,16%,47%)]">
        <button onClick={onBack} className="flex items-center gap-1 hover:text-[hsl(222,47%,11%)] transition-colors">
          <HiOutlineArrowLeft className="h-3.5 w-3.5" />
          <span>Catalog</span>
        </button>
        <HiOutlineChevronRight className="h-3 w-3" />
        <span className="capitalize">{categoryLabels[comp.category] ?? comp.category}</span>
        <HiOutlineChevronRight className="h-3 w-3" />
        <span className="text-[hsl(222,47%,11%)] font-medium">{comp.name}</span>
      </div>

      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-[hsl(222,47%,11%)]">{comp.name}</h1>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${statusColor[comp.status] || ''}`}>{comp.status}</span>
          </div>
          <p className="text-sm text-[hsl(215,16%,47%)] mt-1 leading-relaxed">{comp.description}</p>
        </div>
      </div>

      {safeVariants.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {safeVariants.map((v, i) => (
            <button
              key={v}
              onClick={() => { setSelectedVariant(i); handlePropChange('variant', v) }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${selectedVariant === i ? 'bg-[hsl(222,47%,11%)] text-white border-[hsl(222,47%,11%)]' : 'bg-white/60 text-[hsl(215,16%,47%)] border-[hsl(214,32%,91%)] hover:bg-white/80'}`}
            >
              {v}
            </button>
          ))}
        </div>
      )}

      <Card className="bg-[hsl(0,0%,98%)]/75 backdrop-blur-[16px] border border-white/[0.18] rounded-[0.875rem] shadow-md overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-[hsl(214,32%,91%)] bg-white/40">
          <span className="text-xs font-medium text-[hsl(215,16%,47%)]">Preview</span>
          <div className="flex gap-1">
            <button onClick={() => setCanvasBg('light')} className={`p-1.5 rounded ${canvasBg === 'light' ? 'bg-[hsl(214,32%,91%)]' : 'hover:bg-white/60'}`}><TbSun className="h-3.5 w-3.5 text-[hsl(215,16%,47%)]" /></button>
            <button onClick={() => setCanvasBg('dark')} className={`p-1.5 rounded ${canvasBg === 'dark' ? 'bg-[hsl(214,32%,91%)]' : 'hover:bg-white/60'}`}><TbMoon className="h-3.5 w-3.5 text-[hsl(215,16%,47%)]" /></button>
            <button onClick={() => setCanvasBg('grid')} className={`p-1.5 rounded ${canvasBg === 'grid' ? 'bg-[hsl(214,32%,91%)]' : 'hover:bg-white/60'}`}><TbGridDots className="h-3.5 w-3.5 text-[hsl(215,16%,47%)]" /></button>
          </div>
        </div>
        <div className={`${canvasBgClass} p-8 min-h-[200px] flex items-center justify-center transition-colors duration-200`}>
          <ComponentPreview name={comp.name} propValues={propValues} variant={safeVariants[selectedVariant] ?? 'default'} isDark={canvasBg === 'dark'} />
        </div>
      </Card>

      <Tabs defaultValue="controls" className="w-full">
        <TabsList className="bg-white/60 border border-[hsl(214,32%,91%)] rounded-lg p-1">
          <TabsTrigger value="controls" className="text-xs rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Controls</TabsTrigger>
          <TabsTrigger value="code" className="text-xs rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Code</TabsTrigger>
          <TabsTrigger value="props" className="text-xs rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Props</TabsTrigger>
          <TabsTrigger value="guidelines" className="text-xs rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Guidelines</TabsTrigger>
        </TabsList>

        <TabsContent value="controls" className="mt-4">
          <Card className="bg-[hsl(0,0%,98%)]/75 backdrop-blur-[16px] border border-white/[0.18] rounded-[0.875rem] shadow-md">
            <CardContent className="pt-5 pb-4 px-5 space-y-4">
              {safeProps.length === 0 ? (
                <p className="text-xs text-[hsl(215,16%,47%)]">No configurable props</p>
              ) : (
                safeProps.map((prop) => (
                  <div key={prop.name} className="flex items-center gap-4">
                    <label className="text-xs font-medium text-[hsl(222,47%,11%)] w-28 shrink-0">{prop.name}{prop.required && <span className="text-red-500 ml-0.5">*</span>}</label>
                    {prop.type === 'boolean' ? (
                      <Switch checked={!!propValues[prop.name]} onCheckedChange={(v) => handlePropChange(prop.name, v)} />
                    ) : prop.type.includes('|') ? (
                      <Select value={String(propValues[prop.name] ?? prop.default)} onValueChange={(v) => handlePropChange(prop.name, v)}>
                        <SelectTrigger className="h-8 text-xs flex-1 bg-white/60 border-[hsl(214,32%,91%)] rounded-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {prop.type.split('|').map(o => o.trim().replace(/'/g, '')).map(opt => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : prop.type === 'number' ? (
                      <Input type="number" value={String(propValues[prop.name] ?? '')} onChange={(e) => handlePropChange(prop.name, Number(e.target.value))} className="h-8 text-xs flex-1 bg-white/60 border-[hsl(214,32%,91%)] rounded-lg" />
                    ) : (
                      <Input value={String(propValues[prop.name] ?? '')} onChange={(e) => handlePropChange(prop.name, e.target.value)} placeholder={prop.default || prop.name} className="h-8 text-xs flex-1 bg-white/60 border-[hsl(214,32%,91%)] rounded-lg" />
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="code" className="mt-4">
          <Card className="bg-[hsl(0,0%,98%)]/75 backdrop-blur-[16px] border border-white/[0.18] rounded-[0.875rem] shadow-md overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-[hsl(214,32%,91%)] bg-white/40">
              <span className="text-xs font-medium text-[hsl(215,16%,47%)]">Generated Code</span>
              <button onClick={handleCopy} className="flex items-center gap-1 text-xs text-[hsl(215,16%,47%)] hover:text-[hsl(222,47%,11%)] transition-colors">
                {copied ? <><HiOutlineCheckCircle className="h-3.5 w-3.5 text-emerald-600" /><span className="text-emerald-600">Copied</span></> : <><HiOutlineClipboardDocument className="h-3.5 w-3.5" /><span>Copy</span></>}
              </button>
            </div>
            <div className="bg-slate-900 p-4">
              <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">{currentCode}</pre>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="props" className="mt-4">
          <Card className="bg-[hsl(0,0%,98%)]/75 backdrop-blur-[16px] border border-white/[0.18] rounded-[0.875rem] shadow-md overflow-hidden">
            <ScrollArea className="w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs font-semibold">Name</TableHead>
                    <TableHead className="text-xs font-semibold">Type</TableHead>
                    <TableHead className="text-xs font-semibold">Default</TableHead>
                    <TableHead className="text-xs font-semibold w-16">Required</TableHead>
                    <TableHead className="text-xs font-semibold">Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {safeProps.map((prop) => (
                    <TableRow key={prop.name}>
                      <TableCell className="text-xs font-mono text-indigo-600">{prop.name}</TableCell>
                      <TableCell className="text-xs font-mono text-[hsl(215,16%,47%)]">{prop.type}</TableCell>
                      <TableCell className="text-xs font-mono">{prop.default || '-'}</TableCell>
                      <TableCell className="text-xs">{prop.required ? <Badge variant="secondary" className="text-[9px] bg-red-50 text-red-600">Yes</Badge> : <span className="text-[hsl(215,16%,47%)]">No</span>}</TableCell>
                      <TableCell className="text-xs text-[hsl(215,16%,47%)] leading-relaxed">{prop.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </Card>
        </TabsContent>

        <TabsContent value="guidelines" className="mt-4">
          <Card className="bg-[hsl(0,0%,98%)]/75 backdrop-blur-[16px] border border-white/[0.18] rounded-[0.875rem] shadow-md">
            <CardContent className="pt-5 pb-4 px-5 space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-[hsl(222,47%,11%)] mb-2">Usage Guidelines</h3>
                <div className="text-xs text-[hsl(215,16%,47%)] leading-relaxed whitespace-pre-line">{comp.guidelines || 'No guidelines available.'}</div>
              </div>
              <Separator />
              <div>
                <h3 className="text-sm font-semibold text-[hsl(222,47%,11%)] mb-2">Accessibility</h3>
                <div className="text-xs text-[hsl(215,16%,47%)] leading-relaxed whitespace-pre-line">{comp.accessibility || 'No accessibility notes available.'}</div>
              </div>
              {safeRelated.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-semibold text-[hsl(222,47%,11%)] mb-2">Related Components</h3>
                    <div className="flex flex-wrap gap-2">
                      {safeRelated.map((r) => {
                        const found = Array.isArray(allComponents) ? allComponents.find(c => c.name === r) : null
                        return (
                          <button
                            key={r}
                            onClick={() => found ? onNavigateToComponent(found.id) : undefined}
                            className={`text-xs px-3 py-1 rounded-full border transition-colors ${found ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 cursor-pointer' : 'bg-slate-50 text-slate-500 border-slate-200 cursor-default'}`}
                          >
                            {r}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ComponentPreview({ name, propValues, variant, isDark }: { name: string; propValues: Record<string, string | boolean | number>; variant: string; isDark: boolean }) {
  const textColor = isDark ? 'text-white' : 'text-[hsl(222,47%,11%)]'
  const mutedColor = isDark ? 'text-slate-400' : 'text-[hsl(215,16%,47%)]'
  const borderColor = isDark ? 'border-slate-600' : 'border-[hsl(214,32%,91%)]'
  const children = typeof propValues['children'] === 'string' && propValues['children'] ? propValues['children'] : name
  const disabled = !!propValues['disabled']
  const size = String(propValues['size'] || 'md')
  const sizeClasses = size === 'sm' ? 'px-3 py-1 text-xs' : size === 'lg' ? 'px-6 py-3 text-base' : 'px-4 py-2 text-sm'

  switch (name) {
    case 'Button': {
      const base = `${sizeClasses} rounded-lg font-medium transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`
      const variants: Record<string, string> = {
        primary: `${base} bg-indigo-600 text-white hover:bg-indigo-700`,
        secondary: `${base} bg-slate-100 text-slate-800 hover:bg-slate-200`,
        outline: `${base} bg-transparent border-2 border-indigo-600 text-indigo-600`,
        ghost: `${base} bg-transparent text-indigo-600 hover:bg-indigo-50`,
        destructive: `${base} bg-red-600 text-white hover:bg-red-700`,
      }
      return <button className={variants[variant] || variants.primary} disabled={disabled}>{propValues['loading'] ? 'Loading...' : children}</button>
    }
    case 'Input': {
      const type = String(propValues['type'] || 'text')
      return <input type={type} placeholder={String(propValues['placeholder'] || 'Enter text...')} disabled={disabled} className={`${sizeClasses} rounded-lg border ${borderColor} bg-transparent ${textColor} outline-none focus:ring-2 focus:ring-indigo-500 w-64 ${disabled ? 'opacity-50' : ''}`} readOnly />
    }
    case 'Badge': {
      const colors: Record<string, string> = { default: 'bg-slate-100 text-slate-700', success: 'bg-emerald-100 text-emerald-700', warning: 'bg-amber-100 text-amber-700', error: 'bg-red-100 text-red-700', info: 'bg-sky-100 text-sky-700' }
      return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[variant] || colors.default}`}>{children}</span>
    }
    case 'Avatar': {
      const sizeMap: Record<string, string> = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-lg' }
      return <div className={`${sizeMap[size] || sizeMap.md} rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold`}>{String(propValues['initials'] || 'AZ')}</div>
    }
    case 'Toggle': {
      const on = !!propValues['checked']
      return <div className={`w-11 h-6 rounded-full relative transition-colors ${on ? 'bg-indigo-600' : 'bg-slate-300'}`}><div className={`w-5 h-5 rounded-full bg-white shadow absolute top-0.5 transition-all ${on ? 'left-[22px]' : 'left-0.5'}`} /></div>
    }
    case 'Tooltip': {
      return (
        <div className="relative inline-block">
          <div className={`absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-slate-800 text-white text-xs whitespace-nowrap shadow-lg`}>
            {String(propValues['content'] || 'Tooltip text')}
            <div className="absolute left-1/2 -translate-x-1/2 top-full w-2 h-2 bg-slate-800 rotate-45 -mt-1" />
          </div>
          <button className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs">Hover me</button>
        </div>
      )
    }
    case 'DataTable': {
      return (
        <div className={`border ${borderColor} rounded-lg overflow-hidden w-80`}>
          <div className="grid grid-cols-3 gap-0">
            {['Name', 'Role', 'Status'].map(h => <div key={h} className={`px-3 py-2 text-xs font-semibold ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-50 text-slate-600'} border-b ${borderColor}`}>{h}</div>)}
            {[['Alice', 'Admin', 'Active'], ['Bob', 'User', 'Inactive']].map((row, i) => row.map((cell, j) => <div key={`${i}-${j}`} className={`px-3 py-2 text-xs ${textColor} border-b ${borderColor}`}>{cell}</div>))}
          </div>
        </div>
      )
    }
    case 'Select': {
      return <div className={`px-4 py-2 rounded-lg border ${borderColor} ${isDark ? 'bg-slate-800' : 'bg-white'} ${textColor} text-sm w-48 flex items-center justify-between`}><span>{String(propValues['placeholder'] || 'Select option...')}</span><span className={mutedColor}>v</span></div>
    }
    case 'DatePicker': {
      return <div className={`px-4 py-2 rounded-lg border ${borderColor} ${isDark ? 'bg-slate-800' : 'bg-white'} ${textColor} text-sm w-48 flex items-center justify-between`}><span className={mutedColor}>Pick a date...</span><span className={mutedColor}>cal</span></div>
    }
    case 'Combobox': {
      return <div className={`px-4 py-2 rounded-lg border ${borderColor} ${isDark ? 'bg-slate-800' : 'bg-white'} ${textColor} text-sm w-48`}><span className={mutedColor}>Search...</span></div>
    }
    case 'Card': {
      return (
        <div className={`rounded-xl border ${borderColor} ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-md w-64 overflow-hidden`}>
          <div className="px-4 py-3 border-b border-inherit"><p className={`text-sm font-semibold ${textColor}`}>{String(propValues['title'] || 'Card Title')}</p></div>
          <div className="px-4 py-3"><p className={`text-xs ${mutedColor}`}>Card content goes here with supporting text.</p></div>
        </div>
      )
    }
    case 'Dialog': {
      return (
        <div className={`rounded-xl border ${borderColor} ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-xl w-72 overflow-hidden`}>
          <div className="px-4 py-3 border-b border-inherit flex items-center justify-between"><p className={`text-sm font-semibold ${textColor}`}>{String(propValues['title'] || 'Dialog Title')}</p><span className={mutedColor}>x</span></div>
          <div className="px-4 py-4"><p className={`text-xs ${mutedColor}`}>Are you sure you want to continue?</p></div>
          <div className="px-4 py-3 border-t border-inherit flex justify-end gap-2"><button className="px-3 py-1 text-xs rounded bg-slate-100 text-slate-700">Cancel</button><button className="px-3 py-1 text-xs rounded bg-indigo-600 text-white">Confirm</button></div>
        </div>
      )
    }
    case 'Tabs': {
      return (
        <div className="w-64">
          <div className={`flex border-b ${borderColor} gap-0`}>
            {['Tab 1', 'Tab 2', 'Tab 3'].map((t, i) => <div key={t} className={`px-3 py-2 text-xs font-medium ${i === 0 ? `border-b-2 border-indigo-600 text-indigo-600` : mutedColor}`}>{t}</div>)}
          </div>
          <div className="py-3"><p className={`text-xs ${mutedColor}`}>Tab content area</p></div>
        </div>
      )
    }
    case 'UserProfile': {
      return (
        <div className={`rounded-xl border ${borderColor} ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-md w-64 p-4`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold text-sm">JD</div>
            <div><p className={`text-sm font-semibold ${textColor}`}>{String(propValues['name'] || 'Jane Doe')}</p><p className={`text-xs ${mutedColor}`}>{String(propValues['role'] || 'Product Designer')}</p></div>
          </div>
        </div>
      )
    }
    case 'PricingCard': {
      return (
        <div className={`rounded-xl border ${borderColor} ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-md w-56 p-5`}>
          <p className={`text-xs font-semibold ${mutedColor} uppercase tracking-wide`}>{String(propValues['tier'] || 'Pro')}</p>
          <p className={`text-2xl font-bold ${textColor} mt-1`}>${String(propValues['price'] || '29')}<span className={`text-xs ${mutedColor} font-normal`}>/mo</span></p>
          <div className="mt-3 space-y-1.5">{['Feature A', 'Feature B', 'Feature C'].map(f => <p key={f} className={`text-xs ${mutedColor}`}>{f}</p>)}</div>
          <button className="mt-4 w-full py-2 rounded-lg bg-indigo-600 text-white text-xs font-medium">Get Started</button>
        </div>
      )
    }
    case 'StatCard': {
      return (
        <div className={`rounded-xl border ${borderColor} ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-md w-48 p-4`}>
          <p className={`text-xs ${mutedColor} font-medium`}>{String(propValues['label'] || 'Revenue')}</p>
          <p className={`text-xl font-bold ${textColor} mt-1`}>{String(propValues['value'] || '$12,345')}</p>
          <p className="text-xs text-emerald-600 mt-1">{String(propValues['change'] || '+12.5%')}</p>
        </div>
      )
    }
    default:
      return <div className={`px-6 py-4 rounded-lg border ${borderColor} ${textColor} text-sm`}>{name} Preview</div>
  }
}
