import {Form} from "./components/form";
import {Home} from "./components/home";
import {IncomeAndExpenses} from "./components/incomeAndExpenses";
import {WorkWithCategory} from "./components/work-with-category";
import {CreateIncomeExpenses} from "./components/createIncomeExpenses";
import {Category} from "./components/category";
import {EditCategory} from "./components/edit-category";
import {Links} from "./components/links";
import {UserInfo} from "./utils/user-info";
import {RouteType} from "./types/route.type";

export class Router {
    private routs: RouteType[];
    readonly contentElement: HTMLElement | null;
    readonly stylesElement: HTMLElement | null;
    readonly titleElement: HTMLElement | null;
    private bodyTitleElement: HTMLElement | null;
    constructor() {
        this.contentElement = document.getElementById('content');
        this.stylesElement = document.getElementById('styles');
        this.titleElement = document.getElementById('title');
        this.bodyTitleElement = document.getElementById('body-title');

        this.routs = [
            {
                route: '#/signup',
                title: 'Регистрация',
                template: '/templates/signup.html',
                styles: 'styles/form.css',
                load: () => {
                    new Form('signup');
                }
            },
            {
                route: '#/login',
                title: 'Вход',
                template: '/templates/login.html',
                styles: 'styles/form.css',
                load: () => {
                    new Form('login');
                }
            },
            {
                route: '#/home',
                title: 'Главная',
                template: '/templates/home.html',
                styles: 'styles/home.css',
                load: () => {
                    new Home();
                    new UserInfo();
                }
            },
            {
                route: '#/incAndExp',
                title: 'Доходы и расходы',
                template: '/templates/incomeAndExpenses.html',
                styles: 'styles/income-expenses.css',
                load: () => {
                    new IncomeAndExpenses();
                    new UserInfo();
                }
            },
            {
                route: '#/income',
                title: 'Доходы',
                template: '/templates/income.html',
                styles: 'styles/income-expenses.css',
                load: () => {
                    new Category('income');
                    new UserInfo();
                }
            },
            {
                route: '#/expense',
                title: 'Расходы',
                template: '/templates/expenses.html',
                styles: 'styles/income-expenses.css',
                load: () => {
                    new Category('expense');
                    new UserInfo();
                }
            },
            {
                route: '#/create-income',
                title: 'Создание категории доходов',
                template: '/templates/create-edit-category.html',
                styles: 'styles/income-expenses.css',
                load: () => {
                    new WorkWithCategory('income');
                    new UserInfo();
                }
            },
            {
                route: '#/create-expense',
                title: 'Создание категории расходов',
                template: '/templates/create-edit-category.html',
                styles: 'styles/income-expenses.css',
                load: () => {
                    new WorkWithCategory('expense');
                    new UserInfo();
                }
            },
            {
                route: '#/create-income-expense',
                title: 'Создание дохода/расхода',
                template: '/templates/create-income-expenses.html',
                styles: 'styles/income-expenses.css',
                load: () => {
                    new CreateIncomeExpenses('create');
                    new UserInfo();
                }
            },
            {
                route: '#/edit-income',
                title: 'Редактирование категории доходов',
                template: '/templates/create-edit-category.html',
                styles: 'styles/income-expenses.css',
                load: () => {
                    new EditCategory("income");
                    new UserInfo();
                }
            },
            {
                route: '#/edit-expense',
                title: 'Редактирование категории доходов',
                template: '/templates/create-edit-category.html',
                styles: 'styles/income-expenses.css',
                load: () => {
                    new EditCategory('expense');
                    new UserInfo();
                }
            },
            {
                route: '#/edit-operation',
                title: 'Редактирование дохода/расхода',
                template: '/templates/create-income-expenses.html',
                styles: 'styles/income-expenses.css',
                load: () => {
                    new CreateIncomeExpenses('edit');
                    new UserInfo();
                }
            }
        ]
    }

    public async openRoute(): Promise<void> {
        const sidebar: HTMLElement | null = document.getElementById('sidebar');

        const newRoute: RouteType | undefined = this.routs.find(item => {
            return item.route === window.location.hash;
        })

        if (!newRoute) {
            window.location.href = '#/login';
            return;
        }

        if (sidebar) {
            if (newRoute.route === '#/login' || newRoute.route === '#/signup') {
                sidebar.style.display = 'none';
            } else {
                sidebar.style.display = 'flex';
                new Links();
            }
        }

        if (!this.contentElement || !this.stylesElement || !this.titleElement) {
            if (newRoute.route === '#/login') {
                return;
            } else {
                window.location.href = '#/login';
                return;
            }
        }

        this.contentElement.innerHTML = await fetch(newRoute.template).then(response => response.text());
        this.stylesElement.setAttribute('href', newRoute.styles);
        this.titleElement.innerText = newRoute.title;
        this.bodyTitleElement = document.getElementById('body-title');

        if (this.bodyTitleElement) {
            this.bodyTitleElement.innerText = newRoute.title;
        }

        newRoute.load();
    }
}