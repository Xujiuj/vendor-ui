<template>
  <div class="login-page auth-page">
    <div class="login-brand">
      <span class="logo-mark"></span>
      <span>厂商碳运营管理平台</span>
    </div>
    <span class="portal-tag">厂商端</span>

    <div class="login-box">
      <el-form ref="loginRef" :model="loginForm" :rules="loginRules" class="login-card">
        <div class="login-header">
          <h2>厂商碳运营管理平台</h2>
          <p>Vendor Carbon Operations Portal</p>
        </div>

        <el-form-item prop="username" label="账号" class="login-field">
          <el-input v-model="loginForm.username" autocomplete="username" placeholder="请输入账号" />
        </el-form-item>

        <el-form-item prop="password" label="密码" class="login-field">
          <el-input
            v-model="loginForm.password"
            type="password"
            autocomplete="current-password"
            placeholder="请输入密码"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item v-if="captchaEnabled" prop="code" label="图形验证码" class="login-field">
          <div class="captcha-field">
            <el-input v-model="loginForm.code" autocomplete="off" placeholder="请输入验证码" @keyup.enter="handleLogin" />
            <button type="button" class="captcha-img" aria-label="刷新验证码" @click="getCode">
              <img v-if="codeUrl" :src="codeUrl" alt="验证码" />
              <span v-else>6F39</span>
            </button>
          </div>
        </el-form-item>

        <div class="login-options">
          <el-checkbox v-model="loginForm.rememberMe">记住密码</el-checkbox>
          <el-checkbox v-model="autoLogin">自动登录</el-checkbox>
        </div>

        <el-button :loading="loading" type="primary" class="btn primary login-submit" @click.prevent="handleLogin">
          <span v-if="!loading">登录</span>
          <span v-else>校验中...</span>
        </el-button>

        <div class="login-support">
          <a href="https://example.com" target="_blank" rel="noreferrer">官网</a>
          <span>技术支持：400-000-0000</span>
        </div>
      </el-form>
    </div>

    <div class="login-footer">
      <p>技术支持：400-000-0000 &nbsp;|&nbsp; support@carbondata.com</p>
      <p>
        <a href="https://example.com" target="_blank" rel="noreferrer">官方网站</a> ·
        <a href="https://example.com/privacy" target="_blank" rel="noreferrer">隐私政策</a> ·
        <a href="https://example.com/terms" target="_blank" rel="noreferrer">服务条款</a>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getCodeImg } from '@/api/login';
import { useUserStore } from '@/store/modules/user';
import { LoginData } from '@/api/types';
import { to } from 'await-to-js';
import { useI18n } from 'vue-i18n';

const userStore = useUserStore();
const router = useRouter();
const { t } = useI18n();

const loginForm = ref<LoginData>({
  tenantId: '000000',
  username: 'admin',
  password: 'admin123',
  rememberMe: false,
  code: '',
  uuid: ''
} as LoginData);

const loginRules = computed<ElFormRules>(() => ({
  username: [{ required: true, trigger: 'blur', message: t('login.rule.username.required') }],
  password: [{ required: true, trigger: 'blur', message: t('login.rule.password.required') }],
  ...(captchaEnabled.value ? { code: [{ required: true, trigger: 'change', message: t('login.rule.code.required') }] } : {})
}));

const codeUrl = ref('');
const loading = ref(false);
const captchaEnabled = ref(true);
const redirect = ref('/');
const loginRef = ref<ElFormInstance>();
const autoLogin = ref(false);
const autoLoginTriggered = ref(false);

const LOGIN_STORAGE_KEYS = {
  tenantId: 'vendorLoginTenantId',
  username: 'vendorLoginUsername',
  password: 'vendorLoginPassword',
  rememberMe: 'vendorLoginRememberMe',
  autoLogin: 'vendorLoginAutoLogin'
} as const;

watch(
  () => router.currentRoute.value,
  (newRoute: any) => {
    redirect.value = newRoute.query && newRoute.query.redirect && decodeURIComponent(newRoute.query.redirect);
  },
  { immediate: true }
);

watch(autoLogin, (enabled) => {
  if (enabled) {
    loginForm.value.rememberMe = true;
  }
});

watch(
  () => loginForm.value.rememberMe,
  (rememberMe) => {
    if (!rememberMe) {
      autoLogin.value = false;
    }
  }
);

const getLoginData = () => {
  const rememberMe = localStorage.getItem(LOGIN_STORAGE_KEYS.rememberMe) === 'true';
  const savedUsername = localStorage.getItem(LOGIN_STORAGE_KEYS.username);
  const savedPassword = localStorage.getItem(LOGIN_STORAGE_KEYS.password);
  const savedTenantId = localStorage.getItem(LOGIN_STORAGE_KEYS.tenantId);

  loginForm.value = {
    ...loginForm.value,
    tenantId: savedTenantId || loginForm.value.tenantId,
    username: rememberMe && savedUsername ? savedUsername : loginForm.value.username,
    password: rememberMe && savedPassword ? savedPassword : loginForm.value.password,
    rememberMe
  } as LoginData;
  autoLogin.value = rememberMe && localStorage.getItem(LOGIN_STORAGE_KEYS.autoLogin) === 'true';
};

const syncLoginPreference = () => {
  localStorage.setItem(LOGIN_STORAGE_KEYS.autoLogin, String(autoLogin.value));

  if (!loginForm.value.rememberMe) {
    localStorage.removeItem(LOGIN_STORAGE_KEYS.tenantId);
    localStorage.removeItem(LOGIN_STORAGE_KEYS.username);
    localStorage.removeItem(LOGIN_STORAGE_KEYS.password);
    localStorage.removeItem(LOGIN_STORAGE_KEYS.rememberMe);
    localStorage.removeItem(LOGIN_STORAGE_KEYS.autoLogin);
    return;
  }

  localStorage.setItem(LOGIN_STORAGE_KEYS.tenantId, String(loginForm.value.tenantId || '000000'));
  localStorage.setItem(LOGIN_STORAGE_KEYS.username, String(loginForm.value.username || ''));
  localStorage.setItem(LOGIN_STORAGE_KEYS.password, String(loginForm.value.password || ''));
  localStorage.setItem(LOGIN_STORAGE_KEYS.rememberMe, 'true');
};

const handleLogin = () => {
  if (!captchaEnabled.value) {
    loginRef.value?.clearValidate('code');
  }
  loginRef.value?.validate(async (valid: boolean, fields: any) => {
    if (!valid) {
      console.log('error submit!', fields);
      return;
    }

    loading.value = true;
    loginForm.value.tenantId = '000000';
    const [err] = await to(userStore.login(loginForm.value));
    if (!err) {
      syncLoginPreference();
      const redirectUrl = redirect.value || '/';
      await router.push(redirectUrl);
      loading.value = false;
      return;
    }

    loading.value = false;
    if (captchaEnabled.value) {
      await getCode();
    }
  });
};

const getCode = async () => {
  const res = await getCodeImg();
  const { data } = res;
  captchaEnabled.value = data.captchaEnabled === undefined ? true : data.captchaEnabled;
  if (captchaEnabled.value) {
    loginForm.value.code = '';
    codeUrl.value = 'data:image/gif;base64,' + data.img;
    loginForm.value.uuid = data.uuid;
    return;
  }

  codeUrl.value = '';
  loginForm.value.code = '';
  loginForm.value.uuid = '';
  await nextTick();
  loginRef.value?.clearValidate('code');
  if (autoLogin.value && loginForm.value.username && loginForm.value.password && !autoLoginTriggered.value) {
    autoLoginTriggered.value = true;
    handleLogin();
  }
};

onMounted(() => {
  getLoginData();
  getCode();
});
</script>

<style lang="scss" scoped>
.auth-page {
  --login-card-bg: rgba(255, 255, 255, 0.95);
  --login-card-border: rgba(255, 255, 255, 0.48);
  --login-title: #1f2937;
  --login-label: #4b5563;
  --login-input-bg: #fff;
  --login-input-text: #1f2937;
  --login-input-placeholder: #9ca3af;
  --login-input-border: #d6dce5;
  --login-captcha-border: #b9d9ca;
  --login-captcha-bg: #f7fbf9;
  --login-captcha-text: #0f5f47;

  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
  background:
    linear-gradient(90deg, rgba(16, 40, 32, 0.74), rgba(24, 52, 47, 0.42) 48%, rgba(255, 255, 255, 0.08)),
    url('../assets/images/login-carbon-bg.png') center / cover no-repeat;
}

html.dark .auth-page {
  --login-card-bg: rgba(17, 24, 39, 0.92);
  --login-card-border: rgba(148, 163, 184, 0.28);
  --login-title: #f8fafc;
  --login-label: #cbd5e1;
  --login-input-bg: rgba(15, 23, 42, 0.9);
  --login-input-text: #f3f4f6;
  --login-input-placeholder: #64748b;
  --login-input-border: #334155;
  --login-captcha-border: rgba(69, 212, 131, 0.34);
  --login-captcha-bg: #12201d;
  --login-captcha-text: #7ee2a8;
}

.login-brand,
.portal-tag {
  position: fixed;
  top: 48px;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  color: #fff;
  pointer-events: auto;
}

.login-brand {
  left: 48px;
  gap: 10px;
  font-size: 15px;
  font-weight: 700;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.logo-mark {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.22), rgba(255, 255, 255, 0) 44%), linear-gradient(135deg, #22c55e, #1677ff);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.18);
}

.portal-tag {
  right: 48px;
  height: 32px;
  gap: 6px;
  padding: 0 14px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.2);
  font-size: 13px;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(12px);
}

.portal-tag::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.login-box {
  position: relative;
  z-index: 1;
  width: min(430px, calc(100vw - 48px));
}

.login-card {
  width: 100%;
  padding: 36px 32px 26px;
  border: 1px solid var(--login-card-border);
  border-radius: 8px;
  background: var(--login-card-bg);
  box-shadow: 0 28px 70px rgba(8, 24, 42, 0.28);
  backdrop-filter: blur(16px);
}

.login-header {
  margin-bottom: 20px;
  text-align: center;
}

.login-header h2 {
  margin: 0 0 20px;
  color: var(--login-title);
  font-size: 20px;
  font-weight: 700;
}

.login-header p {
  margin: -12px 0 0;
  color: var(--carbon-muted);
  font-size: 12px;
  letter-spacing: 0;
}

.login-field {
  margin-bottom: 12px;
}

.login-card :deep(.el-form-item) {
  display: block;
}

.login-card :deep(.el-form-item__label) {
  justify-content: flex-start;
  height: auto;
  margin-bottom: 6px;
  color: var(--login-label);
  font-weight: 500;
  line-height: 1.5;
}

.login-card :deep(.el-input__wrapper) {
  min-height: 36px;
  border-radius: 6px;
  background: var(--login-input-bg);
  box-shadow: 0 0 0 1px var(--login-input-border) inset;
}

.login-card :deep(.el-input__inner) {
  color: var(--login-input-text);
  background: transparent;
}

.login-card :deep(.el-input__inner::placeholder) {
  color: var(--login-input-placeholder);
}

.login-card :deep(.el-input__wrapper.is-focus) {
  box-shadow:
    0 0 0 1px var(--carbon-primary) inset,
    0 0 0 3px rgba(22, 119, 255, 0.12);
}

.captcha-field {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 104px;
  gap: 8px;
}

.captcha-img {
  height: 36px;
  border: 1px solid var(--login-captcha-border);
  border-radius: 6px;
  background:
    linear-gradient(135deg, rgba(31, 143, 106, 0.14), rgba(22, 119, 255, 0.1)),
    repeating-linear-gradient(-35deg, transparent 0 8px, rgba(31, 143, 106, 0.1) 8px 10px), var(--login-captcha-bg);
  color: var(--login-captcha-text);
  font-weight: 800;
  letter-spacing: 2px;
  cursor: pointer;
  overflow: hidden;
}

.captcha-img img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.login-options {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 4px 16px;
  margin: 4px 0 2px;
}

.login-options :deep(.el-checkbox) {
  height: 28px;
  margin-right: 0;
  color: var(--login-label);
}

.login-submit {
  width: 100%;
  height: 40px;
  margin-top: 16px;
  border-radius: 6px;
  font-weight: 700;
}

.login-support {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px 12px;
  margin-top: 18px;
  color: var(--carbon-muted);
  font-size: 12px;
}

.login-support a {
  color: var(--carbon-primary);
  font-weight: 600;
}

.login-footer {
  position: fixed;
  left: 24px;
  right: 24px;
  bottom: 22px;
  z-index: 1;
  color: rgba(255, 255, 255, 0.86);
  font-size: 12px;
  text-align: center;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.login-footer p {
  margin: 4px 0;
}

.login-footer a {
  color: #fff;
  text-decoration: none;
}

.login-footer a:hover {
  text-decoration: underline;
}

@media (max-width: 720px) {
  .auth-page {
    padding: 80px 24px 88px;
  }

  .login-brand {
    left: 24px;
    top: 24px;
  }

  .portal-tag {
    right: 24px;
    top: 24px;
  }

  .login-support {
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }

  .login-footer {
    bottom: 14px;
  }
}
</style>
