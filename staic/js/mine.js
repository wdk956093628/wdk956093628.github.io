var token;
var customerId;
$(function () {
    //客户信息查询
    CheckToken();

    // 退出登陆
    $(".logout").on('touchstart',function () {
       $(".mask").show();
    });

    $(".logout-confirm").on('touchstart',function () {
        $.removeCookie('token', {path: '/'});
        localStorage.removeItem('token');
        window.location.href = "./login.html";
    });

    $(".close").on('touchstart',function () {
        $(".mask").hide();
    });

    $(".cancel").on('touchstart',function () {
        $(".mask").hide();
    });

});

function CheckToken() {
    try {
        token = localStorage.getItem('token');
    } catch(e) {
        token = $.cookie('token');
    }

    $.ajax({
        url: url+"CheckToken",
        type: "get",
        dataType: 'jsonp',
        jsonp: "callback",
        data: {
            token: token
        },
        success: function (data) {
            if (data > 0) {
                customerId = data;
                Customer_query(customerId);
            } else {
                window.location.href = "login.html";
            }
        }
    })
}

function Customer_query(customerId) {
    $.ajax({
        url: url+"Customer_query",
        type: "get",
        dataType: 'jsonp',
        jsonp: "callback",
        data: {
            projectId: -1,
            customerId: customerId,
            startIndex: -1,
            pageCount: -1
        },
        success: function (data) {
            var me = JSON.parse(data)[0];
            $(".user-name").html(me.customerName);
            $(".telephone").html(me.phone);
            //身份证信息打码
            var str1 = me.idCard.substr(0,6)+"********"+me.idCard.substr(14,4);
            $(".id-card").html(str1);
            $(".ownerAgent").html(me.ownerAgent);
            $(".rightCount").html(me.rightCount);
        }
    });
}
