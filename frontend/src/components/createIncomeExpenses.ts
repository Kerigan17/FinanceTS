import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {CategoryResponseType} from "../types/category-response.type";
import {OperationType} from "../types/operation.type";

export class CreateIncomeExpenses {
    page: 'create' | 'edit';
    typeOperation: string | null;
    amountOperation: HTMLInputElement | null;
    dateOperation: HTMLInputElement | null;
    commentOperation: HTMLInputElement | null;
    categoryIdOperation: number | null;
    categories: CategoryResponseType[];
    btnCreateOperation: HTMLElement | null;
    selectCategories: HTMLInputElement | null;
    typeOperationElement: HTMLInputElement | null;
    operation: OperationType | null;
    id: number | null;

    constructor(page: 'create' | 'edit') {
        this.page = page;
        this.typeOperation = localStorage.getItem('operation');
        this.amountOperation = null;
        this.dateOperation = null;
        this.commentOperation = null;
        this.categoryIdOperation = null;
        this.categories = [];
        this.operation = null;
        this.id = null;

        this.btnCreateOperation = document.getElementById('btnCreateOperation');
        this.selectCategories = document.getElementById('selectCategories') as HTMLInputElement;
        this.typeOperationElement = document.getElementById('typeOperationElement') as HTMLInputElement;

        if (this.typeOperationElement && this.typeOperation) {
            this.typeOperationElement.value = this.typeOperation;
        }

        //получаю категории
        if (this.typeOperation) {
            this.getCategories(this.typeOperation);
        }

        //изменение типа операции
        this.typeOperationElement.onchange = (): void => {
            if (this.typeOperationElement) {
                this.typeOperation = this.typeOperationElement.value;
                this.getCategories(this.typeOperation);
            }
            this.setCategories();
        }

        //изменение категории
        if (this.selectCategories) {
            this.selectCategories.onchange = (): void => {
                if (this.selectCategories) {
                    this.categoryIdOperation = Number(this.selectCategories.value);
                }
            }
        }

        if (this.page === 'edit') {
            this.id = Number(localStorage.getItem('id'));
            if (this.btnCreateOperation) {
                this.btnCreateOperation.innerText = 'Сохранить';
            }
            this.getOperation();

            if (this.btnCreateOperation) {
                this.btnCreateOperation.onclick = (): void => {
                    this.updateOperation();
                }
            }
        } else {
            if (this.btnCreateOperation) {
                this.btnCreateOperation.onclick = (): void => {
                    this.createNewOperation();
                }
            }
        }

        //задаю Id категории
        this.categoryIdOperation = Number(this.selectCategories.value);
    }

    private async getCategories(operation: string): Promise<void> {
        try {
            const response: CategoryResponseType[] = await CustomHttp.request(config.host + '/categories/' + operation, 'GET', );
            this.categories = response;
        } catch (error) {
            console.log(error);
        }

        //устанавливаю категории
        this.setCategories();
    }

    private setCategories(): void {
        if (this.selectCategories) {
            this.selectCategories.innerHTML = '';
        }
        let operationItem = null;

        this.categories.forEach((item: CategoryResponseType): void => {
            operationItem = document.createElement('option');
            if (item.id) {
                operationItem.setAttribute('value', item.id.toString());
            }
            if (item.title) {
                operationItem.innerText = item.title;
            }
            if (this.selectCategories) {
                this.selectCategories.appendChild(operationItem);
            }
        });
        if (this.categories.length > 0 && this.page !== 'edit') {
            this.categoryIdOperation = Number(this.categories[0].id)
        }
    }

    private async createNewOperation(): Promise<void>{
        this.getValue();

        try {
            await CustomHttp.request(config.host + '/operations', 'POST', {
                type: this.typeOperation,
                amount: this.amountOperation?.value,
                date: this.dateOperation?.value,
                comment: this.commentOperation?.value,
                category_id: this.categoryIdOperation,
            });
            location.href = '#/incAndExp';
        } catch (error) {
            console.log(error);
        }
    }

    private async updateOperation(): Promise<void> {
        let typeOperation: HTMLInputElement = document.getElementById('typeOperationElement') as HTMLInputElement;
        let typeCategory: HTMLInputElement = document.getElementById('selectCategories') as HTMLInputElement;
        let amountOperation: HTMLInputElement = document.getElementById('amountOperation') as HTMLInputElement;
        let dateOperation: HTMLInputElement = document.getElementById('dateOperation') as HTMLInputElement;
        let commentOperation: HTMLInputElement = document.getElementById('commentOperation') as HTMLInputElement;

        try {
            await CustomHttp.request(config.host + '/operations/' + this.id, 'PUT', {
                type: typeOperation.value,
                amount: amountOperation.value,
                date: dateOperation.value,
                comment: commentOperation.value,
                category_id: Number(typeCategory.value),
            });
            location.href = '#/incAndExp';
        } catch (error) {
            console.log(error);
        }
    }

    private async setValuesOperation(operation: OperationType): Promise<void> {
        this.operation = operation;

        let typeOperation: HTMLInputElement = document.getElementById('typeOperationElement') as HTMLInputElement;
        let typeCategory: HTMLInputElement = document.getElementById('selectCategories') as HTMLInputElement;
        let amountOperation: HTMLInputElement = document.getElementById('amountOperation') as HTMLInputElement;
        let dateOperation: HTMLInputElement = document.getElementById('dateOperation') as HTMLInputElement;
        let commentOperation: HTMLInputElement = document.getElementById('commentOperation') as HTMLInputElement;

        typeOperation.value = this.operation.type;
        if (this.operation) {
            let typeCategoryValue: string | undefined = this.categories.find((item: CategoryResponseType): boolean => item.title === this.operation?.category)?.id?.toString();
            if (typeCategoryValue) {
                typeCategory.value = typeCategoryValue;
            }
        }
        amountOperation.value = this.operation.amount.toString();
        dateOperation.value = this.operation.date;
        commentOperation.value = this.operation.comment;
    }

    private async getOperation(): Promise<void> {
        try {
            const result = await CustomHttp.request(config.host + '/operations/' + this.id, 'GET', );
            this.setValuesOperation(result)
        } catch (error) {
            console.log(error);
        }
    }

    getValue() {
        this.amountOperation = document.getElementById('amountOperation') as HTMLInputElement;
        this.dateOperation = document.getElementById('dateOperation') as HTMLInputElement;
        this.commentOperation = document.getElementById('commentOperation') as HTMLInputElement;
    }
}