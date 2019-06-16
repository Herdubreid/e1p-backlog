//** Main Component */
import './style.scss';
import 'bootstrap';
import * as ko from 'knockout';
import { IPage, IProject } from '../../state';
import { StoreKeys, Actions, KeyStore } from '../../store';
import { Services } from '../../services';

export const MAIN_COMPONENT = 'e1p-nav';

export let Main: ViewModel;

class ViewModel {
    busy$ = ko.observable(false);
    services: Services;
    pages: IPage[];
    projects: IProject[];
    pages$ = ko.pureComputed(() => this.pages.filter(p => p.visible$()))
        .extend({ rateLimit: { timeout: 500 } });
    refresh() {
        $('.fa-sync').toggleClass('fa-spin');
        this.busy$(true);
        Promise.all([
            this.services.backlog.refresh(),
            this.services.e1.init(true)
        ]).then((results: any[]) => {
            this.services.backlog.issues$.removeAll();
            this.services.backlog.issues$.push(...results[0]);
            Actions.KeySave([StoreKeys.Issues, results[0]]);
            $('.fa-sync').toggleClass('fa-spin');
            this.busy$(false);
        });
    }
    saveView() {
        Actions.KeySave([StoreKeys.view, Main.pages.map(p => [p.id, p.order$(), p.visible$()])]);
    }
    toggle(page: IPage) {
        const visible = !page.visible$();
        if (visible) {
            Main.pages
                .filter(p => p.order$() < page.order$())
                .forEach(p => p.order$(p.order$() + 1));
            page.order$(1);
        }
        page.visible$(visible);
        Main.saveView();
    }
    descendantsComplete = () => {
        const view: any[] = KeyStore.getState().data.get(StoreKeys.view);
        if (view) {
            this.pages.forEach(p => {
                const v = view.find(e => e[0] === p.id);
                p.order$(v[1]);
                p.visible$(v[2]);
            });
        } else {
            this.pages[0].visible$(true);
        }
    }
    constructor(params: { data: Map<string, any>, services: Services }) {
        Main = this;
        this.services = params.services;
        this.projects = params.data.get(StoreKeys.e1).projects;
        this.pages = this.projects.map<IPage>((p, i) => {
            return {
                id: `projects-${p.status}`,
                component: 'e1p-projects',
                title: `${p.status} - ${p.name}`,
                short: p.status,
                icon: 'fas fa-project-diagram',
                visible$: ko.observable(false),
                order$: ko.observable(i + 1),
                data: p.rows
            };
        });
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
