interface IUser {
  name: string
}

export const formatUserName = (user: IUser): string => {
  if (user) {
    return user.name.trim()
  }

  return 'Anonymous'
}
