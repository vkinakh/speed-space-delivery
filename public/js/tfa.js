$(document).ready(function () {
    document.addEventListener("submit", function (event) {
        event.preventDefault();
    });
    addTFA({
        SID: JSON.parse(localStorage.getItem("SID"))
    });
});

$("#add").click(function () {
    var token = $("#token").val();
    if (token.length === 6) confirmTFA({
        'SID': JSON.parse(localStorage.getItem("SID")),
        'token': token
    });
    else alert('Please input token');
});
$("#delete").click(function () {
    var secret = $("#secret").val();
    var token = $("#token1").val();
    if (secret.length === 32) removeTFA({
        'SID': JSON.parse(localStorage.getItem("SID")),
        'secret': secret
    });
    else if (token.length === 6) removeTFA({
        'SID': JSON.parse(localStorage.getItem("SID")),
        'token': token
    });
    else alert('Specify secret/token');
});

function addTFA(obj) {
    $.ajax({
        url: "https://sspacedelivery.herokuapp.com/api/users/addTFA",
        type: 'POST',
        data: obj,
        success: function (response) {
            console.log(response);
            console.log($('#content'));
            $('#add2FA').attr('style', '');
            $('#remove2FA').attr('style', 'display: none');
            $('#secret').text(response.secret);
            $('#qr_code').attr("src", response.qr);
        },
        error: function (status) {
            if (status.status == '2FA already enabled') {
                $('#add2FA').attr('style', 'display: none');
                $('#remove2FA').attr('style', '');
            } else alert(status.responseText);
            return false;
        }
    })
}

function confirmTFA(obj) {
    $.ajax({
        url: "https://sspacedelivery.herokuapp.com/api/users/confirmTFA",
        type: 'POST',
        data: obj,
        success: function (response) {
            $('#add2FA').attr('style', 'display: none');
            $('#remove2FA').attr('style', '');
        },
        error: function (status) {
            alert(status.responseText);
            return false;
        }
    });
}

function removeTFA(obj) {
    $.ajax({
        url: "https://sspacedelivery.herokuapp.com/api/users/removeTFA",
        type: 'POST',
        data: obj,
        success: function (response) {
            addTFA({
                SID: JSON.parse(localStorage.getItem("SID"))
            });
        },
        error: function (status) {
            alert(status.responseText);
            return false;
        }
    });
}
