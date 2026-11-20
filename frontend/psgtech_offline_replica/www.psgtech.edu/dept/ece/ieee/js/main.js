/*  ---------------------------------------------------
    Template Name: Dreams
    Description: Dreams wedding template
    Author: Colorib
    Author URI: https://colorlib.com/
    Version: 1.0
    Created: Colorib
---------------------------------------------------------  */

'use strict';

(function ($) {

    /*------------------
        Preloader
    --------------------*/
    $(window).on('load', function () {
        $(".loader").fadeOut();
        $("#preloder").delay(200).fadeOut("slow");

        /*------------------
            Portfolio filter
        --------------------*/
        $('.portfolio__filter li').on('click', function () {
            $('.portfolio__filter li').removeClass('active');
            $(this).addClass('active');
        });
        if ($('.portfolio__gallery').length > 0) {
            var containerEl = document.querySelector('.portfolio__gallery');
            var mixer = mixitup(containerEl);
        }
    });


    /*------------------
        Background Set
    --------------------*/
    $('.set-bg').each(function () {
        var bg = $(this).data('setbg');
        $(this).css('background-image', 'url(' + bg + ')');
    });

    //Masonary
    $('.work__gallery').masonry({
        itemSelector: '.work__item',
        columnWidth: '.grid-sizer',
        gutter: 10
    });

    /*------------------
		Navigation
	--------------------*/
    $(".mobile-menu").slicknav({
        prependTo: '#mobile-menu-wrap',
        allowParentLinks: true
    });

    /*------------------
		Hero Slider
	--------------------*/
    $('.hero__slider').owlCarousel({
        loop: true,
        dots: true,
        mouseDrag: false,
        animateOut: 'fadeOut',
        animateIn: 'fadeIn',
        items: 1,
        margin: 0,
        smartSpeed: 1200,
        autoHeight: false,
        autoplay: true,
    });

    var dot = $('.hero__slider .owl-dot');
    dot.each(function () {
        var index = $(this).index() + 1;
        if (index < 10) {
            $(this).html('0').append(index);
        } else {
            $(this).html(index);
        }
    });

    /*------------------
        Testimonial Slider
    --------------------*/
    $(".testimonial__slider").owlCarousel({
        loop: true,
        margin: 0,
        items: 3,
        dots: true,
        dotsEach: 2,
        smartSpeed: 1200,
        autoHeight: false,
        autoplay: true,
        responsive: {
            992: {
                items: 3
            },
            768: {
                items: 2
            },
            320: {
                items: 1
            }
        }
    });

    /*------------------
        Latest Slider
    --------------------*/
    $(".latest__slider").owlCarousel({
        loop: true,
        margin: 0,
        items: 3,
        dots: true,
        dotsEach: 2,
        smartSpeed: 1200,
        autoHeight: false,
        autoplay: true,
        responsive: {
            992: {
                items: 3
            },
            768: {
                items: 2
            },
            320: {
                items: 1
            }
        }
    });

    /*------------------
        Logo Slider
    --------------------*/
    $(".logo__carousel").owlCarousel({
        loop: true,
        margin: 100,
        items: 6,
        dots: false,
        smartSpeed: 1200,
        autoHeight: false,
        autoplay: true,
        responsive: {
            992: {
                items: 5
            },
            768: {
                items: 4
            },
            480: {
                items: 3
            },
            320: {
                items: 2
            }
        }
    });

    /*------------------
        Video Popup
    --------------------*/
    $('.video-popup').magnificPopup({
        type: 'image',
        zoom: {
            enabled: true,
            duration: 300,
            easing: 'ease-in-out',
            opener: function(element) { return element; }
        },
        gallery: {
            enabled: true,
            navigateByImgClick: false,
            tPrev: 'Previous (Left arrow key)',
            tNext: 'Next (Right arrow key)'
        }
    });

    /*------------------
        Counter
    --------------------*/
//     $(function($, win) {
//   $.fn.inViewport = function(cb) {
//      return this.each(function(i,el) {
//        function visPx(){
//          var elH = $(el).outerHeight(),
//              H = $(win).height(),
//              r = el.getBoundingClientRect(), t=r.top, b=r.bottom;
//              console.log(Math.min(elH, H-t))
//          return cb.call(el, Math.max(0, t>0? Math.min(elH, H-t) : Math.min(b, H)));  
//        }
//        visPx();
//        $(win).on("resize scroll", visPx);
//      });
//   };
// }(jQuery, window));

//     $('.counter_num').inViewport(function(px) {
//         if (px) {
//             $('.counter_num').each(function () {
//                 $(this).prop('Counter', 0).animate({
//                     Counter: $(this).text()
//                 }, {
//                     duration: 4000,
//                     easing: 'swing',
//                     step: function (now) {
//                         $(this).text(Math.ceil(now));
//                     }
//                 });
//             })

//         }
//     })


// Source for the below viewport animated counter element: https://jsfiddle.net/2v3mq3nh/4/

    $(function($, win) {
    $.fn.inViewport = function(cb) {
        return this.each(function(i,el){
        function visPx(){
            var H = $(this).height(),
                r = el.getBoundingClientRect(), t=r.top, b=r.bottom;
            return cb.call(el, Math.max(0, t>0? H-t : (b<H?b:H)));  
        } visPx();
        $(win).on("resize scroll", visPx);
        });
    };
    }(jQuery, window));


    jQuery(function($) { // DOM ready and $ in scope

    $(".counter_num").inViewport(function(px) { // Make use of the `px` argument!!!
        // if element entered V.port ( px>0 ) and
        // if prop initNumAnim flag is not yet set
        //  = Animate numbers
        if(px>0 && !this.initNumAnim) { 
        this.initNumAnim = true; // Set flag to true to prevent re-running the same animation
        $(this).prop('Counter',0).animate({
            Counter: $(this).text()
        }, {
            duration: 4000,
            step: function (now) {
            $(this).text(Math.ceil(now));
            }
        });         
        }
    });

    });


    jQuery(function($) { // DOM ready and $ in scope

    $(".counter_num_plus").inViewport(function(px) { // Make use of the `px` argument!!!
        // if element entered V.port ( px>0 ) and
        // if prop initNumAnim flag is not yet set
        //  = Animate numbers
        if(px>0 && !this.initNumAnim) { 
        this.initNumAnim = true; // Set flag to true to prevent re-running the same animation
        $(this).prop('Counter',0).animate({
            Counter: $(this).text()
        }, {
            duration: 4000,
            step: function (now) {
            $(this).text(Math.ceil(now) + '+');
            }
        });         
        }
    });

    });



    // $('.counter_num_plus').each(function () {
    //     $(this).prop('Counter', 0).animate({
    //         Counter: $(this).text()
    //     }, {
    //         duration: 4000,
    //         easing: 'swing',
    //         step: function (now) {
    //             $(this).text(Math.ceil(now) + '+');
    //         }
    //     });
    // });



})(jQuery);