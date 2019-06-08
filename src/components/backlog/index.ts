//** Backlog Component */
import './style.scss';
import * as ko from 'knockout';
import { IPage, IBacklog } from '../../state';

const COMPONENT = 'e1p-backlog';

let vm: ViewModel;

class ViewModel {
    visible$: ko.Observable<boolean>;
    page: IPage;
    backlog: IBacklog;
    issueType$ = ko.observable<any>();
    category$ = ko.observable<any>();
    priority$ = ko.observable<any>();
    summary$ = ko.observable<string>();
    description$ = ko.observable<string>();
    addIssue() {
        const issue = {
            projectId: vm.backlog.project.id,
            issueTypeId: vm.issueType$().id,
            priorityId: vm.priority$().id,
            summary: vm.summary$(),
            description: vm.description$()
        };
        console.log('Issue: ', issue);
        /*this.bl.postIssue(issue)
            .then(d => console.log('Issue: ', d))
            .catch(e => console.error(e));*/
    }
    descendantsComplete = () => {
    }
    constructor(params: { page: IPage }) {
        this.page = params.page;
        this.backlog = params.page.data;
        this.visible$ = params.page.visible$;
        vm = this;
    }
}

ko.components.register(COMPONENT, {
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
