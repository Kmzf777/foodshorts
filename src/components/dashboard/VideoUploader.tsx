'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, Play, Pause, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getVideoDuration, generateThumbnail } from '@/lib/video-processor'
import { VIDEO_CONSTRAINTS } from '@/lib/constants'

interface VideoUploaderProps {
  value?: string | null
  onChange: (videoBlob: Blob, thumbnailBlob: Blob, duration: number) => void
  disabled?: boolean
}

export function VideoUploader({ value, onChange, disabled }: VideoUploaderProps) {
  const [preview, setPreview] = useState<string | null>(value || null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback(async (file: File) => {
    setError(null)

    // Validar tipo
    if (!file.type.startsWith('video/')) {
      setError('Selecione um arquivo de video')
      return
    }

    // Validar tamanho
    if (file.size > VIDEO_CONSTRAINTS.MAX_SIZE_MB * 1024 * 1024) {
      setError(`Tamanho maximo: ${VIDEO_CONSTRAINTS.MAX_SIZE_MB}MB`)
      return
    }

    try {
      setIsProcessing(true)

      // Obter duracao
      const duration = await getVideoDuration(file)

      if (duration > VIDEO_CONSTRAINTS.MAX_DURATION) {
        setError(`Video muito longo (${Math.round(duration)}s). Maximo: ${VIDEO_CONSTRAINTS.MAX_DURATION}s`)
        setIsProcessing(false)
        return
      }

      // Gerar thumbnail usando canvas
      const thumbnail = await generateThumbnail(file)

      onChange(file, thumbnail, Math.round(duration))
      setPreview(URL.createObjectURL(file))
      setIsProcessing(false)
    } catch (err) {
      console.error('Erro ao processar video:', err)
      setError('Erro ao processar video')
      setIsProcessing(false)
    }
  }, [onChange])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (file) handleFileSelect(file)
    },
    [handleFileSelect]
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
  }

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const removeVideo = () => {
    setPreview(null)
    setIsPlaying(false)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleInputChange}
        disabled={disabled || isProcessing}
      />

      {preview ? (
        <div className="relative aspect-[9/16] max-w-[200px] bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            src={preview}
            className="w-full h-full object-cover"
            loop
            muted
            playsInline
            onEnded={() => setIsPlaying(false)}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="bg-black/50 hover:bg-black/70 text-white"
              onClick={togglePlay}
            >
              {isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6" />
              )}
            </Button>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white h-8 w-8"
            onClick={removeVideo}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
            'hover:border-primary hover:bg-accent/50',
            isProcessing && 'pointer-events-none opacity-50'
          )}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
        >
          {isProcessing ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Processando video...
              </p>
            </div>
          ) : (
            <>
              <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="mt-2 text-sm font-medium">
                Arraste um video ou clique para selecionar
              </p>
              <p className="text-xs text-muted-foreground">
                Max {VIDEO_CONSTRAINTS.MAX_DURATION}s, {VIDEO_CONSTRAINTS.MAX_SIZE_MB}MB
              </p>
            </>
          )}
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
