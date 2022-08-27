import Component from './Component.mjs';

export default class InputFile extends Component {
    constructor(props) {
        super(props)
    }
    async render(element) {
        await super.render(element);
        if (!this.props.hideTitle) {
            this.title = this.div('form-element-title');
            this.title.innerHTML = this.props.title || this.props.name;
        }
    }
}
