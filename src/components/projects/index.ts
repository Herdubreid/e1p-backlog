//** OMW Projects Component */
import './style.scss';
import 'bootstrap';
import * as ko from 'knockout';
import { Services } from '../../services';
import { IPage } from '../../state';
import { Actions, StoreKeys } from '../../store';
import { LogIssueVM } from '../log-issue';

const COMPONENT = 'e1p-projects';

class ViewModel {
    readonly regexSummary = new RegExp(/\[(.*?)\]/);
    page: IPage;
    visible$: ko.Observable<boolean>;
    issues$: ko.ObservableArray<any>;
    services: Services;
    omwRows: any[];
    summary$ = ko.observable<string>();
    summaryOptions$ = ko.pureComputed(() => {
        const assigned = this.issues$()
            .map(r => this.regexSummary.exec(r.summary))
            .filter(r => r !== null)
            .map(r => r[1]);
        return this.omwRows
            .filter(r => !assigned.includes(r.F98220_OMWPRJID))
            .map(r => `[${r.F98220_OMWPRJID}] - ${r.F98220_OMWDESC}`);
    });
    projects$ = ko.pureComputed(() => this.issues$()
        .filter(i => {
            const omwId = this.regexSummary.exec(i.summary);
            if (omwId) {
                return this.omwRows.find(r => r.F98220_OMWPRJID === omwId[1]);
            }
            return false;
        }));
    addIssue() {
        LogIssueVM.showNew(this.services.backlog.backlog.issueTypes.find(t => t.id === 87099), this.summary$());
    }
    descendantsComplete = () => {
    }
    constructor(params: { page: IPage, services: Services }) {
        this.visible$ = params.page.visible$;
        this.services = params.services;
        this.omwRows = params.page.data;
        this.page = params.page;
        this.issues$ = params.services.backlog.issues$;
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
