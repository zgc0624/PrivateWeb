/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '@cloudbase/js-sdk' {
  interface UploadOptions {
    cloudPath: string
    fileContent: File | Blob
    onUploadProgress?: (event: { loaded: number; total: number }) => void
  }

  interface UploadResult {
    fileID: string
  }

  interface GetTempFileURLOptions {
    fileList: string[]
  }

  interface GetTempFileURLResult {
    fileList: Array<{ fileID: string; tempFileURL: string }>
  }

  interface DeleteFileOptions {
    fileList: string[]
  }

  interface Storage {
    uploadFile(options: UploadOptions): Promise<UploadResult>
    getTempFileURL(options: GetTempFileURLOptions): Promise<GetTempFileURLResult>
    deleteFile(options: DeleteFileOptions): Promise<void>
  }

  interface Auth {
    signUp(options: { email: string; password: string }): Promise<{ error?: any }>
    signIn(options: { email: string; password: string }): Promise<{ error?: any }>
    signOut(): Promise<void>
    getLoginState(): Promise<any>
    onAuthStateChanged(callback: (user: any) => void): void
  }

  interface DatabaseCollection {
    where(query: any): DatabaseCollection
    orderBy(field: string, direction: 'asc' | 'desc'): DatabaseCollection
    get(): Promise<{ data: any[] }>
    add(data: any): Promise<{ id: string }>
    doc(id: string): DatabaseDoc
    remove(): Promise<void>
    update(data: any): Promise<void>
  }

  interface DatabaseDoc {
    get(): Promise<{ data: any }>
    update(data: any): Promise<void>
    remove(): Promise<void>
  }

  interface DatabaseCommand {
    inc(n: number): any
  }

  interface Database {
    collection(name: string): DatabaseCollection
    command: DatabaseCommand
  }

  interface CloudBaseApp {
    auth(options?: { persistence?: string }): Auth
    storage(): Storage
    database(): Database
  }

  interface CloudBase {
    init(options: { env: string }): CloudBaseApp
  }

  const cloudbase: CloudBase
  export default cloudbase
}
