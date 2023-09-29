import {Router} from "./router";

class App {
    private router: Router;
    constructor() {
        this.router = new Router();

        window.addEventListener('DOMContentLoaded',  this.handelRouteChanging.bind(this))
        window.addEventListener('popstate', this.handelRouteChanging.bind(this))
    }
    private handelRouteChanging(): void {
        this.router.openRoute();
    }
}

(new App());