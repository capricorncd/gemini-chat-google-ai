(function() {
  'use strict';

  const { createApp, ref, watch, onMounted, computed } = Vue
  const { createVuetify, useDisplay } = Vuetify

  const vuetify = createVuetify()

  const DEF_CACHE_DATA = {
    model: 'gemini-pro',
  }

  const TYPES = {
    USER: 'user',
    BOT: 'bot'
  }

  const CACHE_DATA = utils.getCache(utils.CACHE_CONFIG_KEY, utils.cloneObject(DEF_CACHE_DATA))

  const INIT_CHAT_ITEM = {
    type: TYPES.BOT,
    message: "How can I help you today?"
  }

  const CACHE_HISTORY = utils.getCache(utils.CACHE_HISTORY_KEY, [INIT_CHAT_ITEM])

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
        model.value = DEF_CACHE_DATA.model
      }

      function clearHistory() {
        chatList.value = [INIT_CHAT_ITEM]
        utils.setCache(utils.CACHE_HISTORY_KEY, chatList.value)
      }

      function sendMessage() {
        if (disabled.value) return
        const input = utils.removeHtmlTag(message.value?.trim())
        message.value = ''
        loading.value = true

        if (input) chatList.value.push({ type: TYPES.USER, message: input })

        chatList.value.push({ type: TYPES.BOT, message: 'loading ...'})
        utils.scrollLastItemIntoView(listRef.value.$el)

        let isFirstText = true
        const botMessage = chatList.value[chatList.value.length - 1]

        utils.send({
          input,
          model: model.value,
          imgData: imgData.value,
        }, (text) => {
          if (isFirstText) {
            botMessage.message = text
            isFirstText = false
          } else {
            botMessage.message += text;
          }
          utils.scrollLastItemIntoView(listRef.value.$el)
        }, (err) => {
          console.error(err)
          botMessage.message = `ERROR: ${err}`
        }, () => {
          loading.value = false
          imgData.value = null
          utils.setCache(utils.CACHE_HISTORY_KEY, chatList.value)
        })
      }

      function onFileInputChange(e) {
        const file = e.target.files[0]
        if (!file || !file.type.startsWith('image/')) return
        imageProcess.handleMediaFile(file, { longEdge: 600 }).then((res) => {
          console.log(res)
          imgData.value = res.data
          chatList.value.push({ type: TYPES.USER, message: `<img src="${res.data}" />` })
          utils.scrollLastItemIntoView(listRef.value.$el)
        }).catch(console.error)
      }

      function removeChatItem(index) {
        const item = chatList.value[index]
        if (imgData.value && /^<img\s*src="(data:image.+)"/.test(item.message) && RegExp.$1 === imgData.value) {
          imgData.value = null
        }
        chatList.value.splice(index, 1)
      }

      watch([model], () => {
        utils.setCache(utils.CACHE_CONFIG_KEY, { model: model.value })
      })

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

  app.component('chat-item', {
    props: ['item'],
    computed: {
      isBot() {
        return this.item.type === TYPES.BOT
      },
      message() {
        return utils.parseMarkdown(utils.formatNewline(this.item.message))
      }
    },
    methods: {
      close() {
        this.$emit('close')
      }
    },
    template: `<v-list-item>
        <v-alert icon="mdi-google" v-if="isBot" closable @click:close="close">
          <section v-html="message"></section>
        </v-alert>
        <v-alert v-else color="blue-grey" icon="mdi-account-circle-outline" closable @click:close="close">
          <section v-html="message"></section>
        </v-alert>
      </v-list-item>`
  })

  app.use(vuetify).mount('#app')
})();