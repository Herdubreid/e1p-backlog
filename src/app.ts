import './css/style.scss';
import * as ko from 'knockout';
import { KeyStore } from './store';
import { Services } from './services';
import { MAIN_COMPONENT } from './components/main';
import { ABOUT_COMPONENT } from './components/about';
import './components';

/**
 * App
 */

export class App {
    loaded$ = ko.observable(false);
    component$ = ko.observable(ABOUT_COMPONENT);
    services: Services;
    data: Map<string, any>;
    constructor() {
        this.data = KeyStore.getState().data;
        this.services = new Services(this.data);
    }
}

const app = new App();

ko.applyBindings(app);

app.services.init()
    .then(() => {
        app.loaded$(true);
        app.component$(MAIN_COMPONENT);
    });

ko.bindingHandlers.fadeVisible = {
    init: (element, valueAccessor) => {
        const value = valueAccessor();
        $(element).toggle(ko.unwrap(value));
    },
    update: (element, valueAccessor) => {
        const value = valueAccessor();
        ko.unwrap(value) ? $(element).fadeIn('slow') : $(element).fadeOut('slow');
    }
}
