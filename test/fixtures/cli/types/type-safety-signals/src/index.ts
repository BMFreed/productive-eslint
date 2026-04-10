enum Status {
  Ready = 'ready',
}

const parseName = (name: string): string => name.trim()

export const parseUnsafeName = (value: any): string => parseName(value)

export const compareStatus = (value: string): boolean => value === Status.Ready

export const negateUnsafeValue = (value: string): number => -value

export const describeObject = (value: { id: number }): string => `${value}`
