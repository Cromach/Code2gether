$(document).ready(function () {
    $('.settings').on('click', function () {
        if(!$(this).hasClass("active")) {
            $(".active").removeClass("active");
            $(this).addClass("active");
            $('.menu').hide();
            $('#sideMenu').removeClass("hidden")
            $('.settingsMenu').show();
            resizeAnimation();
            return false
        }
    });
    $('.chat').on('click', function () {
        if(!$(this).hasClass("active")) {
            $(".active").removeClass("active");
            $(this).addClass("active");
            $('.menu').hide();
            $('#sideMenu').removeClass("hidden")
            $('.chatMenu').show();
            resizeAnimation();
            return false
        }
    });
    $('.users').on('click', function () {
        if(!$(this).hasClass("active")) {
            $(".active").removeClass("active");
            $(this).addClass("active");
            $('.menu').hide();
            $('#sideMenu').removeClass("hidden")
            $('.usersMenu').show();
            resizeAnimation();
            return false
        }
    });
    $(document).on('click',".active", function () {
        $(".active").removeClass("active");
        $('#sideMenu').addClass("hidden");
        resizeAnimation();
    });

    function resizeAnimation() {
        anim = setInterval(function(){ editor.layout(); }, 20);
        setTimeout(function(){ clearInterval(anim) }, 500)
    }

});