// plugins/loader.js
import { createVNode, render } from 'vue'
import Loading from 'vue-loading-overlay'
import 'vue-loading-overlay/dist/css/index.css'

let instance = null

function showLoader(options = {}) {
  if (instance) return // prevent multiple

  const container = document.createElement('div')
  document.body.appendChild(container)

  const vnode = createVNode(Loading, {
    active: true,
    isFullPage: true,
    ...options
  })

  render(vnode, container)
  instance = { vnode, container }
}

function hideLoader() {
  if (instance) {
    render(null, instance.container) // unmount
    document.body.removeChild(instance.container)
    instance = null
  }
}

export default {
  install(app) {
    app.config.globalProperties.$loader = {
      show: showLoader,
      hide: hideLoader
    }
  }
}
