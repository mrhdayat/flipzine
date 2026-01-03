'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { createClient } from '@/lib/supabase/client'
import { Upload, FileImage, FileText, X, GripVertical } from 'lucide-react'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { processPDF, compressImage } from '@/lib/utils/pdf-processor'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface Page {
  id: string
  page_number: number
  image_url: string
}

interface PageManagerProps {
  magazineId: string
  onPagesChange?: () => void
}

export default function PageManager({ magazineId, onPagesChange }: PageManagerProps) {
  const [pages, setPages] = useState<Page[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Load existing pages
  const loadPages = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('pages')
      .select('*')
      .eq('magazine_id', magazineId)
      .order('page_number')

    if (data) {
      setPages(data)
      onPagesChange?.()
    }
  }

  useState(() => {
    loadPages()
  })

  // Handle file drop
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsUploading(true)
    setUploadProgress('Processing files...')

    try {
      const supabase = createClient()
      const newPages: Page[] = []

      for (const file of acceptedFiles) {
        if (file.type === 'application/pdf') {
          // Process PDF
          setUploadProgress(`Processing PDF: ${file.name}`)
          const pdfPages = await processPDF(file)

          for (const pdfPage of pdfPages) {
            setUploadProgress(`Uploading page ${pdfPage.pageNumber}/${pdfPages.length}`)

            // Upload to Supabase Storage
            const fileName = `${magazineId}/${Date.now()}-page-${pdfPage.pageNumber}.jpg`
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('magazine-pages')
              .upload(fileName, pdfPage.blob, {
                contentType: 'image/jpeg',
              })

            if (uploadError) throw uploadError

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
              .from('magazine-pages')
              .getPublicUrl(fileName)

            // Insert page record
            const { data: pageData, error: pageError } = await supabase
              .from('pages')
              .insert({
                magazine_id: magazineId,
                page_number: pages.length + newPages.length + 1,
                image_url: publicUrl,
              })
              .select()
              .single()

            if (pageError) throw pageError
            newPages.push(pageData)
          }
        } else if (file.type.startsWith('image/')) {
          // Process image
          setUploadProgress(`Compressing: ${file.name}`)
          const compressed = await compressImage(file)

          setUploadProgress(`Uploading: ${file.name}`)
          const fileName = `${magazineId}/${Date.now()}-${file.name}`
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('magazine-pages')
            .upload(fileName, compressed, {
              contentType: 'image/jpeg',
            })

          if (uploadError) throw uploadError

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('magazine-pages')
            .getPublicUrl(fileName)

          // Insert page record
          const { data: pageData, error: pageError } = await supabase
            .from('pages')
            .insert({
              magazine_id: magazineId,
              page_number: pages.length + newPages.length + 1,
              image_url: publicUrl,
            })
            .select()
            .single()

          if (pageError) throw pageError
          newPages.push(pageData)
        }
      }

      setPages([...pages, ...newPages])
      setUploadProgress('')
    } catch (error) {
      console.error('Upload error:', error)
      setUploadProgress('Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }, [magazineId, pages])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    disabled: isUploading,
  })

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = pages.findIndex((p) => p.id === active.id)
      const newIndex = pages.findIndex((p) => p.id === over.id)

      const newPages = arrayMove(pages, oldIndex, newIndex)
      setPages(newPages)

      // Update page numbers in database
      const supabase = createClient()
      for (let i = 0; i < newPages.length; i++) {
        await supabase
          .from('pages')
          .update({ page_number: i + 1 })
          .eq('id', newPages[i].id)
      }
    }
  }

  // Delete page
  const deletePage = async (page: Page) => {
    const supabase = createClient()

    // Delete from storage
    const urlParts = page.image_url.split('/')
    const fileName = urlParts.slice(-2).join('/')
    await supabase.storage.from('magazine-pages').remove([fileName])

    // Delete from database
    await supabase.from('pages').delete().eq('id', page.id)

    // Reload pages
    loadPages()
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
          transition-all duration-200
          ${isDragActive
            ? 'border-primary bg-primary/10'
            : 'border-border hover:border-primary/50 hover:bg-card-hover'
          }
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          {isUploading ? (
            <>
              <LoadingSpinner size="lg" />
              <p className="text-muted">{uploadProgress}</p>
            </>
          ) : (
            <>
              <div className="flex gap-4">
                <FileText className="w-12 h-12 text-primary" />
                <FileImage className="w-12 h-12 text-secondary" />
              </div>
              <div>
                <p className="text-lg font-semibold mb-1">
                  {isDragActive ? 'Drop files here' : 'Upload PDF or Images'}
                </p>
                <p className="text-sm text-muted">
                  Drag & drop or click to select • PDF, JPG, PNG
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Pages List */}
      {pages.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Pages ({pages.length})</h3>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={pages.map((p) => p.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {pages.map((page) => (
                  <SortablePageItem
                    key={page.id}
                    page={page}
                    onDelete={() => deletePage(page)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  )
}

function SortablePageItem({ page, onDelete }: { page: Page; onDelete: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: page.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-4 p-4 glass rounded-lg hover:bg-card-hover"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted hover:text-foreground"
      >
        <GripVertical className="w-5 h-5" />
      </button>

      <div className="w-16 h-20 bg-card rounded overflow-hidden flex-shrink-0">
        <img
          src={page.image_url}
          alt={`Page ${page.page_number}`}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1">
        <p className="font-medium">Page {page.page_number}</p>
      </div>

      <Button variant="destructive" size="sm" onClick={onDelete}>
        <X className="w-4 h-4" />
      </Button>
    </div>
  )
}
