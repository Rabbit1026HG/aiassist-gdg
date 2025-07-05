export class SpeechService {
  private static instance: SpeechService
  private baseUrl: string

  private constructor() {
    this.baseUrl = typeof window !== "undefined" ? window.location.origin : ""
  }

  static getInstance(): SpeechService {
    if (!SpeechService.instance) {
      SpeechService.instance = new SpeechService()
    }
    return SpeechService.instance
  }

  async transcribeAudio(audioBlob: Blob): Promise<string> {
    try {
      const formData = new FormData()

      // Create a proper file name with extension based on blob type
      const fileExtension = this.getFileExtension(audioBlob.type)
      const fileName = `recording_${Date.now()}.${fileExtension}`

      formData.append("audio", audioBlob, fileName)

      const response = await fetch(`${this.baseUrl}/api/speech`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Transcription failed")
      }

      return data.text || ""
    } catch (error) {
      console.error("Transcription error:", error)
      throw error instanceof Error ? error : new Error("Failed to transcribe audio")
    }
  }

  private getFileExtension(mimeType: string): string {
    const mimeToExt: Record<string, string> = {
      "audio/webm": "webm",
      "audio/webm;codecs=opus": "webm",
      "audio/mp4": "mp4",
      "audio/mpeg": "mp3",
      "audio/wav": "wav",
      "audio/ogg": "ogg",
    }

    return mimeToExt[mimeType] || "webm"
  }

  async checkBrowserSupport(): Promise<{
    mediaRecorder: boolean
    getUserMedia: boolean
    permissions: boolean
  }> {
    return {
      mediaRecorder: typeof MediaRecorder !== "undefined",
      getUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      permissions: "permissions" in navigator,
    }
  }
}
