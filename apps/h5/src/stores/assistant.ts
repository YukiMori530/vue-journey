import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAssistantStore = defineStore('assistant', () => {
  const show = ref(false)
  const draft = ref('')
  const pageHint = ref('')

  function open(options?: { draft?: string; hint?: string }) {
    if (options?.draft) {
      draft.value = options.draft
    }
    pageHint.value = options?.hint ?? ''
    show.value = true
  }

  function close() {
    show.value = false
    draft.value = ''
    pageHint.value = ''
  }

  return {
    show,
    draft,
    pageHint,
    open,
    close,
  }
})
