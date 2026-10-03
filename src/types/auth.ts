



 export   type AuthUser = {
    userId: number;
    role: string;
};

export type AuthCredentials = {
    email: string;
    password: string;
}
export type SignUpUser = {
    id: number;
    email: string;
    role: string;
}
export type LoginUser = {
    id: number;
    email: string;
    role: string;
    password: string;
}