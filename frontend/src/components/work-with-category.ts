import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";

export class WorkWithCategory {
    private inputValue: string | null;
    readonly createInput: HTMLInputElement | null;
    readonly createItem: HTMLElement | null;
    readonly page: 'income' | 'expense';

    constructor(page: 'income' | 'expense') {
        this.inputValue = null;
        this.createInput = document.getElementById('create-input') as HTMLInputElement;
        this.createItem = document.getElementById('create-item');
        this.page = page;

        if (this.createItem) {
            this.createItem.onclick = () => {
                if (this.createInput) {
                    this.inputValue = this.createInput.value;
                    if (this.inputValue !== null) {
                        this.createNewCategory(this.inputValue);
                    }
                }
            }
        }
    }
    private async createNewCategory(value: string): Promise<void> {
        try {
            await CustomHttp.request(config.host + '/categories/' + this.page, 'POST', {
                title: value
            });
            location.href = '#/' + this.page;
        } catch (error) {
            console.log(error);
        }
    }
}