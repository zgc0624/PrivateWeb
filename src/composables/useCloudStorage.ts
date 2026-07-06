import { storage, db } from '@/lib/cloudbase'
import { useAuth } from './useAuth'

export interface FileRecord {
  _id: string
  ownerId: string
  fileName: string
  fileSize: number
  fileURL: string
  cloudPath: string
  createdAt: number
}

export interface ShareRecord {
  _id: string
  fileId: string
  ownerId: string
  fileName: string
  fileSize: number
  fileURL: string
  cloudPath: string
  accessCode: string
  expiresAt: number
  maxDownloads: number
  downloadCount: number
  createdAt: number
}

export function useCloudStorage() {
  const { uid } = useAuth()

  function generateAccessCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let code = ''
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  async function uploadFile(file: File, onProgress?: (percent: number) => void): Promise<FileRecord> {
    const cloudPath = `files/${uid.value}/${Date.now()}_${file.name}`
    const result = await storage.uploadFile({
      cloudPath,
      fileContent: file,
      onUploadProgress: (progressEvent: any) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(percent)
        }
      }
    })

    if (result.fileID) {
      const fileURL = await storage.getTempFileURL({ fileList: [result.fileID] })
      const url = fileURL.fileList?.[0]?.tempFileURL || ''

      const record: FileRecord = {
        _id: '',
        ownerId: uid.value,
        fileName: file.name,
        fileSize: file.size,
        fileURL: url,
        cloudPath: result.fileID,
        createdAt: Date.now()
      }

      const addResult = await db.collection('files').add(record)
      if (addResult.id) {
        record._id = addResult.id
      }
      return record
    }

    throw new Error('上传失败')
  }

  async function getUserFiles(): Promise<FileRecord[]> {
    const result = await db.collection('files')
      .where({ ownerId: uid.value })
      .orderBy('createdAt', 'desc')
      .get()
    return result.data || []
  }

  async function deleteFile(fileId: string, cloudPath: string): Promise<void> {
    await storage.deleteFile({ fileList: [cloudPath] })
    await db.collection('files').doc(fileId).remove()
  }

  async function getFileURL(cloudPath: string): Promise<string> {
    const result = await storage.getTempFileURL({ fileList: [cloudPath] })
    return result.fileList?.[0]?.tempFileURL || ''
  }

  async function createShare(fileId: string, expiresDays: number, maxDownloads: number): Promise<ShareRecord> {
    const files = await db.collection('files').where({ _id: fileId }).get()
    const file = files.data?.[0]
    if (!file) throw new Error('文件不存在')

    const shareId = Math.random().toString(36).substring(2, 10)
    const accessCode = generateAccessCode()
    const expiresAt = expiresDays > 0 ? Date.now() + expiresDays * 86400000 : 0

    const record: ShareRecord = {
      _id: shareId,
      fileId: file._id,
      ownerId: file.ownerId,
      fileName: file.fileName,
      fileSize: file.fileSize,
      fileURL: file.fileURL,
      cloudPath: file.cloudPath,
      accessCode,
      expiresAt,
      maxDownloads,
      downloadCount: 0,
      createdAt: Date.now()
    }

    await db.collection('shares').add(record)
    return record
  }

  async function getShare(shareId: string): Promise<ShareRecord | null> {
    const result = await db.collection('shares').where({ _id: shareId }).get()
    return result.data?.[0] || null
  }

  async function verifyAndDownload(shareId: string, accessCode: string): Promise<{ url: string, fileName: string } | null> {
    const share = await getShare(shareId)
    if (!share) return null

    if (share.accessCode.toUpperCase() !== accessCode.toUpperCase()) {
      throw new Error('提取码错误')
    }

    if (share.expiresAt > 0 && Date.now() > share.expiresAt) {
      throw new Error('分享链接已过期')
    }

    if (share.maxDownloads > 0 && share.downloadCount >= share.maxDownloads) {
      throw new Error('下载次数已用完')
    }

    const url = await getFileURL(share.cloudPath)

    await db.collection('shares').doc(shareId).update({
      downloadCount: db.command.inc(1)
    })

    return { url, fileName: share.fileName }
  }

  async function getUserShares(): Promise<ShareRecord[]> {
    const result = await db.collection('shares')
      .where({ ownerId: uid.value })
      .orderBy('createdAt', 'desc')
      .get()
    return result.data || []
  }

  async function deleteShare(shareId: string): Promise<void> {
    await db.collection('shares').doc(shareId).remove()
  }

  function formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
  }

  function formatDate(ts: number): string {
    if (!ts) return '-'
    const d = new Date(ts)
    return d.toLocaleDateString('zh-CN') + ' ' + d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }

  return {
    uploadFile,
    getUserFiles,
    deleteFile,
    getFileURL,
    createShare,
    getShare,
    verifyAndDownload,
    getUserShares,
    deleteShare,
    formatSize,
    formatDate
  }
}
