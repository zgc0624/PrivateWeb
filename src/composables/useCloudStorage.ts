import { storage, db } from '@/lib/cloudbase'
import { useAuth } from './useAuth'

export interface FileRecord {
  _id: string
  ownerId: string
  fileName: string
  fileSize: number
  fileID: string
  createdAt: number
}

export interface ShareRecord {
  _id: string
  fileId: string
  ownerId: string
  fileName: string
  fileSize: number
  fileID: string
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

  async function uploadFile(file: File): Promise<FileRecord> {
    const cloudPath = `files/${uid.value}/${Date.now()}_${file.name}`
    const { data, error } = await storage.upload(cloudPath, file)

    if (error) throw new Error(error.message || '上传失败')

    const fileID = data.id

    const record = {
      ownerId: uid.value,
      fileName: file.name,
      fileSize: file.size,
      fileID,
      createdAt: Date.now()
    }

    const addResult = await db.collection('files').add(record)
    return {
      _id: addResult.id || '',
      ...record
    }
  }

  async function getUserFiles(): Promise<FileRecord[]> {
    // @ts-ignore - v3 SDK runCommands 类型定义未更新
    const result = await db.runCommands([{
      name: 'database.queryDocument',
      collectionName: 'files',
      query: { ownerId: uid.value },
      order: [{ orderBy: 'createdAt', direction: 'desc' }],
      limit: 100
    }])
    const docs = result?.data?.[0]?.data || []
    return docs.map((d: any) => ({
      _id: d._id,
      ownerId: d.ownerId,
      fileName: d.fileName,
      fileSize: d.fileSize,
      fileID: d.fileID,
      createdAt: d.createdAt
    }))
  }

  async function deleteFile(fileId: string, fileID: string): Promise<void> {
    await storage.remove(fileID)
    await db.collection('files').doc(fileId).remove()
  }

  async function getDownloadURL(fileID: string): Promise<string> {
    const { data, error } = await storage.download(fileID)
    if (error) throw new Error(error.message || '获取下载链接失败')
    return data.url || ''
  }

  async function createShare(fileId: string, expiresDays: number, maxDownloads: number): Promise<ShareRecord> {
    const fileResult = await db.collection('files').doc(fileId).get()
    const file = fileResult.data
    if (!file) throw new Error('文件不存在')

    const shareId = Math.random().toString(36).substring(2, 10)
    const accessCode = generateAccessCode()
    const expiresAt = expiresDays > 0 ? Date.now() + expiresDays * 86400000 : 0

    const record = {
      _id: shareId,
      fileId: file._id,
      ownerId: file.ownerId,
      fileName: file.fileName,
      fileSize: file.fileSize,
      fileID: file.fileID,
      accessCode,
      expiresAt,
      maxDownloads,
      downloadCount: 0,
      createdAt: Date.now()
    }

    // @ts-ignore - v3 SDK doc.create 类型定义未更新
    await db.collection('shares').doc(shareId).create(record)
    return record
  }

  async function getShare(shareId: string): Promise<ShareRecord | null> {
    const result = await db.collection('shares').doc(shareId).get()
    return result.data || null
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

    const url = await getDownloadURL(share.fileID)

    await db.collection('shares').doc(shareId).update({
      downloadCount: db.command.inc(1)
    })

    return { url, fileName: share.fileName }
  }

  async function getUserShares(): Promise<ShareRecord[]> {
    // @ts-ignore - v3 SDK runCommands 类型定义未更新
    const result = await db.runCommands([{
      name: 'database.queryDocument',
      collectionName: 'shares',
      query: { ownerId: uid.value },
      order: [{ orderBy: 'createdAt', direction: 'desc' }],
      limit: 100
    }])
    const docs = result?.data?.[0]?.data || []
    return docs.map((d: any) => ({
      _id: d._id,
      fileId: d.fileId,
      ownerId: d.ownerId,
      fileName: d.fileName,
      fileSize: d.fileSize,
      fileID: d.fileID,
      accessCode: d.accessCode,
      expiresAt: d.expiresAt,
      maxDownloads: d.maxDownloads,
      downloadCount: d.downloadCount,
      createdAt: d.createdAt
    }))
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
    getDownloadURL,
    createShare,
    getShare,
    verifyAndDownload,
    getUserShares,
    deleteShare,
    formatSize,
    formatDate
  }
}
