(function() {
  'use strict';

  function getCache(key, defaultValue) {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? defaultValue;
    } catch (e) {}
    return defaultValue
  }

  function setCache(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function cloneObject(o) {
    return JSON.parse(JSON.stringify(o));
  }

  function removeHtmlTag(input = '') {
    return input.replace(/<[^>]+>/g,"")
  }

  async function send(data, onProgress, onError, onFinally) {
      try {
        const res = await fetch('/api/stream', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
          },
          body: JSON.stringify({
            ...data,
            imgData: data.imgData?.replace(/^data:image\/\w+;base64,/, ''),
          })
        })

        const textDecoder = new TextDecoder();
        const reader = res.body.getReader();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break
          const text = textDecoder.decode(value)
          onProgress(text)
        }
      } catch (e) {
        onError(e)
      } finally {
        onFinally()
      }
  }

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

  function formatNewline(text) {
    return text.replace(/\n/g, '<br/>')
  }

  function scrollLastItemIntoView(el) {
    setTimeout(() => {
      el.lastElementChild.scrollIntoView({ behavior: 'smooth' })
    }, 0)
  }

  function parseMarkdown(text) {
    return text.replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*\s/g, '• ')
  }

  window.utils = {
    CACHE_CONFIG_KEY: '__chat_config__',
    CACHE_HISTORY_KEY: '__chat_history__',
    setCache,
    getCache,
    cloneObject,
    send,
    getModelList,
    removeHtmlTag,
    formatNewline,
    scrollLastItemIntoView,
    parseMarkdown,
  }
})();