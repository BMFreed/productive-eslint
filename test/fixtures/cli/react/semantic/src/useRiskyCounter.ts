import { useEffect, useMemo, useRef, useState } from 'react'

let renderCounter = 0

export const useRiskyCounter = () => {
  const [count, setCount] = useState(0)
  const counterRef = useRef(0)

  renderCounter += 1
  counterRef.current = count
  setCount(count + 1)

  useEffect(() => {
    setCount(count + 1)
  }, [count])

  useMemo(() => {
    renderCounter += count
  }, [count])

  return counterRef.current
}
