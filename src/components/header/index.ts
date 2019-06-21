//** Navigation Bar Component */
import './style.scss';
import * as ko from 'knockout';
import { Main } from '../main';

const component = 'e1p-header';

class ViewModel {
    visible$: ko.Observable<boolean>;
    title: string;
    icon: string;
    minimise() {
        this.visible$(false);
        Main.saveView();
    }
    constructor(params: { title: string; icon: string; visible: ko.Observable<boolean> }) {
        this.title = params.title;
        this.icon = params.icon;
        this.visible$ = params.visible;
    }
}

ko.components.register(component, {
    viewModel: ViewModel,
    template: require('./template.html')
});
