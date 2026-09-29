$(document).on('click', '.featured-btn', function () {

    const button = $(this);
    const url = button.data('url');

    $.ajax({
        url: url,
        method: 'POST',
        success: function (response) {

            button.toggleClass('flipped');
        }
    });

});