$('.show-hide').show();
$('.show-hide span').addClass('show');

$('.show-hide span').on('click', function () {
    if ($(this).hasClass('show')) {
        $('input[name="currentpassword"]').attr('type', 'text');
        $(this).removeClass('show');
    } else {
        $('input[name="currentpassword"]').attr('type', 'password');
        $(this).addClass('show');
    }
});

$('.show-hide2 span').on('click', function () {
    if ($(this).hasClass('show')) {
        $('input[name="newpassword"]').attr('type', 'text');
        $(this).removeClass('show');
    } else {
        $('input[name="newpassword"]').attr('type', 'password');
        $(this).addClass('show');
    }
});
$('form button[type="submit"]').on('click', function () {
    $('.show-hide span').addClass('show');
    $('.show-hide').parent().find('input[name="login[password]"]').attr('type', 'password');
});