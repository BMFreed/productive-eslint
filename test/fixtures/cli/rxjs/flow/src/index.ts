import { Observable, ReplaySubject, Subject, of, throwError } from 'rxjs'
import { map, takeUntil } from 'rxjs/operators'

export const exposed$ = new Subject<number>()

export const run = (input$: Observable<number>): void => {
  const destroy$ = new Subject<void>()
  const replay$ = new ReplaySubject<number>()

  console.log(replay$)

  input$.subscribe((value) => {
    of(value + 1).subscribe()
  })

  of(1).subscribe(async (value) => {
    await Promise.resolve(value)
  })

  of(1)
    .pipe(
      takeUntil(destroy$),
      map((value) => value + 1),
    )
    .subscribe()

  destroy$.unsubscribe()
  throwError('failed')
  of(1).toPromise()
}
