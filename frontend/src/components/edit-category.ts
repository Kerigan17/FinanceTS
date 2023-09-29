import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {CategoryResponseType} from "../types/category-response.type";

export class EditCategory {
    id: number;
    editBut: HTMLElement | null;
    editInput: HTMLInputElement | null;
    newValue: string | null;
    page: 'income' | 'expense';


    constructor(page: 'income' | 'expense') {
        this.id = Number(localStorage.getItem('id'));
        this.editBut = document.getElementById('create-item');
        this.editInput = document.getElementById('create-input') as HTMLInputElement;
        this.newValue = null;
        this.page = page;

        if (this.editBut) {
            this.editBut.innerText = 'Сохранить';

            this.editBut.onclick = ():void => {
                if (this.editInput) {
                    this.newValue = this.editInput.value;
                }
                this.editCategory()
            }
        }

        this.getCategory();
    }

    private async getCategory(): Promise<void> {
        try {
            const result: CategoryResponseType = await CustomHttp.request(config.host + '/categories/' + this.page + '/' + this.id, 'GET', );
            if (this.editInput && result.title) {
                this.editInput.value = result.title;
            }
        } catch (error) {
            console.log(error);
        }
    }

    private async editCategory(): Promise<void> {
        try {
            await CustomHttp.request(config.host + '/categories/' + this.page + '/' + this.id, 'PUT', {
                title: this.newValue
            });
        } catch (error) {
            console.log(error);
        }
        location.href = '#/' + this.page;
    }
}