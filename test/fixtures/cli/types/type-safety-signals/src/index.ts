enum Status {
  Ready = 'ready',
}

type ViewMode = 'compact' | 'expanded'

const parseName = (name: string): string => name.trim()

export const parseUnsafeName = (value: any): string => parseName(value)

export const compareStatus = (value: string): boolean => value === Status.Ready

export const negateUnsafeValue = (value: string): number => -value

export const describeObject = (value: { id: number }): string => `${value}`

export const formatMode = (mode: ViewMode): string => {
  switch (mode) {
    case 'compact':
      return 'Compact'
  }
}

class Formatter {
  private readonly prefix = 'value:'

  format(value: string): string {
    return `${this.prefix}${value}`
  }
}

const formatter = new Formatter()

export const formatValue = formatter.format
