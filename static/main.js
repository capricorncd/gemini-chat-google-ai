(function() {
  'use strict'

  const { createApp, ref, watch, onMounted, computed } = Vue
  const { createVuetify, useDisplay } = Vuetify

  const vuetify = createVuetify()

  const TYPES = {
    USER: 'user',
    BOT: 'bot'
  }

  const CACHE_DATA = utils.getCache(utils.CACHE_CONFIG_KEY, utils.cloneObject(utils.DEF_CACHE_DATA))

  function generateItem(message, type = TYPES.BOT) {
    return {
      id: utils.uuid(),
      type,
      message,
    }
  }

  const INIT_CHAT_ITEM = generateItem("How can I help you today?")

  const CACHE_HISTORY = utils.getCache(utils.CACHE_HISTORY_KEY, [INIT_CHAT_ITEM])

  // eslint-disable-next-line vue/one-component-per-file
  const app = createApp({
    setup() {
      const modelList = ref([])
      const model = ref(CACHE_DATA.model)
      const drawer = ref(true)
      const loading = ref(false)
      const message = ref('')
      const chatList = ref(CACHE_HISTORY)
      const listRef = ref(null)
      const imgData = ref(null)

      const { width } = useDisplay()

      // mobileBreakpoint
      const isSm = computed(() => {
        return width.value <= 780
      })

      // send message button
      const disabled = computed(() => {
        return (!message.value && !imgData.value) || loading.value
      })

      watch([width], () => {
        if (isSm.value && drawer.value) {
          drawer.value = false
        }
      })

      utils.getModelList().then(res => {
        modelList.value = res
      })

      function reset() {
        model.value = utils.DEF_CACHE_DATA.model
      }

      function clearHistory() {
        chatList.value = [INIT_CHAT_ITEM]
        updateCacheChatList()
      }

      function sendMessage(e) {
        if (disabled.value) return
        // Fixed the message was sent when pressing the Enter key to confirm Japanese input
        if (e.type === 'keydown') {
          const keyCode = e.keyCode ?? e.which
          if (keyCode !== 13 || e.shiftKey) return
        }
        const input = utils.removeHtmlTag(message.value?.trim())
        message.value = ''
        loading.value = true

        if (input) chatList.value.push(generateItem(input, TYPES.USER))

        chatList.value.push(generateItem('loading ...'))
        utils.scrollLastItemIntoView(listRef.value.$el)

        let isFirstText = true
        const botMessage = chatList.value[chatList.value.length - 1]

        // fix: Add an image to use models/gemini-pro-vision, or switch your model to a text model.
        if (model.value === utils.MODEL_VISION && !imgData.value) {
          model.value = utils.MODEL_TEXT_ONLY
        }

        utils.send({
          input,
          model: model.value,
          imgData: imgData.value,
        }, (text) => {
          if (isFirstText) {
            botMessage.message = text
            isFirstText = false
          } else {
            botMessage.message += text
          }
          utils.scrollLastItemIntoView(listRef.value.$el)
        }, (err) => {
          console.error(err)
          botMessage.message = `ERROR: ${err}`
        }, () => {
          loading.value = false
          imgData.value = null
          updateCacheChatList()
        })
      }

      function onFileInputChange(e) {
        const file = e.target.files[0]
        if (!file || !file.type.startsWith('image/')) return
        imageProcess.handleMediaFile(file, { longEdge: 600 }).then((res) => {
          console.log(res)
          imgData.value = res.data
          chatList.value.push(generateItem(`<img src="${res.data}" />`, TYPES.USER))
          utils.scrollLastItemIntoView(listRef.value.$el)
        }).catch(console.error)
      }

      function removeChatItem(index) {
        const item = chatList.value[index]
        if (imgData.value && /^<img\s*src="(data:image.+)"/.test(item.message) && RegExp.$1 === imgData.value) {
          imgData.value = null
        }
        chatList.value.splice(index, 1)
        updateCacheChatList()
      }

      function updateCacheChatList() {
        console.log('updateCacheChatList ====')
        utils.setCache(utils.CACHE_HISTORY_KEY, chatList.value)
      }

      watch([model], () => {
        utils.setCache(utils.CACHE_CONFIG_KEY, { model: model.value })
      })

      // watch(chatList, () => {
      //   utils.setCache(utils.CACHE_HISTORY_KEY, chatList.value)
      // }, { deep: true })

      onMounted(() => {
        console.log('mounted')
        if (isSm.value && drawer.value) {
          drawer.value = false
        }
        utils.scrollLastItemIntoView(listRef.value.$el)
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
        listRef,
        clearHistory,
        isSm,
        onFileInputChange,
        disabled,
        removeChatItem,
      }
    }
  })

  // eslint-disable-next-line vue/one-component-per-file
  app.component('ChatItem', {
    props: {
      item: {
        type: Object,
        default: null,
      }
    },
    setup({ item }) {
      const message = computed(() => utils.parseMarkdown(utils.formatNewline(item.message)))

      const args = computed(() => {
        const isBot = item.type === TYPES.BOT
        return {
          icon: isBot ? 'mdi-google' : 'mdi-account-circle-outline',
          color: isBot ? null : 'blue-grey',
        }
      })

      return {
        message,
        args,
      }
    },
    template: `<v-list-item>
        <v-alert v-bind="args" closable @click:close="$emit('close')">
          <section v-html="message"></section>
        </v-alert>
      </v-list-item>`
  })

  app.use(vuetify).mount('#app')
})()
