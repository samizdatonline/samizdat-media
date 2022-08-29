import Component from "./Component.mjs";
import {InputText} from "./InputText.mjs";
import {InputSlider} from "./InputSlider.mjs";

export default class Home extends Component {
    constructor(props) {
        super(props);
        this.refreshTimer = null;
        this.hub = true;
        this.scopes = ['global','country','region','city'];
        this.periods = ['all time','year','month','week','day'];
    }
    async render(element) {
        await super.render(element);
        // video: PXL_20210408_230026764.mp4
        let video = document.createElement('video');
        video.classList.add('video-box');
        video.setAttribute('height','100%');
        video.setAttribute('width','auto');
        video.setAttribute("controls","true");
        video.src = "https://link.storjshare.io/s/jxge7mxollo756nqac72hmykbiaq/video/PXL_20210527_230723821.mp4?wrap=0"
        this.element.append(video);
        // ad box
        this.adBox = this.div('ad-box');
        this.adBox.innerHTML = await this.adText();
    }
    async adText() {
        return "text ad with samizdat link"
    }
}
