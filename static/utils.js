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

  async function send(message, onProgress, onError, onFinally) {
      try {
        const res = await fetch('/api/stream', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
          },
          body: JSON.stringify({ input: message })
        })

        const textDecoder = new TextDecoder();
        const reader = res.body.getReader();

        let innerHtml = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break
          const text = textDecoder.decode(value)
          innerHtml += text.replace(/\n/g, '<br>');
          onProgress(innerHtml)
        }
      } catch (e) {
        onError(e)
      } finally {
        onFinally()
      }
  }

  window.utils = {
    CACHE_KEY: '__gemini_chat__',
    setCache,
    getCache,
    cloneObject,
    send,
    removeHtmlTag,
  }
})();