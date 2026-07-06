import cloudbase from '@cloudbase/js-sdk'

const envId = import.meta.env.VITE_CLOUDBASE_ENV_ID

if (!envId) {
  console.warn('CloudBase 环境变量未配置，云盘功能将不可用')
}

const app = cloudbase.init({
  env: envId || 'placeholder'
})

export const auth = app.auth({ persistence: 'local' })
export const storage = app.storage()
export const db = app.database()

export default app
