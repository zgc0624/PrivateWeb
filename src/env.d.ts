/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'leancloud-storage' {
  namespace AV {
    class User {
      static current(): User | null
      static logIn(username: string, password: string): Promise<User>
      static logOut(): Promise<void>
      static on(event: string, callback: Function): void
      static off(event: string, callback: Function): void
      signUp(): Promise<User>
      get(key: string): any
      set(key: string, value: any): void
      setUsername(username: string): void
      setPassword(password: string): void
      setEmail(email: string): void
    }

    function init(options: { appId: string; appKey: string; serverURL: string }): void
  }

  export default AV
}
