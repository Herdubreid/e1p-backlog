//** About Component */
import './style.scss';
import * as ko from 'knockout';

export const ABOUT_COMPONENT = 'e1p-about';

class ViewModel {
    constructor() {
    }
}

ko.components.register(ABOUT_COMPONENT, {
    viewModel: ViewModel,
    template: require('./template.html')
});
