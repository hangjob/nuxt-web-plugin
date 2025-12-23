# 安全与加密

模块内置了一套基于 Web Crypto API 的安全工具，涵盖了从数据加密、接口签名到安全存储的常见场景。

## API 请求签名 (API Signature)

> 新增功能 (v1.1+)

为了防止接口被恶意调用、篡改或重放，插件提供了自动 API 签名功能。开启后，每个请求都会自动携带身份凭证和签名信息。

### 1. 开启配置

在 `nuxt.config.ts` 中配置：

```typescript
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      webPlugin: {
        security: {
          apiSignature: {
            enabled: true,
            // 推荐模式：AES-GCM (Token 模式)
            algorithm: 'AES-GCM', 
            appKey: 'my-app-id',
            appSecret: 'your-secure-password-must-be-long',
            headerPrefix: 'X-Hmac-' // 默认头前缀
          }
        }
      }
    }
  }
})
```

### 2. 请求头结构

开启后，所有通过 `useApiClient` 发起的请求都会自动携带以下 Header：

| Header 字段 | 说明 | 示例 |
| --- | --- | --- |
| `X-Hmac-Algorithm` | 签名使用的算法 | `AES-GCM` |
| `X-Hmac-Key` | 你的 AppKey (身份标识) | `my-app-id` |
| `X-Hmac-Timestamp` | 请求生成时间戳 | `1703581234567` |
| `X-Hmac-Nonce` | 随机数 (防重放) | `a1b2c3d4...` |
| `X-Hmac-Signature` | **核心签名串** (加密后的 Token) | `base64_string...` |

### 3. 后端验证逻辑

后端验证非常简单：只需要解密 `X-Hmac-Signature`，并验证其中的 JSON 内容即可。

解密后的明文 Token 数据结构：
```json
{
  "timestamp": "1703581234567",
  "nonce": "a1b2c3d4e5f6...",
  "appKey": "my-app-id"
}
```

#### Node.js 解密示例

```javascript
const crypto = require('crypto');

async function decryptSignature(encryptedBase64, password) {
    try {
        const combined = Buffer.from(encryptedBase64, 'base64');
        const iv = combined.subarray(combined.length - 12);
        const encryptedData = combined.subarray(0, combined.length - 12);
        
        // 派生密钥 (PBKDF2)
        const salt = Buffer.alloc(16);
        const passwordBuffer = Buffer.from(password);
        for (let i = 0; i < 16; i++) {
            salt[i] = passwordBuffer[i % passwordBuffer.length];
        }
        
        const key = await new Promise((resolve, reject) => {
            crypto.pbkdf2(password, salt, 100000, 32, 'sha256', (err, derivedKey) => {
                if (err) reject(err); else resolve(derivedKey);
            });
        });

        const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
        
        // 分离 Tag (WebCrypto 默认在密文末尾16字节)
        const tag = encryptedData.subarray(encryptedData.length - 16);
        const text = encryptedData.subarray(0, encryptedData.length - 16);
        
        decipher.setAuthTag(tag);
        let decrypted = decipher.update(text, 'binary', 'utf8');
        decrypted += decipher.final('utf8');

        return JSON.parse(decrypted);
    } catch (e) {
        return null;
    }
}
```

#### PHP (ThinkPHP 8) 解密示例

在 PHP 中，我们需要手动处理 PBKDF2 密钥派生和 AES-GCM 的 Tag 分离。

```php
<?php
namespace app\common;

class ApiSecurity
{
    /**
     * 解密前端传来的 X-Hmac-Signature
     * @param string $signature Base64 字符串
     * @param string $secret    AppSecret
     * @return array|null       解密后的数组或 null
     */
    public static function decryptSignature(string $signature, string $secret): ?array
    {
        try {
            // 1. Base64 解码
            $encryptedRaw = base64_decode($signature);
            if ($encryptedRaw === false) {
                return null;
            }

            // 2. 提取 IV (最后 12 字节)
            $ivLength = 12;
            $iv = substr($encryptedRaw, -$ivLength);
            
            // 3. 提取 Ciphertext (去除 IV)
            // 注意：Web Crypto API 的结果是 Ciphertext + Tag + IV
            // 但 PHP openssl_decrypt 需要 Tag 单独传入，且 Ciphertext 不包含 Tag
            $dataWithTag = substr($encryptedRaw, 0, -$ivLength);
            
            // 4. 提取 Tag (AES-GCM Tag 通常为 16 字节，位于 Ciphertext 末尾)
            $tagLength = 16;
            $tag = substr($dataWithTag, -$tagLength);
            $ciphertext = substr($dataWithTag, 0, -$tagLength);

            // 5. 派生密钥 (PBKDF2) - 模拟前端逻辑
            // 前端逻辑：如果没有提供 salt，则使用 password 填充 16 字节作为 salt
            $salt = '';
            $passwordBytes = array_values(unpack('C*', $secret)); // 转为字节数组
            $len = count($passwordBytes);
            for ($i = 0; $i < 16; $i++) {
                $salt .= chr($passwordBytes[$i % $len]);
            }

            // 使用 PBKDF2 生成 32 字节 (256位) 密钥
            // algo: sha256, iterations: 100000
            $key = hash_pbkdf2("sha256", $secret, $salt, 100000, 32, true);

            // 6. 执行解密
            // openssl_decrypt 对于 gcm 模式，tag 是引用传出参数用于加密，传入参数用于解密
            $decrypted = openssl_decrypt(
                $ciphertext, 
                'aes-256-gcm', 
                $key, 
                OPENSSL_RAW_DATA, 
                $iv, 
                $tag
            );

            if ($decrypted === false) {
                return null;
            }

            return json_decode($decrypted, true);

        } catch (\Exception $e) {
            // Log::error('Decrypt failed: ' . $e->getMessage());
            return null;
        }
    }
}
```

**控制器使用示例：**

```php
public function index()
{
    $signature = request()->header('X-Hmac-Signature');
    $secret = 'your-secure-password-must-be-long';

    $token = ApiSecurity::decryptSignature($signature, $secret);

    if (!$token) {
        return json(['code' => 403, 'msg' => 'Invalid Signature']);
    }

    // 1. 校验时间戳 (5分钟有效期)
    if (time() * 1000 - $token['timestamp'] > 5 * 60 * 1000) {
        return json(['code' => 403, 'msg' => 'Token Expired']);
    }

    // 2. 校验 AppKey
    if ($token['appKey'] !== 'my-app-id') {
        return json(['code' => 403, 'msg' => 'Invalid AppKey']);
    }

    return json(['code' => 200, 'msg' => 'Success']);
}
```

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
