//** Navigation Component */
import './style.scss';
import 'bootstrap';
import * as ko from 'knockout';
import { IPage } from '../../state';
import { StoreKeys, Actions } from '../../store';
import { Services } from '../../services';

export const MAIN_COMPONENT = 'e1p-nav';

let vm: ViewModel;

class ViewModel {
    services: Services;
    pages$: ko.ObservableArray<IPage>;
    orderedPages$ = ko.pureComputed(() => this.pages$().sort((a, b) => a.order$() - b.order$()));
    toggle(page: IPage) {
        const visible = !page.visible$();
        if (visible) {
            vm.pages$()
                .filter(p => p.order$() < page.order$())
                .forEach(p => p.order$(p.order$() + 1));
            page.order$(1);
        }
        page.visible$(visible);
        Actions.KeySave([StoreKeys.view, vm.pages$().map(p => [p.title, p.order$(), p.visible$()])]);
    }
    descendantsComplete = () => {
        this.pages$()[2].visible$(true);
    }
    constructor(params: { data: Map<string, any>, services: Services }) {
        vm = this;
        this.services = params.services;
        this.pages$ = ko.observableArray<IPage>([
            {
                id: 'omw-log-stats-1',
                title: 'Check-in Activity',
                component: 'e1p-omw-log-stats',
                visible$: ko.observable(false),
                order$: ko.observable(1),
                data: {
                    type: '02',
                    map: params.data.get(StoreKeys.e1).checkIns
                }
            },
            {
                id: 'omw-log-stats-2',
                title: 'Status Change Activity',
                component: 'e1p-omw-log-stats',
                visible$: ko.observable(false),
                order$: ko.observable(2),
                data: {
                    type: '38',
                    map: params.data.get(StoreKeys.e1).transfers
                }
            },
            {
                id: 'omw-proj-stats-1',
                title: 'Project Statistics',
                component: 'e1p-omw-proj-stats',
                visible$: ko.observable(false),
                order$: ko.observable(3),
                data: params.data.get(StoreKeys.e1).projects
            },
            {
                id: 'omw-user-stats',
                title: 'User Statistics',
                component: 'e1p-omw-user-stats',
                visible$: ko.observable(false),
                order$: ko.observable(4),
                data: params.data.get(StoreKeys.e1).users
            },
            {
                id: 'backlog-1',
                title: 'Log an Issue',
                component: 'e1p-backlog',
                visible$: ko.observable(false),
                order$: ko.observable(5),
                data: params.data.get(StoreKeys.Backlog)
            }
        ]);
    }
}

ko.components.register(MAIN_COMPONENT, {
    viewModel: {
        createViewModel: (params, componentInfo) => {
            const vm = new ViewModel(params);
            const sub = (ko as any).bindingEvent
                .subscribe(componentInfo.element, 'descendantsComplete', vm.descendantsComplete);
            (vm as any).dispose = () => sub.dispose();
            return vm;
        }
    },
    template: require('./template.html')
});
