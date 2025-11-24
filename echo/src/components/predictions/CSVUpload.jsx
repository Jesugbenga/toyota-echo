'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Loader2, X, FileCheck } from 'lucide-react'

export default function CSVUpload({ onUploadSuccess }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [fileName, setFileName] = useState(null)

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0]
    if (!file) return

    setFileName(file.name)
    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Upload failed')
      }

      const data = await response.json()
      onUploadSuccess(data)
    } catch (err) {
      setError(err.message)
      console.error('Upload error:', err)
    } finally {
      setUploading(false)
    }
  }, [onUploadSuccess])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv'],
    },
    maxFiles: 1,
  })

  const handleRemove = () => {
    setFileName(null)
    setError(null)
  }

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="text-sm font-orbitron text-white uppercase tracking-wider mb-1">
          Upload Telemetry Data
        </h3>
        <p className="text-xs text-gray-400">
          Drag and drop CSV file or click to browse
        </p>
      </div>

      {!fileName ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            isDragActive
              ? 'border-f1-red bg-f1-red/10'
              : 'border-white/20 hover:border-f1-red/50 hover:bg-white/5'
          }`}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <div className="flex flex-col items-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-f1-red" />
              <span className="text-sm text-gray-300 font-orbitron">Processing...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-3">
              <div className="w-16 h-16 rounded-lg bg-f1-red/20 flex items-center justify-center border border-f1-red/30">
                <Upload className="w-8 h-8 text-f1-red" />
              </div>
              <div>
                <span className="text-f1-red font-orbitron">Click to upload</span>
                <span className="text-gray-400"> or drag and drop</span>
              </div>
              <p className="text-xs text-gray-500 max-w-md">
                CSV files only. Required: accx_can, accy_can, ath, pbrake_r, pbrake_f, gear, Steering_Angle, Speed
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-f1-dark/50 rounded-xl p-4 flex items-center justify-between border border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-f1-accent/20 flex items-center justify-center border border-f1-accent/30">
              <FileCheck className="w-5 h-5 text-f1-accent" />
            </div>
            <div>
              <div className="text-xs font-orbitron text-white uppercase tracking-wider mb-1">
                File Ready
              </div>
              <div className="text-xs text-gray-400">{fileName}</div>
            </div>
          </div>
          <button
            onClick={handleRemove}
            className="w-8 h-8 rounded-lg bg-f1-red/20 hover:bg-f1-red/30 border border-f1-red/30 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-f1-red" />
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
          <p className="text-xs text-red-300 font-orbitron">{error}</p>
        </div>
      )}
    </div>
  )
}
