import { MnemomicT, Wallet, WalletT, KeystoreT, Network, SigningKeychain } from '@radixdlt/application'
import AsyncStorage from '@react-native-async-storage/async-storage';
import crypto from 'crypto'
import Clipboard from '@react-native-community/clipboard';
import { Mnemonic, StrengthT } from '@radixdlt/application'


var mnemonic = Mnemonic.generateNew({ strength: StrengthT.WORD_COUNT_12 })
mnemonic.words;

const storeData = async (value) => {
  try {
    const jsonValue = JSON.stringify(value)
    await AsyncStorage.setItem('@keystore', jsonValue)
  } catch (e) {
    // saving error
  }
}


const storePinData = async (value) => {
  try {
    await AsyncStorage.setItem('@pin', value)
  } catch (e) {
    // saving error
  }
}

const getData = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem('@keystore')
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch(e) {
    // error reading value
  }
}

const getPinData = async () => {
  try {
    const value = await AsyncStorage.getItem('@pin')
    if(value !== null) {
      return value;
    }
  } catch(e) {
    // error reading value
  }
}

export const initWallet = async (mnemonic: MnemomicT, passcode: string, network: Network): Promise<WalletT> => {
  const walletResult = await SigningKeychain.byEncryptingMnemonicAndSavingKeystore({
    mnemonic,
    password: passcode,
    save: (keystore: KeystoreT): Promise<void> => {
      return storeData(keystore)
    }
  })

  if (walletResult.isErr()) {
    console.log(`🤷‍♂️ Failed to create wallet: ${walletResult.error}`)
    throw walletResult.error
  }

  const signingKeychain = walletResult.value

  return Wallet.create({
    signingKeychain,
    network
  })
}

export const hasKeystore = (): Promise<boolean> => new Promise((resolve) => {
  getData()
    .then((json: string | undefined) => {
      return resolve(!!json)
    })
})

export const touchKeystore = (): Promise<KeystoreT> => new Promise((resolve) => {
  getData()
    .then((json: string) => {
      resolve(JSON.parse(json))
    })
})

export const copyToClipboard = (text: string) => {}
// Clipboard.setString(text)


const digestPin = async (pin: string) =>
  crypto
    .createHash('sha256')
    .update(pin)
    .digest('hex')

// export const storePin = (pin: string): Promise<string> => new Promise((resolve) => {

//   digestPin(pin).then((hash: string) => { storePinData(hash)
// })})

// export const validatePin = (pin: string): Promise<boolean> => new Promise((resolve) => {
//   digestPin(pin).then((inputHash: string) => getPinData().then(value => {value === inputHash}))
// })
