import { computed, onMounted, onUnmounted, ref, unref, watch } from 'vue'
import { formatDuration, toDate } from '@/utils/datetime'

export function useElapsedTime(source, { interval = 30000 } = {}) {
  const now = ref(Date.now())
  const startDate = computed(() => toDate(unref(source)))

  const updateNow = () => {
    now.value = Date.now()
  }

  watch(startDate, () => {
    updateNow()
  })

  let timerId = null

  onMounted(() => {
    updateNow()

    if (typeof window !== 'undefined') {
      timerId = window.setInterval(updateNow, interval)
    }
  })

  onUnmounted(() => {
    if (timerId) {
      window.clearInterval(timerId)
      timerId = null
    }
  })

  const elapsed = computed(() => {
    const start = startDate.value
    if (!start) {
      return ''
    }

    return formatDuration(start, new Date(now.value))
  })

  return {
    elapsed
  }
}
