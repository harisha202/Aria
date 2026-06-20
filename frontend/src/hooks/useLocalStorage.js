import { useCallback, useState } from 'react'

const canUseStorage = () => typeof window !== 'undefined' && Boolean(window.localStorage)

const readStorageValue = (key, initialValue) => {
  if (!canUseStorage()) {
    return typeof initialValue === 'function' ? initialValue() : initialValue
  }

  try {
    const item = window.localStorage.getItem(key)
    if (item !== null) return JSON.parse(item)
  } catch {
    window.localStorage.removeItem(key)
  }

  return typeof initialValue === 'function' ? initialValue() : initialValue
}

export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => readStorageValue(key, initialValue))

  const setValue = useCallback(
    (value) => {
      setStoredValue((currentValue) => {
        const nextValue = typeof value === 'function' ? value(currentValue) : value

        if (canUseStorage()) {
          window.localStorage.setItem(key, JSON.stringify(nextValue))
        }

        return nextValue
      })
    },
    [key],
  )

  const removeValue = useCallback(() => {
    if (canUseStorage()) {
      window.localStorage.removeItem(key)
    }

    setStoredValue(typeof initialValue === 'function' ? initialValue() : initialValue)
  }, [initialValue, key])

  return [storedValue, setValue, removeValue]
}

export default useLocalStorage
