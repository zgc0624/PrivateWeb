import AV from 'leancloud-storage'

const appId = import.meta.env.VITE_LC_APP_ID
const appKey = import.meta.env.VITE_LC_APP_KEY
const serverURL = import.meta.env.VITE_LC_SERVER_URL

if (appId && appKey && serverURL) {
  AV.init({ appId, appKey, serverURL })
} else {
  console.warn('LeanCloud 环境变量未配置，认证功能将不可用')
}

export default AV
