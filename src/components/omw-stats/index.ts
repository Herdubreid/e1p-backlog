//** OMW Stats Component */
import './style.scss';
import * as ko from 'knockout';
import * as d3 from 'd3';
import { IProject } from '../../state';

const COMPONENT = 'e1p-omw-stats';

interface ISize {
    width: number;
    height: number;
}

class ViewModel {
    margin = 200;
    winsize$ = ko.observable<ISize>({ width: $(window).width(), height: $(window).height() })
        .extend({ rateLimit: { timeout: 200, method: 'notifyWhenChangesStop' } });
    projects: IProject[];
    svg: d3.Selection<d3.BaseType, IProject, HTMLElement, any>;
    xDomain: d3.ScaleBand<string>;
    scale: d3.ScaleLinear<number, number>;
    xAxis: any;
    xLabel: (d: IProject) => string;
    fromX: (d: IProject) => number;
    drawStats(size: ISize) {
        this.xDomain.range([0, size.width - this.margin]);
        this.svg.selectAll('.x-axis')
            .call(this.xAxis);
        this.svg.selectAll('.bar')
            .data(this.projects)
            .attr('x', d => this.fromX(d))
            .attr('width', d => this.scale(d.rows.length));
    }
    descendantsComplete = () => {
        this.svg = d3.select<d3.BaseType, IProject>('#omw-stats-chart')
            .attr('width', '100%')
            .attr('height', 60);
        this.xLabel = (d: IProject) => `${d.status} - ${d.name} (${d.rows.length})`;
        this.xDomain = d3.scaleBand()
            .domain(this.projects.map(p => this.xLabel(p)))
            .range([0, this.winsize$().width - this.margin])
            .padding(.1);
        this.xAxis = g => g
            .attr('transform', 'translate(0, 20)')
            .call(d3.axisBottom(this.xDomain).tickSize(0))
            .call(g => g.select('.domain').remove());
        this.scale = d3.scaleLinear()
            .domain([0, d3.max(this.projects, d => d.rows.length)])
            .range([0, this.xDomain.bandwidth()]);
        this.svg.append('g')
            .attr('class', 'x-axis')
            .call(this.xAxis);
        this.fromX = (d: IProject) => this.xDomain(this.xLabel(d)) + (this.xDomain.bandwidth() - this.scale(d.rows.length)) / 2;
        this.svg
            .append('g')
            .selectAll('.bar')
            .data(this.projects)
            .join('rect')
            .attr('class', d => `bar status-${d.status}`)
            .attr('y', 5)
            .attr('rx', 5)
            .attr('x', d => this.fromX(d))
            .attr('width', d => this.scale(d.rows.length));
        this.winsize$
            .subscribe(size => this.drawStats(size));
    }
    constructor(params: { projects: IProject[] }) {
        this.projects = params.projects;
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
