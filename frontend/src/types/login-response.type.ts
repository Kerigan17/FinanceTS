export type LoginResponseType = {
    error: boolean,
    tokens?: {
        accessToken: string,
        refreshToken: string,
    },
    user?: {
        name: string,
        lastName: string,
        id: number,
    },
    message: string
}