const cn = (...values: string[]) => values.join(' ')

const clsx = (...values: string[]) => values.join(' ')

const classnames = (...values: string[]) => values.join(' ')

const cva = (...values: string[]) => values.join(' ')

const card = cva('custom-card text-sm')

export const App = () => (
  <main>
    <div className="app-shell p-4">attribute</div>
    <div className={cn('badge-pill text-sm')}>cn</div>
    <div className={clsx('status-chip text-sm')}>clsx</div>
    <div className={classnames('panel-frame rounded')}>classnames</div>
    <div className={card}>cva</div>
  </main>
)
