import Component from './Component.mjs';

export default class InputFile extends Component {
    constructor(props) {
        super(props)
    }
    async render(element) {
        await super.render(element);
        if (!this.props.hideTitle && (this.props.name || this.props.title)) {
            this.title = this.div('form-element-title');
            this.title.innerHTML = this.props.title || this.props.name;
        }
        this.input = document.createElement("input");
        this.input.type = "file"
        if (this.props.accept) {
            let val = Array.isArray(this.props.accept)?this.props.accept.join(','):this.props.accept;
            this.input.setAttribute('accept',val);
        }
        this.element.append(this.input);
    }
    get value() {
        return this.input.files[0];
    }
}
