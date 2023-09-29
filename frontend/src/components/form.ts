import {CustomHttp} from "../services/custom-http";
import {Auth} from "../services/auth";
import config from "../../config/config";
import {FormFieldType} from "../types/form-field.type";
import { SignUpResponseType } from "../types/signup-response.type";
import {LoginResponseType} from "../types/login-response.type";

export class Form {
    processElement: HTMLElement | null;
    passwordOne: HTMLInputElement | null;
    passwordTwo: HTMLInputElement | null;
    page: 'login' | 'signup';
    rememberMe: HTMLInputElement | null;
    fields: FormFieldType[] = [];


    constructor(page: 'login' | 'signup') {
        this.processElement = null;
        this.passwordOne = null;
        this.passwordTwo = null;
        this.page = page;
        this.rememberMe = null;
        this.fields = [
            {
                name: 'email',
                id: 'email',
                element: null,
                regex: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                valid: false
            },
            {
                name: 'password',
                id: 'password',
                element: null,
                regex: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/,
                valid: false
            }
        ]

        let that: Form = this;

        this.rememberMe = document.getElementById('flexCheckDefault') as HTMLInputElement;

        this.processElement = document.getElementById('process');
        if (this.processElement) {
            this.processElement.onclick = () => {
                that.processForm();
            };
        }

        //если signup
        if (this.page === 'signup') {
            this.fields.push(
                {
                    name: 'fio',
                    id: 'fio',
                    element: null,
                    regex: /^[А-ЯЁ][а-яё]+ [А-ЯЁ][а-яё]+ [А-ЯЁ][а-яё]+$/,
                    valid: false
                },
                {
                    name: 'passwordRepeat',
                    id: 'passwordRepeat',
                    element: null,
                    regex: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/,
                    valid: false
                }
            );

            if (this.processElement) {
                this.processElement.onclick = () => {
                    if (!that.passwordsChecked()) {
                        alert('Пароли не совпадают')
                    } else {
                        alert('Регистрация завершена')
                        that.processForm();
                    }
                };
            }
        }

        this.fields.forEach((item: FormFieldType): void => {
            item.element = document.getElementById(item.id) as HTMLInputElement;
            if (item.element) {
                item.element.onchange = function (): void  {
                    that.validateField.call(that, item, <HTMLInputElement>this);
                }
            }
        });

        if (document.cookie !== '' && this.page === 'login') {
            this.autoFillForm();
        }
    }

    private passwordsChecked(): boolean {
        this.passwordOne = document.getElementById('password') as HTMLInputElement;
        this.passwordTwo = document.getElementById('passwordRepeat') as HTMLInputElement;

        if (this.passwordOne && this.passwordTwo) {
            return this.passwordOne.value === this.passwordTwo.value
        } else {
            return false;
        }
    }

    private validateField(field: FormFieldType, element: HTMLInputElement): void {
        if (!element.value || !element.value.match(field.regex)) {
            element.style.borderColor = 'red';
            field.valid = false;
        } else {
            element.removeAttribute('style');
            field.valid = true;
        }
        this.validateForm();
    }

    private validateForm(): boolean {
        let validForm: boolean = false;

        if (this.fields) {
            validForm = this.fields.every((item: FormFieldType) => item.valid);

            if (this.processElement) {
                if (validForm) {
                    this.processElement.removeAttribute('disabled')
                } else {
                    this.processElement.setAttribute('disabled', 'disabled')
                }
            }
        }

        return validForm;
    }

    private async processForm(): Promise<void> {
        if (this.validateForm()) {
            if (this.page === 'signup') {
                try {
                    const result: SignUpResponseType = await CustomHttp.request(config.host + '/signup', 'POST', {
                        name: this.fields.find(item => item.name === 'fio')?.element?.value.split(' ')[1],
                        lastName: this.fields.find(item => item.name === 'fio')?.element?.value.split(' ')[0],
                        email: this.fields.find(item => item.name === 'email')?.element?.value,
                        password: this.fields.find(item => item.name === 'password')?.element?.value,
                        passwordRepeat: this.fields.find(item => item.name === 'passwordRepeat')?.element?.value,
                    });

                    if (result) {
                        if (result.error || !result.user) {
                            throw new Error(result.message);
                        }
                        location.href = '#/home';
                        return;
                    }
                } catch (error) {
                    console.log(error);
                }
            } else {
                try {
                    const emailElement: FormFieldType = this.fields.find((item: FormFieldType): boolean => item.name === 'email') as FormFieldType;
                    const emailElementElement: HTMLInputElement = emailElement.element as HTMLInputElement;
                    const email: string = emailElementElement.value;

                    const result: LoginResponseType = await CustomHttp.request(config.host + '/login', 'POST', {
                        email: email,
                        password: this.fields.find((item: FormFieldType): boolean => item.name === 'password')?.element?.value,
                        rememberMe: this.rememberMe?.checked
                    });

                    if (this.rememberMe) {
                        if (this.rememberMe.checked){
                            document.cookie = "email" + "=" + this.fields.find((item: FormFieldType): boolean => item.name === 'email')?.element?.value + "; path=" + config.host + "/login";
                            document.cookie = "password" + "=" + this.fields.find((item: FormFieldType): boolean => item.name === 'password')?.element?.value + "; path=" + config.host + "/login";
                        } else {
                            this.cookiesDelete();
                        }
                    }

                    if (result) {
                        if (result.error || !result.user || !result.tokens?.refreshToken || !result.tokens?.accessToken) {
                            throw new Error(result.message);
                        }
                        Auth.setUserInfo({
                            fullName: `${result.user.name} ${result.user.lastName}`,
                            userId: result.user.id,
                            email: email
                        })
                        Auth.setTokens(result.tokens.accessToken, result.tokens.refreshToken);
                        location.href = '#/home';
                        return;
                    }
                } catch (error) {
                    console.log(error);
                }
            }
        }
    }

    public async refreshToken(): Promise<void>{
        try {
            const response: Response = await CustomHttp.request(config.host + '/refresh', 'POST', {
                refreshToken: localStorage.getItem('refreshToken')
            });

            if (response.status < 200 || response.status >= 300) {
                throw new Error(response.statusText);
            }

            const result = await response.json();
            if (result) {
                if (result.error || !result.user) {
                    throw new Error(result.message);
                }

                localStorage.setItem("accessToken", result.tokens.accessToken)
                localStorage.setItem("refreshToken", result.tokens.refreshToken)

                location.href = '#/home';
                return;
            }
        } catch (error) {
            console.log(error);
        }
    }

    private cookiesDelete(): void {
        let cookies: string[] = document.cookie.split(";");

        for (let i: number = 0; i < cookies.length; i++) {
            let cookie: string = cookies[i];
            let eqPos: number = cookie.indexOf("=");
            let name: string = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;";
            document.cookie = name + '=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        }
    }

    private getCookie(name: string): string | undefined {
        let matches = document.cookie.match(new RegExp(
            "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));

        return matches ? decodeURIComponent(matches[1]) : undefined;
    }

    private autoFillForm(): void {
        let emailValue: string | undefined = this.fields.find(item => item.name === 'email')?.element?.value;
        let passwordValue: string | undefined = this.fields.find(item => item.name === 'password')?.element?.value;

        if (emailValue && passwordValue) {
            emailValue = this.getCookie('email');
            passwordValue = this.getCookie('password');
        }


        if (this.rememberMe) {
            this.rememberMe.setAttribute('checked', 'checked');
        }
        if (this.processElement) {
            this.processElement.removeAttribute('disabled');
        }

        this.fields.forEach(item => item.valid = true)
    }
}