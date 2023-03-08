import Component from "./Component.mjs";

export default class About extends Component {
    constructor(props) {
        super(props);
    }
    async render(element) {
        await super.render(element);
        this.content = this.div();
        this.content.innerHTML = `
            <p>Samizdat media provides a platform for anonymously sharing video.</p>
            <p>Video can be posted to one or more channels, like hashtags that help it be found</p>
            <p>Channels have moderators who are not anonymous. Moderators set the rules of
             participation in the channel</p>
        `;
    }
}
