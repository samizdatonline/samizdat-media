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

        this.searchPanel = this.div('search-panel',this.element);
        this.searchText = this.new(InputText,{name:'search',data:{},hideTitle:true});
        await this.searchText.render(this.searchPanel);
        this.searchResults = this.div('results',this.searchPanel);
        this.searchText.element.addEventListener('input',this.updateResults.bind(this));

        this.videoPanel = this.div('video-panel',this.element);
        this.player = document.createElement('video');
        this.player.classList.add('video-player');
        this.player.setAttribute('height','100%');
        this.player.setAttribute('width','auto');
        this.player.setAttribute("controls","true");
        // video.src = "/get/l7etli9qmyiqxrap.mp4"
        this.videoPanel.append(this.player);
        // // ad box
        // this.adBox = this.div('ad-box');
        // this.adBox.innerHTML = await this.adText();
        await this.updateResults();
    }
    async adText() {
        return "text ad with samizdat link"
    }
    async updateResults() {
        let results = await fetch('/search?q='+this.searchText.value);
        results = await results.json();
        this.searchResults.innerHTML="";
        for (let result of results) {
            let file = result.file || result._id + '.' + result.type;

            let entry = this.div('search-result',this.searchResults);
            entry.innerHTML = `<div><b>${file}</b></div><div>${result.description}</div><div><i>${result._created}</i></div>`
            entry.addEventListener('click',()=>{
                this.play(`/get/${file}`);
            })
        }
    }
    play(url) {
        this.player.src = url;
        this.player.play();
    }
}
