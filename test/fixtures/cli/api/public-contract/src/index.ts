export let mutableCounter = 0

export const readValue = (value: any) => value

export default function createClient() {
  return { ready: true }
}
