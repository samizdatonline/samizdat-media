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
        this.searchText = this.new(InputText,{name:'search',data:{},hideTitle:true,placeholder:"Search for something"});
        await this.searchText.render(this.searchPanel);
        this.searchResults = this.div('results',this.searchPanel);
        this.searchText.element.addEventListener('input',this.updateResults.bind(this));

        this.videoPanel = this.div('video-panel',this.element);
        this.player = document.createElement('video');
        this.player.classList.add('video-player');
        this.player.setAttribute('height','100%');
        this.player.setAttribute('width','auto');
        this.player.setAttribute("controls","true");
        this.videoPanel.append(this.player);
        this.addResponsiveLayout();
        await this.updateResults();
    }
    async updateResults() {
        let results = await fetch('/search?q='+this.searchText.value);
        results = await results.json();
        this.searchResults.innerHTML="";
        for (let result of results) {
            let file = result.file || result._id + '.' + result.type;

            let entry = this.div('search-result',this.searchResults);
            let date = moment(result.captured).format("YYYY-MM-DD");
            entry.innerHTML = `<div class="search-result-container">
                <div class="video-preview">
                    <img src="/media/preview/${result._id}" />
                </div>
                <div>
                    <div>${result.description || 'no description'}</div>
                    <div><i>${date}</i></div>
                </div>
            </div>`
            entry.addEventListener('click',()=>{
                this.play(`/media/get/${file}`);
            })
        }
    }
    play(url) {
        this.player.src = url;
        this.player.play();
    }

    /**
     * This should be done purely in CSS, but the metric componentry doesn't
     * properly handle @media declarations
     */
    addResponsiveLayout() {
        updateSize.call(this);
        window.addEventListener('resize', updateSize.bind(this));
        function updateSize() {
            if (window.innerWidth < 450) {
                this.element.style.flexDirection = "column";
                this.element.style.alignItems = "flex-end";
                this.videoPanel.classList.add('vertical');
            } else {
                this.element.style.flexDirection = "row";
                this.element.style.alignItems = "flex-start";
                this.videoPanel.classList.remove('vertical');
            }
        }
    }
}
