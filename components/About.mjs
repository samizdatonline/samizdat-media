import Component from "./Component.mjs";

export default class About extends Component {
    constructor(props) {
        super(props);
    }
    async render(element) {
        await super.render(element);
        this.content = this.div();
        this.content.innerHTML = `
            <h3>What is this?</h3>
            <p><b>Samizdat Media</b> provides a platform for anonymously sharing video anywhere in the world.</p>
            <p>The system employs a global distributed network for storage (provided by <a href="storj.io">storj.io</a>
            as well as an optional revenue sharing model enabled through the blockchain.
            <p>There are no accounts. No cookies. And SamizdatOnline's network of scrambling servers allow
            people under censorship to participate.</p>

            <h3>Isn't this dangerous?</h3>
            <p><a href="samizdatonline.org">SamizdatOnline</a> set itself the seemingly impossible goal of
            tackling autocratic censorship, requiring no special tools, bypassing DNS and protecting
            participants with anonymity; while avoiding abuse.</p>
            <p>The internet is a cesspool at times. People post awful things. This has been an excuse for
            those who seek iron-fisted governance over digital communications. We believe we can chase
            away both the censors and the abusers, and still allow for privacy and anonymity.</p>

            <h3>How does it work?</h3>
            <p>There are three constructs which collaborate to deliver Samizdat Media</p>

            <h4>People have no identity. Objects have identity</h4>
            <p>Users don't log in to edit their stuff. They find their stuff and enter the pass
            phrase provided when the video was uploaded. The user is anonymous. Their device is
            anonymous, but they can still prove the right to update their content.</p>

            <h4>Moderation is delegated to a micro network of publishers</h4>
            <p>The need to devise anonymity for posters led us to the concept of sponsors.
            No video is uploaded without identifying a <b>channel</b>. The channel owner takes
            responsibility for moderating the content, and further selects the business model.</p>
            <p>Paid, ad supported or enabled through charity the publisher chooses how to
            support the bandwidth of their channel and help contributors share in any revenue.</p>
            <p>Delegating responsibility allows those with more rights to enable participation for
            those without rights. Channel publishers cannot be anonymous. A publisher can stand up a tiny
            network of subject-matter videos. They provide a shield for their contributors in return for
            owning the monetization as well as the responsibility.</p>
            <p>Publishers provide an email when posting a channel and confirm a legal identity.
            Various options give them control over what is posted in their name.</p>
            
            <h4>Crypto allows objects to participate in an economy</h4>
            <p>Blockchain currencies have been much derided, but provide a critical mechanism
            to establish global micro economies. There is no intent to supplant national
            banking structures, however, one can't send dollars to a protestor whose video
            went viral</p>
            <p>Every channel has a wallet address, BTC, ETH or ERC20 tokens. This wallet pays
            the channel network bill.</p>
            <p>Every upload may be accompanied by a wallet address. If the video generates
            revenue it is shared between the channel and the creator. It is not required.</p>

            <h3>How do I get started?</h3>
            <p><b>On the Home page <span class="icon icon-home"></span></b>, the search box will identify channels or individual videos
            based on their description. If you find your subject-matter you can also see
            the model offered by the channel.</p>
            <p><b>On the Upload page <span class="icon icon-upload"></span></b>, click or drag to the file upload box and
            provide a description. Select a channel and upload. Optionally select a language (the browser language
            is the default) and wallet address if there is any expectation of reach. This is not required.</p>
            <p>Enter a pass phrase used to revisit the editorial role of the upload, such as updating the description
            or removing it. This could be unique to this object or shared, but it should be kept secret and
            hard to guess. We recommend phrases with a few words. The only requirement is to provide eight characters. </p>
            <p><b>On the Channels page <span class="icon icon-flag"></span></b>, you can create a new channel (the 
            name must be unique), find an existing channel to review its policies or enter a pass phrase to
            retrieve a channel you can edit.</p>
            <ul>
            <li><b>billing</b> - Sponsored means the publisher expects no revenue and will not host adds.
            The intent is for charitable organizations to support contributions on their own dime. Ad
            Supported means that Samizdat Media will provide interstitial ads on the channel and pay
            revenue to the given wallet. Paid anticipates micro transactions which could be priced or
            accepted as tips.</li>
            <li><b>email</b> - We ask for a publishers email as we must verify the identity of a channel
            owner. The channel owner assumes the legal responsibility for their publication of anonymously
            sourced contribution.</li>
            <li><b>wallet</b> - A bitcoin or ERC20 wallet for payments and deposits.</li>
            <li><b>pass phrases</b> - Enter a pass phrase, a few words you can remember and others can't
            guess. No one has accounts or passwords, or SSO with PII hungry behemoths, so you assign
            a secret to the channel itself. One to allow editing, another which can enable private
            channels. Only viewers with this secret can open the videos. Leave it blank for the 
            content to be public.</li>
            </ul>
            <p></p>
        `;
    }
}
