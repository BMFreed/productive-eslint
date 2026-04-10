import { Observable, of } from 'rxjs'

export const load = () => of(1).toPromise()

export const createLegacyStream = () =>
  Observable.create((subscriber: { next: (value: number) => void }) => {
    subscriber.next(1)
  })

/** @deprecated use load instead. */
export const legacyLoad = () => of(2)

export const loadThroughDeprecatedAlias = () => legacyLoad()
