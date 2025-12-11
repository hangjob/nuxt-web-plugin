# 安全与加密

模块内置了一套基于 Web Crypto API 的安全工具，涵盖了从数据加密到安全存储的常见场景。

## 对称加密 (Symmetric Crypto)

使用 `useSymmetricCrypto` 进行 AES-GCM 加密。适用于对敏感文本数据进行加密。

```typescript
const { encrypt, decrypt, generateKey } = useSymmetricCrypto()

// 1. 准备密钥（可以是用户密码或随机生成的 Key）
const password = 'my-secret-password'

// 2. 加密
const encryptedData = await encrypt('敏感信息', password)
// 输出: base64字符串 (包含密文+IV)

// 3. 解密
const originalData = await decrypt(encryptedData, password)
```

## 非对称加密 (Asymmetric Crypto)

使用 `useAsymmetricCrypto` 进行 RSA-OAEP 加解密及签名。

```typescript
const { 
  generateKeyPair, 
  encrypt, 
  decrypt, 
  sign, 
  verify 
} = useAsymmetricCrypto()

// 生成密钥对
const { publicKey, privateKey } = await generateKeyPair()
// 导出为 PEM 格式字符串以便传输或存储
const pubPem = await exportPublicKey(publicKey)
const privPem = await exportPrivateKey(privateKey)

// 加密 (使用公钥)
const secret = await encrypt('Hello', pubPem)

// 解密 (使用私钥)
const message = await decrypt(secret, privPem)
```

## 哈希工具 (Hash)

```typescript
const { sha256, sha512, md5, generateSalt, hashWithSalt } = useHash()

const hash = await sha256('password')
const salt = generateSalt() // 生成随机盐值
const saltedHash = await hashWithSalt('password', salt)
```

## 加密存储 (Encrypted Storage)

`useEncryption` 提供了对 `localStorage` and `cookie` 的封装，在写入时自动加密，读取时自动解密。

> **注意**: 加密存储依赖于客户端的密钥。虽然这能防止直接查看 Storage 中的明文，但如果攻击者获取了前端代码中的密钥，依然可以解密。建议结合非对称加密或动态密钥使用。

```typescript
const { setEncryptedItem, getEncryptedItem } = useEncryption()
const key = 'storage-key'

// LocalStorage
await setEncryptedItem('token', 'xyz-123', key)
const token = await getEncryptedItem('token', key)
```

## 场景实战：安全登录

结合**非对称加密**（传输密码）和**加密存储**（保存 Token）的完整流程。

```vue
<script setup lang="ts">
import { ref } from 'vue'

const { post } = useApiClient()
const { encrypt } = useAsymmetricCrypto()
const { setEncryptedCookie } = useEncryption()

const username = ref('')
const password = ref('')

// 后端提供的公钥
const SERVER_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
...
-----END PUBLIC KEY-----`

const login = async () => {
  // 1. 前端使用公钥加密密码
  const encryptedPassword = await encrypt(password.value, SERVER_PUBLIC_KEY)

  // 2. 发送请求
  const res = await post('/login', {
    body: { username: username.value, password: encryptedPassword }
  })

  // 3. 加密存储 Token
  await setEncryptedCookie('token', res.token, 'local-secret', { secure: true })
}
</script>
```

