import Component from "./Component.mjs";

export default class PageHeader extends Component {
    constructor(props) {
        super(props);
    }
    async render(element) {
        await super.render(element);
        this.element.innerHTML = `<h1>samizdat media</h1><h2>share your reality</h2>`
    }
}
