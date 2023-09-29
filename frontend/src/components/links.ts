export class Links {
    readonly links: HTMLLinkElement[] | null;
    constructor() {
        this.links = Array.from(document.getElementsByClassName('nav-link')) as HTMLLinkElement[];

        this.links.forEach((item: HTMLLinkElement) => {
            item.onclick = () => {
                if (this.links) {
                    this.links.forEach(item => item.classList.remove('active-item'));
                    item.classList.add('active-item');
                }
            }
        })
    }
}


