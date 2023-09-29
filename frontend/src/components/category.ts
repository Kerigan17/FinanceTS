import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {CategoryResponseType} from "../types/category-response.type";

export class Category {
    popup: HTMLElement | null;
    yesDelete: HTMLElement | null;
    noDelete: HTMLElement | null;
    categoryId: number | null;
    page: 'income' | 'expense';
    id: number | null;

    constructor(page: 'income' | 'expense') {
        this.popup = document.getElementById('popup');
        this.yesDelete = document.getElementById('yesDelete');
        this.noDelete = document.getElementById('noDelete');
        this.categoryId = null;
        this.page = page;
        this.id = null;

        this.getCategories();

        if (this.yesDelete) {
            this.yesDelete.onclick = (): void => {
                this.deleteCategory(Number(this.categoryId));
            }
        }
        if (this.noDelete) {
            this.noDelete.onclick = (): void => {
                if (this.popup) {
                    this.popup.style.display = 'none';
                }
            }
        }
    }

    private async getCategories(): Promise<void> {
        let result: CategoryResponseType[] = [];
        let blockCategories: HTMLElement | null = document.getElementById('block-categories');

        try {
            result = await CustomHttp.request(config.host + '/categories/' + this.page, 'GET', );
        } catch (error) {
            console.log(error);
        }

        if (result) {
            result.forEach((item: CategoryResponseType): void => {
                let blockCategory: HTMLDivElement = document.createElement('div');
                blockCategory.classList.add('block');

                let blockTitle: HTMLDivElement = document.createElement('div');
                blockTitle.classList.add('block-title');
                if (item.title) {
                    blockTitle.innerText = item.title;
                }

                let blockActions: HTMLDivElement = document.createElement('div');
                blockActions.classList.add('block-actions');

                let butEdit: HTMLAnchorElement = document.createElement('a');
                if (this.page === 'income') {
                    butEdit.setAttribute('href', '#/edit-income')
                } else {
                    butEdit.setAttribute('href', '#/edit-expense')
                }
                butEdit.classList.add('edit');
                butEdit.innerText = 'Редактировать';

                butEdit.onclick = (): void => {
                    localStorage.removeItem('id');
                    if (item.id) {
                        localStorage.setItem('id', item.id.toString());
                    }
                }

                let butDelete: HTMLButtonElement = document.createElement('button');
                butDelete.classList.add('delete');
                butDelete.innerText = 'Удалить';

                butDelete.onclick = ():void => {
                    if (this.popup) {
                        this.popup.style.display = 'flex';
                    }
                    if (item.id) {
                        this.categoryId = item.id!;
                    }
                }

                blockActions.appendChild(butEdit);
                blockActions.appendChild(butDelete);

                blockCategory.appendChild(blockTitle);
                blockCategory.appendChild(blockActions);

                if (blockCategories) {
                    blockCategories.appendChild(blockCategory);
                }
            })

            let blockAdd: HTMLAnchorElement = document.createElement('a');
            if (this.page === 'income') {
                blockAdd.setAttribute('href', '#/create-income');
            } else {
                blockAdd.setAttribute('href', '#/create-expense');
            }
            blockAdd.innerText = '+';
            blockAdd.classList.add('block');
            blockAdd.classList.add('create-block');

            if (blockCategories) {
                blockCategories.appendChild(blockAdd);
            }
        }
    }

    private async deleteCategory(id: number): Promise<void> {
        console.log(id)
        console.log(typeof id)
        try {
            await CustomHttp.request(config.host + '/categories/' + this.page + '/' + id, 'DELETE', );
            location.href = '#/' + this.page;
        } catch (error) {
            console.log(error);
        }
    }
}