// No Vue imports needed for composables
import {useRuntimeConfig} from '#app'

/**
 * 对称加密组合式函数 (AES-GCM)
 */
export function useSymmetricCrypto() {
    const config = useRuntimeConfig()
    const cryptoConfig = config.public.webPlugin.security?.crypto

    /**
     * 生成随机密钥
     */
    const generateKey = async (keySize: number = cryptoConfig?.keySize || 256): Promise<CryptoKey> => {
        return await crypto.subtle.generateKey(
            {
                name: cryptoConfig?.algorithm || 'AES-GCM',
                length: keySize,
            },
            true,
            ['encrypt', 'decrypt']
        )
    }

    /**
     * 从字符串生成密钥
     */
    const deriveKeyFromPassword = async (
        password: string,
        salt?: Uint8Array
    ): Promise<CryptoKey> => {
        const encoder = new TextEncoder()
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            encoder.encode(password),
            'PBKDF2',
            false,
            ['deriveBits', 'deriveKey']
        )

        // 如果没有提供盐，从密码字符串生成确定性的盐
        // 这样相同的密码总是产生相同的密钥
        let saltValue: Uint8Array
        if (salt) {
            saltValue = salt
        } else {
            // 从密码生成确定性的16字节盐
            const passwordBytes = new TextEncoder().encode(password)
            saltValue = new Uint8Array(16)
            // 如果密码字节数不够16，重复填充
            for (let i = 0; i < 16; i++) {
                // @ts-ignore
                saltValue[i] = passwordBytes[i % passwordBytes.length]
            }
        }

        return await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                // @ts-ignore
                salt: saltValue,
                iterations: 100000,
                hash: 'SHA-256',
            },
            keyMaterial,
            {
                name: cryptoConfig?.algorithm || 'AES-GCM',
                length: cryptoConfig?.keySize || 256,
            },
            false,
            ['encrypt', 'decrypt']
        )
    }

    /**
     * 加密数据
     */
    const encrypt = async (
        data: string,
        keyString: string,
        additionalData?: string
    ): Promise<string> => {
        const encoder = new TextEncoder()
        const dataBuffer = encoder.encode(data)

        const iv = crypto.getRandomValues(new Uint8Array(12)) // 96-bit IV for GCM

        // 从字符串生成密钥
        const cryptoKey = await deriveKeyFromPassword(keyString)

        const algorithmParams: any = {
            name: cryptoConfig?.algorithm || 'AES-GCM',
            iv: iv,
        }

        if (additionalData) {
            algorithmParams.additionalData = encoder.encode(additionalData)
        }

        const encrypted = await crypto.subtle.encrypt(
            algorithmParams,
            cryptoKey,
            dataBuffer
        )

        // 将加密数据和 IV 组合并转换为 base64 字符串
        const combined = new Uint8Array(encrypted.byteLength + iv.length)
        combined.set(new Uint8Array(encrypted), 0)
        combined.set(iv, encrypted.byteLength)

        return btoa(String.fromCharCode(...combined))
    }

    /**
     * 解密数据
     */
    const decrypt = async (
        encryptedData: string,
        keyString: string,
        additionalData?: string
    ): Promise<string> => {
        try {
            // 从 base64 字符串解析加密数据和 IV
            const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0))

            // 分离加密数据和 IV (IV 是 12 字节，在末尾)
            const iv = combined.slice(-12)
            const encrypted = combined.slice(0, -12)

            // 从字符串生成密钥
            const cryptoKey = await deriveKeyFromPassword(keyString)

            const algorithmParams: any = {
                name: cryptoConfig?.algorithm || 'AES-GCM',
                iv: iv,
            }

            if (additionalData) {
                algorithmParams.additionalData = new TextEncoder().encode(additionalData)
            }

            const decrypted = await crypto.subtle.decrypt(
                algorithmParams,
                cryptoKey,
                encrypted
            )

            const decoder = new TextDecoder()
            return decoder.decode(decrypted)
        } catch (error) {
            throw new Error('Decryption failed: Invalid key, IV, or data')
        }
    }

    /**
     * 导出密钥为字符串 (用于存储)
     */
    const exportKey = async (key: CryptoKey): Promise<string> => {
        const exported = await crypto.subtle.exportKey('raw', key)
        return btoa(String.fromCharCode(...new Uint8Array(exported)))
    }

    /**
     * 从字符串导入密钥
     */
    const importKey = async (keyString: string): Promise<CryptoKey> => {
        const keyData = Uint8Array.from(atob(keyString), c => c.charCodeAt(0))

        return await crypto.subtle.importKey(
            'raw',
            keyData,
            {
                name: cryptoConfig?.algorithm || 'AES-GCM',
            },
            false,
            ['encrypt', 'decrypt']
        )
    }

    return {
        generateKey,
        deriveKeyFromPassword,
        encrypt,
        decrypt,
        exportKey,
        importKey,
    }
}

/**
 * 非对称加密组合式函数 (RSA-OAEP)
 */
export function useAsymmetricCrypto() {
    /**
     * 生成RSA密钥对
     */
    const generateKeyPair = async (
        keySize: number = 2048
    ): Promise<CryptoKeyPair> => {
        return await crypto.subtle.generateKey(
            {
                name: 'RSA-OAEP',
                modulusLength: keySize,
                publicExponent: new Uint8Array([1, 0, 1]), // 65537
                hash: 'SHA-256',
            },
            true,
            ['encrypt', 'decrypt']
        )
    }

    /**
     * 使用公钥加密
     */
    const encrypt = async (
        data: string,
        publicKeyString: string
    ): Promise<string> => {
        const encoder = new TextEncoder()
        const dataBuffer = encoder.encode(data)

        // 从字符串导入公钥
        const publicKey = await importPublicKey(publicKeyString)

        const encrypted = await crypto.subtle.encrypt(
            {
                name: 'RSA-OAEP',
            },
            publicKey,
            dataBuffer
        )

        // 返回base64编码的字符串
        return btoa(String.fromCharCode(...new Uint8Array(encrypted)))
    }

    /**
     * 使用私钥解密
     */
    const decrypt = async (
        encryptedData: string,
        privateKeyString: string
    ): Promise<string> => {
        try {
            // 从base64字符串解析加密数据
            const encrypted = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0))

            // 从字符串导入私钥
            const privateKey = await importPrivateKey(privateKeyString)

            const decrypted = await crypto.subtle.decrypt(
                {
                    name: 'RSA-OAEP',
                },
                privateKey,
                encrypted
            )

            const decoder = new TextDecoder()
            return decoder.decode(decrypted)
        } catch (error) {
            throw new Error('Decryption failed: Invalid key or data')
        }
    }

    /**
     * 导出公钥为PEM格式
     */
    const exportPublicKey = async (publicKey: CryptoKey): Promise<string> => {
        const exported = await crypto.subtle.exportKey('spki', publicKey)
        const exportedAsString = String.fromCharCode(...new Uint8Array(exported))
        const exportedAsBase64 = btoa(exportedAsString)

        return `-----BEGIN PUBLIC KEY-----\n${exportedAsBase64.match(/.{1,64}/g)?.join('\n')}\n-----END PUBLIC KEY-----`
    }

    /**
     * 导出私钥为PEM格式
     */
    const exportPrivateKey = async (privateKey: CryptoKey): Promise<string> => {
        const exported = await crypto.subtle.exportKey('pkcs8', privateKey)
        const exportedAsString = String.fromCharCode(...new Uint8Array(exported))
        const exportedAsBase64 = btoa(exportedAsString)

        return `-----BEGIN PRIVATE KEY-----\n${exportedAsBase64.match(/.{1,64}/g)?.join('\n')}\n-----END PRIVATE KEY-----`
    }

    /**
     * 从PEM格式导入公钥
     */
    const importPublicKey = async (pemKey: string): Promise<CryptoKey> => {
        const pemContents = pemKey
            .replace(/-----BEGIN PUBLIC KEY-----/, '')
            .replace(/-----END PUBLIC KEY-----/, '')
            .replace(/\s/g, '')

        const binaryDer = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0))

        return await crypto.subtle.importKey(
            'spki',
            binaryDer,
            {
                name: 'RSA-OAEP',
                hash: 'SHA-256',
            },
            true,
            ['encrypt']
        )
    }

    /**
     * 从PEM格式导入私钥
     */
    const importPrivateKey = async (pemKey: string): Promise<CryptoKey> => {
        const pemContents = pemKey
            .replace(/-----BEGIN PRIVATE KEY-----/, '')
            .replace(/-----END PRIVATE KEY-----/, '')
            .replace(/\s/g, '')

        const binaryDer = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0))

        return await crypto.subtle.importKey(
            'pkcs8',
            binaryDer,
            {
                name: 'RSA-OAEP',
                hash: 'SHA-256',
            },
            true,
            ['decrypt']
        )
    }

    /**
     * 生成数字签名
     */
    const sign = async (
        data: string,
        privateKeyString: string
    ): Promise<string> => {
        const encoder = new TextEncoder()
        const dataBuffer = encoder.encode(data)

        // 从字符串导入私钥
        const privateKey = await importPrivateKey(privateKeyString)

        const signature = await crypto.subtle.sign(
            'RSASSA-PKCS1-v1_5',
            privateKey,
            dataBuffer
        )

        // 返回base64编码的签名
        return btoa(String.fromCharCode(...new Uint8Array(signature)))
    }

    /**
     * 验证数字签名
     */
    const verify = async (
        data: string,
        signatureString: string,
        publicKeyString: string
    ): Promise<boolean> => {
        const encoder = new TextEncoder()
        const dataBuffer = encoder.encode(data)

        // 从字符串导入公钥
        const publicKey = await importPublicKey(publicKeyString)

        // 从base64字符串解析签名
        const signature = Uint8Array.from(atob(signatureString), c => c.charCodeAt(0))

        return await crypto.subtle.verify(
            'RSASSA-PKCS1-v1_5',
            publicKey,
            signature,
            dataBuffer
        )
    }

    return {
        generateKeyPair,
        encrypt,
        decrypt,
        exportPublicKey,
        exportPrivateKey,
        importPublicKey,
        importPrivateKey,
        sign,
        verify,
    }
}

/**
 * 哈希函数组合式函数
 */
export function useHash() {
    /**
     * 计算SHA-256哈希
     */
    const sha256 = async (data: string): Promise<string> => {
        const encoder = new TextEncoder()
        const dataBuffer = encoder.encode(data)

        const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
        const hashArray = Array.from(new Uint8Array(hashBuffer))

        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    }

    /**
     * 计算SHA-512哈希
     */
    const sha512 = async (data: string): Promise<string> => {
        const encoder = new TextEncoder()
        const dataBuffer = encoder.encode(data)

        const hashBuffer = await crypto.subtle.digest('SHA-512', dataBuffer)
        const hashArray = Array.from(new Uint8Array(hashBuffer))

        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    }

    /**
     * 计算MD5哈希 (使用SHA-256的子集实现)
     */
    const md5 = async (data: string): Promise<string> => {
        // MD5在Web Crypto API中不可用，这里使用一个简化的实现
        // 注意：这不是真正的MD5，仅用于兼容性
        const hash = await sha256(data)
        return hash.substring(0, 32) // 截取前32个字符
    }

    /**
     * 生成随机盐
     */
    const generateSalt = (length: number = 16): string => {
        const array = new Uint8Array(length)
        crypto.getRandomValues(array)
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
    }

    /**
     * 使用盐值进行哈希
     */
    const hashWithSalt = async (
        data: string,
        salt: string,
        algorithm: string = 'SHA-256'
    ): Promise<string> => {
        const saltedData = data + salt
        const encoder = new TextEncoder()
        const dataBuffer = encoder.encode(saltedData)

        const hashBuffer = await crypto.subtle.digest(algorithm, dataBuffer)
        const hashArray = Array.from(new Uint8Array(hashBuffer))

        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    }

    return {
        sha256,
        sha512,
        md5,
        generateSalt,
        hashWithSalt,
    }
}

/**
 * 加密存储组合式函数
 */
export function useEncryption() {
    const symmetric = useSymmetricCrypto()

    /**
     * 加密并存储到localStorage
     */
    const setEncryptedItem = async (
        key: string,
        value: string,
        password: string
    ): Promise<void> => {
        try {
            const encryptedString = await symmetric.encrypt(value, password)

            const data = {
                encrypted: encryptedString,
                timestamp: Date.now(),
            }

            localStorage.setItem(`encrypted_${key}`, JSON.stringify(data))
        } catch (error) {
            throw new Error(`Failed to encrypt and store item: ${error}`)
        }
    }

    /**
     * 从localStorage获取并解密
     */
    const getEncryptedItem = async (
        key: string,
        password: string
    ): Promise<string | null> => {
        try {
            const stored = localStorage.getItem(`encrypted_${key}`)
            if (!stored) return null

            const data = JSON.parse(stored)
            return await symmetric.decrypt(data.encrypted, password)
        } catch (error) {
            throw new Error(`Failed to retrieve and decrypt item: ${error}`)
        }
    }

    /**
     * 删除加密的localStorage项目
     */
    const removeEncryptedItem = (key: string): void => {
        localStorage.removeItem(`encrypted_${key}`)
    }

    /**
     * 加密Cookie
     */
    const setEncryptedCookie = async (
        name: string,
        value: string,
        password: string,
        options: {
            expires?: Date
            path?: string
            domain?: string
            secure?: boolean
            sameSite?: 'Strict' | 'Lax' | 'None'
        } = {}
    ): Promise<void> => {
        try {
            const encryptedValue = await symmetric.encrypt(value, password)

            let cookie = `${name}=${encryptedValue}`

            if (options.expires) {
                cookie += `; expires=${options.expires.toUTCString()}`
            }
            if (options.path) {
                cookie += `; path=${options.path}`
            }
            if (options.domain) {
                cookie += `; domain=${options.domain}`
            }
            if (options.secure) {
                cookie += '; secure'
            }
            if (options.sameSite) {
                cookie += `; samesite=${options.sameSite}`
            }

            document.cookie = cookie
        } catch (error) {
            throw new Error(`Failed to encrypt and set cookie: ${error}`)
        }
    }

    /**
     * 获取并解密Cookie
     */
    const getEncryptedCookie = async (
        name: string,
        password: string
    ): Promise<string | null> => {
        try {
            const cookies = document.cookie.split(';')
            const cookie = cookies.find(c => c.trim().startsWith(`${name}=`))

            if (!cookie) return null

            const encryptedValue = cookie.split('=')[1] || ''
            return await symmetric.decrypt(encryptedValue, password)
        } catch (error) {
            throw new Error(`Failed to get and decrypt cookie: ${error}`)
        }
    }

    return {
        setEncryptedItem,
        getEncryptedItem,
        removeEncryptedItem,
        setEncryptedCookie,
        getEncryptedCookie,
    }
}
