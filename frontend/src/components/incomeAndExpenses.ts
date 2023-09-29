import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {OperationType} from "../types/operation.type";

export class IncomeAndExpenses {
    readonly popup: HTMLElement | null;
    readonly tableBody: HTMLElement | null;
    readonly yesDelete: HTMLElement | null;
    readonly noDelete: HTMLElement | null;
    readonly incomeBtn: HTMLElement | null;
    readonly expenseBtn: HTMLElement | null;
    private operationId: number = 0;
    readonly periods: string[];
    private period: string;
    readonly sortButtons: HTMLInputElement[] | null = null;
    readonly intervalInputs: HTMLInputElement[] | null;
    private dateFrom: string | null;
    private dateTo: string | null;

    constructor() {
        this.popup = document.getElementById('popup');
        this.tableBody = document.getElementById('table-body');
        this.yesDelete = document.getElementById('yesDelete');
        this.noDelete = document.getElementById('noDelete');
        this.incomeBtn = document.getElementById('income');
        this.expenseBtn = document.getElementById('expense');
        this.periods = ['now', 'week', 'month', 'year', 'all', 'interval'];
        this.period = 'all';

        const sortListElement: HTMLElement | null = document.getElementById('sort-list');
        if (sortListElement) {
            this.sortButtons = Array.from(sortListElement.children) as HTMLInputElement[];
        }

        this.intervalInputs = Array.from(document.getElementsByClassName('interval-input')) as HTMLInputElement[];
        this.dateFrom = null;
        this.dateTo = null;

        if (this.incomeBtn && this.expenseBtn) {
            this.incomeBtn.onclick = () => {
                localStorage.setItem('operation', 'income');
            }
            this.expenseBtn.onclick = () => {
                localStorage.setItem('operation', 'expense');
            }
        }

        this.intervalInputs.forEach((item: HTMLInputElement) => {
            item.onchange = () => {
                if (this.intervalInputs) {
                    this.dateFrom = this.intervalInputs[0].value;
                    this.dateTo = this.intervalInputs[1].value;
                }

                if (this.period === 'interval' && this.dateFrom && this.dateTo) {
                    this.getInfo(this.dateFrom, this.dateTo);
                }
            }
        })

        if (this.sortButtons) {
            for (let i:number = 0; i < this.sortButtons.length; i++) {
                this.sortButtons[i].onclick = (): void => {
                    if (this.sortButtons) {
                        this.sortButtons.forEach((item: HTMLInputElement) => item.classList.remove('active'))
                        this.sortButtons[i].classList.add('active');
                        this.period = this.periods[i];

                        if (this.period === 'interval' &&this.dateFrom && this.dateTo) {
                            this.getInfo(this.dateFrom, this.dateTo);
                        } else {
                            this.getInfo();
                        }
                    }
                }
            }
        }

        if (this.yesDelete && this.noDelete) {
            this.yesDelete.onclick = (): void => {this.deleteOperation(this.operationId)};
            this.noDelete.onclick = (): void => {
                if (this.popup) {
                    this.popup.style.display = 'none';
                }
            };
        }

        this.getInfo();
    }

    private async getInfo(dateFrom?: string, dateTo?: string): Promise<void> {
        if (this.tableBody) {
            this.tableBody.innerHTML = '';
        }
        let response: OperationType[] | null = null;

        try {
            if (dateFrom && dateTo) {
                response = await CustomHttp.request(config.host + '/operations' + '?period=' + this.period + '&dateFrom=' + dateFrom + '&dateTo=' + dateTo, 'GET',);
            } else {
                response = await CustomHttp.request(config.host + '/operations' + '?period=' + this.period, 'GET',);
            }
        } catch (error) {
            console.log(error);
        }

        if (response) {
            for (let j: number = 0; j < response.length; j++) {
                //создание строки
                let trElement: HTMLTableRowElement = document.createElement('tr');

                //нумерация
                let firstTdElement: HTMLTableCellElement = document.createElement('td');
                firstTdElement.innerText = (j + 1).toString();
                trElement.appendChild(firstTdElement);

                //доход - расход
                firstTdElement = document.createElement('td');
                if (response[j].type === 'income') {
                    firstTdElement.innerText = 'доход';
                    firstTdElement.style.color = 'green';
                } else {
                    firstTdElement.innerText = 'расход';
                    firstTdElement.style.color = 'red';
                }
                trElement.appendChild(firstTdElement);

                //категория
                firstTdElement = document.createElement('td');
                firstTdElement.innerText = response[j].category as string;
                trElement.appendChild(firstTdElement);

                //сумма
                firstTdElement = document.createElement('td');
                firstTdElement.innerText = response[j].amount + '$';
                trElement.appendChild(firstTdElement);

                //дата
                firstTdElement = document.createElement('td');
                firstTdElement.innerText = response[j].date.split('-').reverse().join('.');
                trElement.appendChild(firstTdElement);

                //коммент
                firstTdElement = document.createElement('td');
                firstTdElement.innerText = response[j].comment;
                trElement.appendChild(firstTdElement);

                //удаление и редактирование
                firstTdElement = document.createElement('td');
                firstTdElement.classList.add('svg-images');

                let imgElement: HTMLImageElement = document.createElement('img');
                imgElement.src = '/images/bucket.svg';
                imgElement.onclick = () => {
                    if (this.popup) {
                        this.popup.style.display = 'flex';
                    }
                    if (response) {
                        this.operationId = response[j].id;
                    }
                }
                firstTdElement.appendChild(imgElement);

                imgElement = document.createElement('img');
                imgElement.src = '../../images/pen.svg';
                imgElement.onclick = () => {
                    if (response) {
                        localStorage.setItem('id', response[j].id.toString());
                        localStorage.setItem('operation', response[j].type);
                        location.href = '#/edit-operation';
                    }
                }
                firstTdElement.appendChild(imgElement);
                trElement.appendChild(firstTdElement);
                if (this.tableBody) {
                    this.tableBody.appendChild(trElement);
                }
            }
        }
    }

    private async deleteOperation(id: number): Promise<void> {
        try {
            await CustomHttp.request(config.host + '/operations/' + id, 'DELETE', );
            location.href = '#/incAndExp';
        } catch (error) {
            console.log(error);
        }
    }
}