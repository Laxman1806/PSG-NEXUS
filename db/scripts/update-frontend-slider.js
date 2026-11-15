const fs = require('fs');
const path = require('path');

const indexPath = path.resolve(__dirname, '../../frontend/index.html');
let content = fs.readFileSync(indexPath, 'utf8');

// Replace everything from `<script>\r?\njQuery(window).on('load', function () {`
// up to `<!-- =========================================================================\r?\n         PSGNEXUS AI CHATBOT COMPONENT`
const regex = /<script>\s*jQuery\(window\)\.on\('load'[\s\S]*?<\/script>\s*(?=<!-- =+[\r\n\s]+PSGNEXUS AI CHATBOT)/;

const newScript = `<script>
jQuery(document).ready(function ($) {
    var _tg_homeslider = $("#tg-homeslider");
    if (_tg_homeslider.length) {
        _tg_homeslider.owlCarousel({
            items: 1,
            margin: 0,
            nav: true,
            loop: true,
            dots: false,
            autoplay: true,
            autoplayTimeout: 5000,
            autoplayHoverPause: true,
            animateIn: "fadeIn",
            animateOut: "fadeOut",
            navText: [
                '<i class="fa fa-angle-left"></i>',
                '<i class="fa fa-angle-right"></i>',
            ],
            navClass: ["tg-btnroundprev tg-btnprev", "tg-btnroundnext tg-btnnext"],
        });
    }

    var Title_Texts = [
        "Welcome to PSG College of Technology",
    ];

    var Description_Texts = [
        "An ISO 9001:2015 certified institution is one of the foremost institutions founded by the PSG & Sons' Charities Trust (1926).",
        "Provide world-class Engineering Education, Foster Research and Development. Evolve innovative applications of Technology.",
        "A proud legacy, a promising tomorrow",
        "Committed towards sustained growth, driven by passion to excel",
        "A campus to explore, connect and grow",
        "Where curiosity fuels discovery and success",
        "Founded on traditional values, modern in action, enriching growth and connecting with a large alumni network"
    ];

    var descriptionIndex = 0;
    var headingElement = document.getElementById('slider_title');
    var paragraphElement = document.getElementById('slider_description');

    function changeSlider_OverlayText() {
        if (paragraphElement) {
            paragraphElement.innerHTML = Description_Texts[descriptionIndex];
        }
        if (headingElement) {
            headingElement.innerHTML = descriptionIndex === 0 ? Title_Texts[0] : "";
        }
        descriptionIndex = (descriptionIndex + 1) % Description_Texts.length;
    }

    changeSlider_OverlayText();
    setInterval(changeSlider_OverlayText, 5000);
});
</script>

`;

if (regex.test(content)) {
    content = content.replace(regex, newScript);
    fs.writeFileSync(indexPath, content, 'utf8');
    console.log("✅ Successfully updated frontend/index.html slider script!");
} else {
    console.error("❌ Regex did not match!");
}
