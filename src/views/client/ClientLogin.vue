<template>
  <main class="client-login">
    <div class="client-login__language">
      <SelectLanguage />
    </div>

    <section class="client-login__content">
      <header class="client-login__brand">
        <div class="client-login__brand-name">
          <img src="@/assets/logo.png" alt="" />
          <span>{{ projectTitle }}</span>
        </div>
        <p>{{ rawI18nText('clientLogin.description') }}</p>
      </header>

      <section class="client-login__form-wrap" aria-labelledby="client-login-title">
        <h1 id="client-login-title">{{ rawI18nText('clientLogin.title') }}</h1>
        <a-form :model="{ username, password }" layout="vertical" @finish="submit">
          <a-form-item class="client-login__field" required>
            <a-input
              v-model:value="username"
              :aria-label="rawI18nText('clientLogin.username')"
              :placeholder="rawI18nText('clientLogin.username')"
              autocomplete="username"
              maxlength="64"
              required
              size="large"
            >
              <template #prefix>
                <user-outlined aria-hidden="true" />
              </template>
            </a-input>
          </a-form-item>
          <a-form-item class="client-login__field" required>
            <a-input-password
              v-model:value="password"
              :aria-label="rawI18nText('clientLogin.password')"
              :placeholder="rawI18nText('clientLogin.password')"
              autocomplete="current-password"
              maxlength="256"
              required
              size="large"
            >
              <template #prefix>
                <lock-outlined aria-hidden="true" />
              </template>
            </a-input-password>
          </a-form-item>
          <a-alert
            v-if="errorText"
            class="client-login__error"
            type="error"
            show-icon
            :message="errorText"
          />
          <a-button
            class="client-login__submit"
            type="primary"
            size="large"
            html-type="submit"
            :loading="busy"
          >
            {{ rawI18nText('clientLogin.submit') }}
          </a-button>
        </a-form>
      </section>
    </section>
  </main>
</template>

<script setup lang="ts">
import axios from 'axios'
import SelectLanguage from '@/components/SelectLanguage/index.vue'
import { projectTitle } from '@/config'
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
    if (
      response.data?.code !== 200 ||
      typeof authorizeUrl !== 'string' ||
      !authorizeUrl.startsWith('/api/oauth2/authorize?')
    ) {
      throw new Error(
        response.data?.code === 401
          ? rawI18nText('clientLogin.invalidCredentials')
          : rawI18nText('clientLogin.invalidRequest')
      )
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
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  overflow: auto;
  background: #f0f2f5;
}

.client-login__language {
  display: flex;
  width: 100%;
  height: 40px;
  align-items: flex-end;
  flex-direction: column-reverse;
  line-height: 44px;
}

.client-login__language :deep(.ant-dropdown-trigger) {
  margin-right: 24px;
}

.client-login__content {
  flex: 1;
  padding: 32px 0 24px;
}

.client-login__brand {
  margin-bottom: 40px;
  text-align: center;
}

.client-login__brand-name {
  display: flex;
  height: 44px;
  align-items: center;
  justify-content: center;
  color: #1f1f1f;
  font-size: 33px;
  font-weight: 600;
  line-height: 44px;
}

.client-login__brand-name img {
  width: 44px;
  height: 44px;
  margin-right: 16px;
  object-fit: contain;
}

.client-login__brand p {
  margin: 12px 0 0;
  color: #8c8c8c;
  font-size: 14px;
}

.client-login__form-wrap {
  width: min(368px, calc(100% - 48px));
  margin: 0 auto;
}

.client-login__form-wrap h1 {
  margin: 0 0 24px;
  color: #262626;
  font-size: 20px;
  font-weight: 500;
}

.client-login__field {
  margin-bottom: 24px;
}

.client-login__field :deep(.ant-input-prefix) {
  margin-right: 10px;
  color: rgb(0 0 0 / 25%);
}

.client-login__error {
  margin-bottom: 24px;
}

.client-login__submit {
  width: 100%;
}

@media (min-width: 768px) {
  .client-login {
    background-image: url('@/assets/backgroud.svg');
    background-repeat: no-repeat;
    background-position: center 110px;
    background-size: 100%;
  }
}
</style>
