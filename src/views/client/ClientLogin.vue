<template>
  <main class="client-login">
    <SelectLanguage class="client-login__language" />
    <a-card class="client-login__card" :bordered="false">
      <h1>{{ rawI18nText('clientLogin.title') }}</h1>
      <p>{{ rawI18nText('clientLogin.description') }}</p>
      <a-form layout="vertical" @finish="submit">
        <a-form-item :label="rawI18nText('clientLogin.username')" required>
          <a-input v-model:value="username" autocomplete="username" maxlength="64" required />
        </a-form-item>
        <a-form-item :label="rawI18nText('clientLogin.password')" required>
          <a-input-password
            v-model:value="password"
            autocomplete="off"
            maxlength="256"
            required
          />
        </a-form-item>
        <a-alert v-if="errorText" type="error" show-icon :message="errorText" />
        <a-button class="client-login__submit" type="primary" html-type="submit" :loading="busy">
          {{ rawI18nText('clientLogin.submit') }}
        </a-button>
      </a-form>
    </a-card>
  </main>
</template>

<script setup lang="ts">
import axios from 'axios'
import SelectLanguage from '@/components/SelectLanguage/index.vue'
import { useAdminI18n } from '@/hooks/i18n'

defineOptions({ name: 'ClientLogin' })

const route = useRoute()
const { rawI18nText } = useAdminI18n()
const transactionId = typeof route.query.transactionId === 'string' ? route.query.transactionId : ''
const username = ref('')
const password = ref('')
const busy = ref(false)
const errorText = ref(transactionId ? '' : rawI18nText('clientLogin.invalidRequest'))

const submit = async () => {
  if (busy.value || !transactionId) return
  busy.value = true
  errorText.value = ''
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/client/v1/authorization/confirm`,
      { transactionId, username: username.value, password: password.value },
      { withCredentials: true }
    )
    const authorizeUrl = response.data?.data?.authorizeUrl
    if (response.data?.code !== 200 || typeof authorizeUrl !== 'string' || !authorizeUrl.startsWith('/api/oauth2/authorize?')) {
      throw new Error(response.data?.code === 401
        ? rawI18nText('clientLogin.invalidCredentials')
        : rawI18nText('clientLogin.invalidRequest'))
    }
    password.value = ''
    window.location.assign(authorizeUrl)
  } catch (error) {
    password.value = ''
    errorText.value = axios.isAxiosError(error)
      ? error.response?.status === 401
        ? rawI18nText('clientLogin.invalidCredentials')
        : rawI18nText('clientLogin.requestFailed')
      : error instanceof Error
        ? error.message
        : rawI18nText('clientLogin.requestFailed')
  } finally {
    busy.value = false
  }
}
</script>

<style scoped>
.client-login {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background: #f4f6f9;
}

.client-login__language {
  position: absolute;
  top: 20px;
  right: 24px;
}

.client-login__card {
  width: min(100%, 420px);
  border-radius: 12px;
  box-shadow: 0 12px 40px rgb(27 48 77 / 10%);
}

.client-login__card h1 {
  margin-bottom: 4px;
  font-size: 22px;
}

.client-login__card p {
  margin-bottom: 24px;
  color: #667085;
}

.client-login__submit {
  width: 100%;
  margin-top: 20px;
}
</style>
