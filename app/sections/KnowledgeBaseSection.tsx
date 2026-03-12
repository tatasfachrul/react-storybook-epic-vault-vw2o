'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useRAGKnowledgeBase, validateFile } from '@/lib/ragKnowledgeBase'
import { HiOutlineDocumentText, HiOutlineTrash, HiOutlineArrowUpTray, HiOutlineExclamationCircle } from 'react-icons/hi2'

const RAG_ID = '69b23860cc96ef3cace6280f'

export default function KnowledgeBaseSection() {
  const { documents, loading, error, fetchDocuments, uploadDocument, removeDocuments } = useRAGKnowledgeBase()
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchDocuments(RAG_ID)
  }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadError(null)
    setUploadSuccess(null)

    const validation = validateFile(file)
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid file type')
      return
    }

    const result = await uploadDocument(RAG_ID, file)
    if (result.success) {
      setUploadSuccess(`"${file.name}" uploaded and trained successfully.`)
      setTimeout(() => setUploadSuccess(null), 4000)
    } else {
      setUploadError(result.error || 'Upload failed')
    }

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDelete = async (fileName: string) => {
    const result = await removeDocuments(RAG_ID, [fileName])
    if (result.success) {
      setDeleteConfirm(null)
    } else {
      setUploadError(result.error || 'Delete failed')
    }
  }

  const safeDocs = Array.isArray(documents) ? documents : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[hsl(222,47%,11%)]">Knowledge Base</h1>
        <p className="text-sm text-[hsl(215,16%,47%)] mt-1 leading-relaxed">Manage documents that power the AI Component Assistant</p>
      </div>

      <Card className="bg-[hsl(0,0%,98%)]/75 backdrop-blur-[16px] border border-white/[0.18] rounded-[0.875rem] shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-[hsl(222,47%,11%)]">Documents</CardTitle>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleUpload}
                className="hidden"
                id="kb-upload"
              />
              <Button
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="bg-[hsl(222,47%,11%)] hover:bg-[hsl(222,47%,20%)] rounded-lg text-xs"
              >
                <HiOutlineArrowUpTray className="h-3.5 w-3.5 mr-1" />
                Upload Document
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {uploadError && (
            <div className="mb-3 flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <HiOutlineExclamationCircle className="h-4 w-4 shrink-0" />
              {uploadError}
            </div>
          )}
          {uploadSuccess && (
            <div className="mb-3 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
              {uploadSuccess}
            </div>
          )}

          {loading && safeDocs.length === 0 ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-3 w-40" />
                    <Skeleton className="h-2 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : safeDocs.length === 0 ? (
            <div className="text-center py-8">
              <HiOutlineDocumentText className="h-10 w-10 text-[hsl(215,16%,47%)] mx-auto mb-2 opacity-40" />
              <p className="text-sm text-[hsl(222,47%,11%)] font-medium">No documents yet</p>
              <p className="text-xs text-[hsl(215,16%,47%)] mt-1">Upload PDF, DOCX, or TXT files to train the assistant</p>
            </div>
          ) : (
            <div className="space-y-1">
              {safeDocs.map((doc, idx) => (
                <React.Fragment key={doc?.fileName ?? idx}>
                  <div className="flex items-center justify-between py-2.5 px-2 rounded-lg hover:bg-white/40 transition-colors group">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-1.5 rounded bg-indigo-50">
                        <HiOutlineDocumentText className="h-4 w-4 text-indigo-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-[hsl(222,47%,11%)] truncate">{doc?.fileName ?? 'Unknown'}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="outline" className="text-[9px] capitalize">{doc?.fileType ?? 'file'}</Badge>
                          {doc?.status && (
                            <span className={`text-[9px] ${doc.status === 'active' ? 'text-emerald-600' : doc.status === 'processing' ? 'text-amber-600' : 'text-red-600'}`}>
                              {doc.status}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {deleteConfirm === doc?.fileName ? (
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="destructive" className="h-6 text-[10px] rounded" onClick={() => handleDelete(doc.fileName)}>
                          Confirm
                        </Button>
                        <Button size="sm" variant="ghost" className="h-6 text-[10px] rounded" onClick={() => setDeleteConfirm(null)}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(doc?.fileName ?? null)}
                        className="p-1.5 rounded hover:bg-red-50 text-[hsl(215,16%,47%)] hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <HiOutlineTrash className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  {idx < safeDocs.length - 1 && <Separator className="my-0" />}
                </React.Fragment>
              ))}
            </div>
          )}

          {error && (
            <div className="mt-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <p className="text-[10px] text-[hsl(215,16%,47%)] mt-4">
            Supported formats: PDF, DOCX, TXT. Documents are processed and used to enhance AI assistant responses.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
