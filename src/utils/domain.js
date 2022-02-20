
export const getDomain = async (user) => {
    const url = new URL(process.env.WEB_ORIGIN)
    const { protocol, host } = url

    return `${protocol}//${key}.${host}`
}
