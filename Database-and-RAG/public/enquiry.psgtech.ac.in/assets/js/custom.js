
(function($) {
    'use strict';


/* ---------------------- Back to Top ---------------------- */


    var windowHight = $(window);
    var HtmlBody = $('html, body');
    var backtotop = $(".backtotop");

backtotop.on('click', function() {
    HtmlBody.animate({
        scrollTop: 0
    }, 1500);
});

    /* Scrolling  */
    var windowWidth = $(window).width();
    if (windowWidth > 992) {
        windowHight.on('scroll', function () {
            var windowHeight = $('body').height();
            var setHeight = (windowHeight < 500) ? 150 : (windowHeight / 8);
            var scrltop = windowHight.scrollTop(),
            navigation = $('#navigation');
            if (scrltop >= 100) {
                //navigation.addClass('nav-scrl');
               // $('.application-menu').addClass('application-menu-fixed')
                $('#fixedCheckList').addClass('nav-scroll-checklist');
                $('#checklistMsgContainer').addClass('nav-scroll-checklist-msg');
                $('.floating-button-section').addClass('fixed-section');
            } else {
                //navigation.removeClass('nav-scrl');
                //$('.application-menu').removeClass('application-menu-fixed')
                $('#fixedCheckList').removeClass('nav-scroll-checklist');
                $('#checklistMsgContainer').removeClass('nav-scroll-checklist-msg');
                $('.floating-button-section').removeClass('fixed-section');
            }

        });
    }


       //Mobile Menu Close
        $('.megamenu-collapse ul>li>a').on('click', function(){
            $('.megamenu-collapse.collapse').removeClass('show')
        })
        $('.megamenu-collapse ul li ul li a').on('click', function(){
            $('.megamenu-collapse.collapse').removeClass('show')
        })


}(jQuery));
