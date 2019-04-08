import Vue from 'vue'
import VueI18n from 'vue-i18n'

import en from '../assets/locales/en-us.json'

Vue.use(VueI18n)

const FALLBACK = 'en-us'
const currentLocale = (window.applicationFramework) ? window.applicationFramework.util.getLanguage() : FALLBACK

function loadLocaleMessage (locale, cb = () => {}) {
  const url = './locales/' + locale + '.json'
  const fileReader = new XMLHttpRequest()
  fileReader.open('GET', url, true)
  fileReader.onload = () => {
    const message = JSON.parse(fileReader.responseText)
    i18n.setLocaleMessage(locale, message)
    i18n.locale = locale
  }
  fileReader.onerror = () => {
    console.log('[obigo-js-ui] ' + locale + '.json is not exit')
    i18n.locale = FALLBACK
  }
  fileReader.send(null)
}

const i18n = new VueI18n({
  locale: FALLBACK,
  fallbackLocale: FALLBACK,
  messages: {
    'en-us': en,
    'en': en
  }
})

loadLocaleMessage(currentLocale)

i18n.loadLocaleMessage = loadLocaleMessage

export default i18n
