export async function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'metadata'

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src)
      resolve(video.duration)
    }

    video.onerror = () => {
      URL.revokeObjectURL(video.src)
      reject(new Error('Erro ao carregar video'))
    }

    video.src = URL.createObjectURL(file)
  })
}

export async function generateThumbnail(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'auto'
    video.muted = true
    video.playsInline = true

    video.onloadeddata = () => {
      // Seek to 0.1s to avoid black first frames
      video.currentTime = 0.1
    }

    video.onseeked = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = 540
        canvas.height = 960

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          URL.revokeObjectURL(video.src)
          reject(new Error('Erro ao criar canvas'))
          return
        }

        // Draw video frame scaled/cropped to 9:16
        const videoRatio = video.videoWidth / video.videoHeight
        const targetRatio = 9 / 16

        let sx = 0, sy = 0, sw = video.videoWidth, sh = video.videoHeight

        if (videoRatio > targetRatio) {
          // Video is wider than target - crop sides
          sw = video.videoHeight * targetRatio
          sx = (video.videoWidth - sw) / 2
        } else {
          // Video is taller than target - crop top/bottom
          sh = video.videoWidth / targetRatio
          sy = (video.videoHeight - sh) / 2
        }

        ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(video.src)
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Erro ao gerar thumbnail'))
            }
          },
          'image/jpeg',
          0.85
        )
      } catch (err) {
        URL.revokeObjectURL(video.src)
        reject(err)
      }
    }

    video.onerror = () => {
      URL.revokeObjectURL(video.src)
      reject(new Error('Erro ao carregar video'))
    }

    video.src = URL.createObjectURL(file)
  })
}
