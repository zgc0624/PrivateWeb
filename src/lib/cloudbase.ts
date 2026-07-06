import cloudbase from '@cloudbase/js-sdk'

const envId = import.meta.env.VITE_CLOUDBASE_ENV_ID
const accessKey = import.meta.env.VITE_CLOUDBASE_ACCESS_KEY

if (!envId) {
  console.warn('CloudBase 环境变量未配置，云盘功能将不可用')
}

const app = cloudbase.init({
  env: envId || 'placeholder',
  accessKey: accessKey || ''
})

// v3 SDK: auth() 返回实例
export const auth = app.auth()
// v3 SDK: storage 通过 from() 获取
export const storage = app.storage.from()
// v3 SDK: database 通过 runCommands 调用
export const db = app.database()

export default app
