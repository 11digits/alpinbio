import { inject, readonly, reactive } from 'vue'

const DEFAULT_OPTIONS = {
  enableHighAccuracy: true,
  maximumAge: 0,
  timeout: 10000
}

function createGeolocationManager() {
  const state = reactive({
    supported: typeof window !== 'undefined' && 'geolocation' in navigator,
    coords: null,
    timestamp: null,
    error: null,
    watchId: null,
    isWatching: false
  })

  const updateSuccessState = (position) => {
    state.coords = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      altitude: position.coords.altitude,
      altitudeAccuracy: position.coords.altitudeAccuracy,
      heading: position.coords.heading,
      speed: position.coords.speed
    }
    state.timestamp = position.timestamp
    state.error = null
  }

  const updateErrorState = (error) => {
    state.error = {
      code: error.code,
      message: error.message
    }
  }

  const ensureSupport = () => {
    if (!state.supported) {
      throw new Error('Geolocation is not supported in this environment.')
    }
  }

  const getCurrentPosition = (options = DEFAULT_OPTIONS) => {
    ensureSupport()

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          updateSuccessState(position)
          resolve(position)
        },
        (error) => {
          updateErrorState(error)
          reject(error)
        },
        { ...DEFAULT_OPTIONS, ...options }
      )
    })
  }

  const startWatch = (options = DEFAULT_OPTIONS) => {
    ensureSupport()

    if (state.watchId !== null) {
      navigator.geolocation.clearWatch(state.watchId)
    }

    state.watchId = navigator.geolocation.watchPosition(
      (position) => {
        state.isWatching = true
        updateSuccessState(position)
      },
      (error) => {
        state.isWatching = false
        updateErrorState(error)
      },
      { ...DEFAULT_OPTIONS, ...options }
    )

    state.isWatching = state.watchId !== null
    return state.watchId
  }

  const stopWatch = () => {
    if (state.watchId !== null && state.supported) {
      navigator.geolocation.clearWatch(state.watchId)
    }

    state.watchId = null
    state.isWatching = false
  }

  const clearError = () => {
    state.error = null
  }

  return {
    state: readonly(state),
    getCurrentPosition,
    startWatch,
    stopWatch,
    clearError
  }
}

const GeolocationSymbol = Symbol('geolocation')

export default {
  install(app) {
    const geolocation = createGeolocationManager()

    app.config.globalProperties.$geolocation = geolocation
    app.provide(GeolocationSymbol, geolocation)
  }
}

export function useGeolocation() {
  const geolocation = inject(GeolocationSymbol, null)

  if (!geolocation) {
    throw new Error('useGeolocation must be used after installing the Geolocation plugin.')
  }

  return geolocation
}
