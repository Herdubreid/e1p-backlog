//** Navigation Bar Component */
import * as ko from 'knockout';

const component = 'e1p-header';

class ViewModel {
    visible$: ko.Observable<boolean>;
    title: string;
    minimise = () => this.visible$(false);
    constructor(params: { title: string, visible: ko.Observable<boolean> }) {
        this.title = params.title;
        this.visible$ = params.visible;
    }
}

ko.components.register(component, {
    viewModel: ViewModel,
    template: require('./template.html')
});
