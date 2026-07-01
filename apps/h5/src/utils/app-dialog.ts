import { ref } from 'vue'

export type AppDialogIcon = 'location' | 'confirm' | 'info'

export interface AppDialogOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  showCancel?: boolean
  icon?: AppDialogIcon
}

export const dialogVisible = ref(false)
export const dialogOptions = ref<AppDialogOptions>({
  title: '',
  message: '',
  confirmText: '确定',
  cancelText: '取消',
  showCancel: true,
  icon: 'info',
})

let resolveDialog: ((value: boolean) => void) | null = null

export function showAppConfirmDialog(options: AppDialogOptions): Promise<boolean> {
  return new Promise((resolve) => {
    resolveDialog = resolve
    dialogOptions.value = {
      confirmText: '确定',
      cancelText: '取消',
      showCancel: true,
      icon: 'info',
      ...options,
    }
    dialogVisible.value = true
  })
}

export function resolveAppDialog(confirmed: boolean) {
  dialogVisible.value = false
  resolveDialog?.(confirmed)
  resolveDialog = null
}
