import {Auth} from "../services/auth";
import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {UserInfoType} from "../types/user-info.type";
import {BalanceType} from "../types/balance.type";

export class UserInfo {
    readonly userInfo: UserInfoType | null;
    readonly accessToken: string | null;
    readonly fullName: HTMLElement | null;
    readonly balance: HTMLElement | null;
    private newBalanceValue: number;
    readonly balanceValueItem: HTMLInputElement | null;
    constructor() {
        this.fullName = document.getElementById('fullname');
        this.balance = document.getElementById('balance');
        this.userInfo = Auth.getUserInfo();
        this.accessToken = localStorage.getItem(Auth.accessTokenKey);
        this.newBalanceValue = 0;

        this.balanceValueItem = document.getElementById('balance-value') as HTMLInputElement;
        const balanceItem: HTMLElement | null = document.getElementById('balance-item');
        const balancePopup: HTMLElement | null = document.getElementById('popup-balance');
        const balanceBtn: HTMLElement | null = document.getElementById('balance-btn');
        const balanceCancel: HTMLElement | null = document.getElementById('balance-cancel');
        const balanceSpan: HTMLElement | null = document.getElementById('balance');

        const that: UserInfo = this;

        if (!balanceItem || !this.balanceValueItem || !balancePopup
            || !balanceBtn || !balanceCancel || !balanceSpan) {
            if (window.location.hash === '#/login') {
                return;
            } else {
                window.location.href = '#/login';
                return;
            }
        }

        let balanceValue = null;

        balanceItem.onclick = () => {
            balanceValue = Number(balanceSpan.innerText);
            balancePopup.style.display = 'flex';
            if (that.balanceValueItem) {
                that.balanceValueItem.value = balanceValue.toString();
            }
        }

        balanceBtn.onclick = () => {
            balancePopup.style.display = 'none';
            if (that.balanceValueItem) {
                this.newBalanceValue = Number(that.balanceValueItem.value);
            }
            this.updateBalance();
        }

        balanceCancel.onclick = () => {
            balancePopup.style.display = 'none';
        }

        this.getUserInfo();
        this.getBalance();
    }

    private getUserInfo(): void {
        if (this.fullName) {
            this.userInfo && this.accessToken ? this.fullName.innerText = this.userInfo.fullName : this.fullName.innerText = 'Нет данных';
        }
    }

    private async getBalance(): Promise<void> {
        if (this.balance) {
            try {
                const response: BalanceType = await CustomHttp.request(config.host + '/balance', 'GET', )
                if (response) {
                    this.balance.innerText = response.balance.toString();
                }
            } catch (error) {
                console.log(error);
            }
        }
    }

    private async updateBalance(): Promise<void> {
        try {
            const response: BalanceType = await CustomHttp.request(config.host + '/balance', 'PUT',{
                newBalance: this.newBalanceValue
            });
            const balanceElement: HTMLElement | null = document.getElementById('balance');
            if (balanceElement) {
                balanceElement.innerText = response.balance.toString();
            }
        } catch (error) {
            console.log(error);
        }
    }
}