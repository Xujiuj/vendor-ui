<template>
  <div class="login-page auth-page">
    <div class="login-shell">
      <div class="login-brand">
        <span class="logo-mark"></span>
        <div>
          <strong>厂商碳运营管理平台</strong>
          <small>Vendor Operations Portal</small>
        </div>
      </div>

      <el-form ref="loginRef" :model="loginForm" :rules="loginRules" class="login-card">
        <div class="login-card-head">
          <span class="portal-tag">厂商端运营</span>
          <h2>厂商碳运营管理平台</h2>
          <p>客户授权、License 签发、因子版本、模板分发和续费运营统一入口</p>
        </div>

        <el-form-item prop="username" label="账号" class="field">
          <el-input v-model="loginForm.username" autocomplete="username" placeholder="请输入账号" />
        </el-form-item>

        <el-form-item prop="password" label="密码" class="field">
          <el-input
            v-model="loginForm.password"
            type="password"
            autocomplete="current-password"
            placeholder="请输入密码"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item prop="code" label="图形验证码" class="field">
          <div class="captcha-field">
            <el-input v-model="loginForm.code" autocomplete="off" placeholder="请输入验证码" @keyup.enter="handleLogin" />
            <button type="button" class="captcha-img" aria-label="刷新验证码" @click="getCode">
              <img v-if="codeUrl" :src="codeUrl" alt="验证码" />
              <span v-else>6F39</span>
            </button>
          </div>
        </el-form-item>

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

const loginRules: ElFormRules = {
  username: [{ required: true, trigger: 'blur', message: t('login.rule.username.required') }],
  password: [{ required: true, trigger: 'blur', message: t('login.rule.password.required') }],
  code: [{ required: true, trigger: 'change', message: t('login.rule.code.required') }]
};

const codeUrl = ref('');
const loading = ref(false);
const captchaEnabled = ref(true);
const redirect = ref('/');
const loginRef = ref<ElFormInstance>();

watch(
  () => router.currentRoute.value,
  (newRoute: any) => {
    redirect.value = newRoute.query && newRoute.query.redirect && decodeURIComponent(newRoute.query.redirect);
  },
  { immediate: true }
);

const handleLogin = () => {
  loginRef.value?.validate(async (valid: boolean, fields: any) => {
    if (!valid) {
      console.log('error submit!', fields);
      return;
    }

    loading.value = true;
    loginForm.value.tenantId = '000000';
    const [err] = await to(userStore.login(loginForm.value));
    if (!err) {
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
  }
};

onMounted(() => {
  getCode();
});
</script>

<style lang="scss" scoped>
.auth-page {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  background:
    linear-gradient(135deg, rgba(16, 40, 32, 0.96), rgba(24, 52, 47, 0.94)),
    repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.045) 0 1px, transparent 1px 96px),
    repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.035) 0 1px, transparent 1px 96px);
}

.login-shell {
  width: min(420px, 100%);
}

.login-brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
  color: #fff;
}

.login-brand strong,
.login-brand small {
  display: block;
}

.login-brand strong {
  font-size: 16px;
  font-weight: 700;
}

.login-brand small {
  margin-top: 2px;
  color: rgba(255, 255, 255, 0.68);
  font-size: 12px;
  letter-spacing: 0;
}

.logo-mark {
  width: 34px;
  height: 34px;
  border-radius: 6px;
  background: linear-gradient(135deg, #1f8f6a, #1677ff);
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.22),
    0 8px 18px rgba(0, 0, 0, 0.16);
}

.login-card {
  width: 100%;
  padding: 34px 32px 26px;
  border: 1px solid rgba(255, 255, 255, 0.52);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.97);
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.24);
}

.login-card-head {
  margin-bottom: 22px;
  text-align: center;
}

.portal-tag {
  display: inline-flex;
  align-items: center;
  height: 26px;
  padding: 0 10px;
  border: 1px solid #cdeadd;
  border-radius: 6px;
  background: #eaf8f1;
  color: #157656;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
}

.portal-tag::before {
  content: '';
  display: inline-block;
  width: 6px;
  height: 6px;
  margin-right: 6px;
  border-radius: 50%;
  background: #1f8f6a;
}

.login-card h2 {
  margin: 12px 0 0;
  color: #1f2937;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0;
}

.login-card p {
  margin: 8px 0 0;
  color: #8a94a6;
  font-size: 13px;
  line-height: 1.6;
}

.field {
  margin-bottom: 14px;
}

.login-card :deep(.el-form-item__label) {
  justify-content: flex-start;
  height: auto;
  margin-bottom: 6px;
  color: #4b5563;
  font-weight: 500;
  line-height: 1.5;
}

.login-card :deep(.el-form-item) {
  display: block;
}

.login-card :deep(.el-input__wrapper) {
  min-height: 36px;
  border-radius: 6px;
  background: #fff;
  box-shadow: 0 0 0 1px #d6dce5 inset;
}

.login-card :deep(.el-input.is-focus .el-input__wrapper) {
  box-shadow:
    0 0 0 1px #1f8f6a inset,
    0 0 0 3px rgba(31, 143, 106, 0.14);
}

.captcha-field {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 104px;
  gap: 8px;
}

.captcha-img {
  height: 36px;
  border: 1px solid #b9d9ca;
  border-radius: 8px;
  background:
    linear-gradient(135deg, rgba(31, 143, 106, 0.14), rgba(22, 119, 255, 0.1)),
    repeating-linear-gradient(-35deg, transparent 0 8px, rgba(31, 143, 106, 0.1) 8px 10px), #f7fbf9;
  color: #0f5f47;
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

.login-submit {
  width: 100%;
  height: 40px;
  margin-top: 14px;
  border-radius: 6px;
  font-weight: 700;
}

.login-support {
  display: flex;
  justify-content: center;
  gap: 14px;
  margin-top: 18px;
  color: #8a94a6;
  font-size: 12px;
}

.login-support a {
  color: #1677ff;
  font-weight: 600;
}

@media (max-width: 720px) {
  .auth-page {
    padding: 32px 18px;
  }

  .login-card {
    padding: 28px 22px 22px;
  }

  .login-support {
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }
}
</style>
