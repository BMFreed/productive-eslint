import { useEffect } from 'react'

const items = ['one', 'two', 'three']
const html = '<strong>unsafe</strong>'

export const App = ({ count }: { count: number }) => {
  const NestedRow = ({ value }: { value: string }) => <span>{value}</span>

  useEffect(() => {
    console.log(count)
  }, [])

  return (
    <main>
      <img src="/logo.png" />
      <a href="#" />
      <div dangerouslySetInnerHTML={{ __html: html }} />
      <div role="checkbox" />
      {count && <section>counted</section>}
      <ul>
        {items.map((value, index) => (
          <li key={index}>
            <NestedRow value={value} />
          </li>
        ))}
      </ul>
    </main>
  )
}
