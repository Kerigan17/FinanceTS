import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {Chart, ChartItem, registerables} from 'chart.js';
import {OperationType} from "../types/operation.type";

Chart.register(...registerables);

export class Home {
    readonly periods: string[] | null;
    private period: string | null;
    private operations: OperationType[] | null;
    readonly sortButtons: HTMLInputElement[] | null = null;
    readonly incomeCanvas: ChartItem | null = null;
    readonly expensiveCanvas: ChartItem | null = null;
    private incomeDiagram: Chart | null = null;
    private expensiveDiagram: Chart | null = null;
    readonly intervalInputs: HTMLInputElement[] | null;
    private dateFrom: string | null;
    private dateTo: string | null;


    constructor() {
        this.periods = ['now', 'week', 'month', 'year', 'all', 'interval'];
        this.period = 'all';
        this.operations = null;

        const sortListElement: HTMLElement | null = document.getElementById('sort-list');
        if (sortListElement) {
            this.sortButtons = Array.from(sortListElement.children) as HTMLInputElement[];
        }

        this.incomeCanvas = document.getElementById('incomeDiagram') as ChartItem;
        this.expensiveCanvas = document.getElementById('expensiveDiagram') as ChartItem;
        this.incomeDiagram = null;
        this.expensiveDiagram = null;
        this.intervalInputs = Array.from(document.getElementsByClassName('interval-input')) as HTMLInputElement[];
        this.dateFrom = null;
        this.dateTo = null;

        this.intervalInputs.forEach((item: HTMLInputElement) => {
            item.onchange = (): void => {
                if (this.intervalInputs) {
                    this.dateFrom = this.intervalInputs[0].value;
                    this.dateTo = this.intervalInputs[1].value;
                }

                if (this.period === 'interval' && this.dateFrom && this.dateTo) {
                    if (this.incomeDiagram && this.expensiveDiagram) {
                        this.incomeDiagram.destroy();
                        this.expensiveDiagram.destroy();
                    }

                    this.getOperations(this.dateFrom, this.dateTo);
                }
            }
        })

        if (this.sortButtons) {
            for (let i: number = 0; i < this.sortButtons.length; i++) {
                this.sortButtons[i].onclick = (): void => {
                    if (this.sortButtons) {
                        this.sortButtons.forEach(item => item.classList.remove('active'))
                        this.sortButtons[i].classList.add('active');
                        if (this.periods) {
                            this.period = this.periods[i];
                        }
                        if (this.incomeDiagram && this.expensiveDiagram) {
                            this.incomeDiagram.destroy();
                            this.expensiveDiagram.destroy();
                        }

                        if (this.period === 'interval' && this.dateFrom && this.dateTo) {
                            this.getOperations(this.dateFrom, this.dateTo);
                        } else {
                            this.getOperations();
                        }
                    }
                }
            }
        }

        this.getOperations();
    }

    private async getOperations(dateFrom?: string, dateTo?: string): Promise<void> {
        let result: OperationType[] | null = null;

        try {
            if (dateFrom && dateTo) {
                result = await CustomHttp.request(config.host + '/operations' + '?period=' + this.period + '&dateFrom=' + dateFrom + '&dateTo=' + dateTo, 'GET',);
            } else {
                result = await CustomHttp.request(config.host + '/operations' + '?period='  + this.period, 'GET',);
            }
            if (result) {
                this.paintingDiagrams(result);
            }
        } catch (error) {
            console.log(error);
        }
    }

    private paintingDiagrams(operations: OperationType[]): void {
        this.operations = operations;

        if (this.operations) {
            const incomeOperations: OperationType[] = this.operations.filter((item: OperationType): boolean => item.type === 'income');
            const expenseOperations: OperationType[] = this.operations.filter((item: OperationType): boolean => item.type === 'expense');

            this.incomeDiagram = this.paintDiagram(this.incomeCanvas as ChartItem, incomeOperations);
            this.expensiveDiagram = this.paintDiagram(this.expensiveCanvas as ChartItem, expenseOperations);
        } else {
            if (this.incomeDiagram && this.expensiveDiagram) {
                this.incomeDiagram.destroy();
                this.expensiveDiagram.destroy();
            }
        }
    }

    private paintDiagram(diagram: ChartItem, items: OperationType[]): Chart<any> {
        const labelList: string[] = [];
        const dataList: number[] = [];

        items.forEach((item: OperationType) => {
            if (item.category) {
                labelList.push(item.category);
            }
            dataList.push(item.amount);
        })

        return new Chart(diagram, {
            type: 'pie',
            data: {
                labels: labelList,
                datasets: [{
                    label: '# of Votes',
                    data: dataList,
                    borderWidth: 0
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        display: false
                    },
                    x: {
                        display: false
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            boxWidth: 35,
                            color: 'rgb(255, 99, 132)'
                        }
                    }
                }
            }
        });
    }
}