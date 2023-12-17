(function() {
  'use strict';

  const { createApp, ref, watch } = Vue
  const { createVuetify } = Vuetify

  const vuetify = createVuetify()

  const DEF_CACHE_DATA = {
    model: 'gemini-pro',
  }

  const TYPES = {
    USER: 'user',
    BOT: 'bot'
  }

  const CACHE_DATA = utils.getCache(utils.CACHE_KEY, utils.cloneObject(DEF_CACHE_DATA))

  const app = createApp({
    setup() {
      const modelList = ref([])
      const model = ref(CACHE_DATA.model)
      const drawer = ref(true)
      const loading = ref(false)
      const message = ref('')
      const chatList = ref([
        {
          type: TYPES.BOT,
          message: "How can I help you today?"
        },
        // {
        //   type: TYPES.USER,
        //   message: 'What is Gemini AI?'
        // },
      ])

      getModelList().then(res => {
        modelList.value = res
      })

      function reset() {
        model.value = DEF_CACHE_DATA.model
      }

      function sendMessage() {
        const m = utils.removeHtmlTag(message.value.trim())
        if (!m) return
        loading.value = true
        chatList.value.push({ type: TYPES.USER, message: m }, { type: TYPES.BOT, message: ''})
        const botMessage = chatList.value[chatList.value.length - 1]
        message.value = ''
        let lastItemElm;
        utils.send(m, (html) => {
          botMessage.message = html
          if (!lastItemElm) {
            setTimeout(() => {
              lastItemElm = document.querySelector('#message-list .v-list-item:last-child')
              lastItemElm.scrollIntoView({ behavior: 'smooth' })
            }, 0)
          } else {
            lastItemElm.scrollIntoView({ behavior: 'smooth' })
          }
        }, (err) => {
          console.error(err)
        }, () => {
          loading.value = false
        })
      }

      watch([model], () => {
        utils.setCache(utils.CACHE_KEY, { model: model.value })
      })
      return {
        modelList,
        model,
        message,
        drawer,
        chatList,
        reset,
        sendMessage,
        TYPES,
        loading,
      }
    }
  })
  app.use(vuetify).mount('#app')

  async function getModelList() {
    try {
      const response = await fetch('/api/model-list');
      const data = await response.json();
      return data;
    } catch (e) {
      console.error(e)
      return [DEF_CACHE_DATA.model]
    }
  }
})();