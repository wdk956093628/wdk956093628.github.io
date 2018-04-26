var token;
var phone;
var idCard;
var shortCode;
var $getCode = $('#J_GetCode');


$(document).ready(function () {
    //输入密码出现提示图标
    // var eye = $(".showTip");
    // var psd = $("#password");
    // psd.focus(function () {
    //     if (psd.val().length > 0) {
    //         eye.removeClass('hide')
    //     }else{
    //         eye.addClass('hide')
    //     }
    // }).keyup(function () {
    //     $(this).triggerHandler('focus');
    // });

    // 点击图标显示或隐藏密码
    // eye.off('click').on('click', function () {
    //     if (eye.hasClass('eyeShow')) {
    //         eye.removeClass('eyeShow').addClass('eyeHide');//密码可见
    //         psd.prop('type', 'password');
    //     } else {
    //         eye.removeClass('eyeHide').addClass('eyeShow');//密码不可见
    //         psd.prop('type', 'text');
    //     }
    // });

    CheckToken();

    // // 验证手机号码
    // $("#telephone").blur(function () {
    //     var tel = $(this).val();
    //     var reg = /^1[34578][0-9]{9}$/;
    //     if (tel.length > 0) {
    //         if (!reg.test(tel)) {
    //             $(".psdTip").html("*请输入正确的手机号码");
    //         }
    //     } else {
    //         $(".psdTip").html("*请输入手机号码");
    //     }
    // }).focus(function () {
    //     $(".psdTip").html("");
    // });

    // 验证身份证号码
    // $("#id_card").blur(function () {
    //     var idval = $(this).val();
    //     // var reg2 = /^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/;
    //     if (idval.length > 0 && idval.length<18) {
    //         // if (!reg2.test(idval)) {
    //         //     $(".psdTip").html("*请输入正确的身份证号码");
    //         // }
    //     } else {
    //         $(".psdTip").html("*请输入正确的身份证号码");
    //     }
    // }).focus(function () {
    //     $(".psdTip").html("");
    // });

    /*获取短信验证码倒计时*/
    /* 定义参数 */
    $getCode.sendCode({
        disClass: 'btn-disabled',
        secs: 60,
        run: false,
        runStr: '{%s}秒后重新获取',
        resetStr: '重新获取验证码'
    });

    //发送验证码
    /*判断重复提交*/
    var click1 = 0;
    $getCode.on('touchstart', function () {
        phone = $("#telephone").val();
        idCard = $("#id_card").val();
        if (click1 == 0) {//判断重复提交
            if (phone.length == 11 ) {//判断手机号位数
               if(idCard.length == 18){//判断身份证号码位数
                   storeShortCode();
               }else{
                   YDUI.dialog.toast('请输入正确的身份证号码', 'none', 1000);
               }
            } else {
                YDUI.dialog.toast('请输入正确的手机号码', 'none', 1000);
            }
            click1 = 1;
            setTimeout(function () {
                click1 = 0
            }, 2000);
        }
    });

    // 登录
    $(".login_but").on('touchstart', function () {
        phone = $("#telephone").val();
        idCard = $("#id_card").val();
        shortCode = $("#verify").val();
        if (phone != "" && idCard != "" && shortCode != "") {
            CheckShortCode();
        } else {
            YDUI.dialog.toast('请输入正确信息', 'none', 1000);
        }
    });
});

function CheckToken() {
    token = localStorage.getItem('token');
    $.ajax({
        url: url + "CheckToken",
        type: "post",
        dataType: 'jsonp',
        jsonp: "callback",
        data: {
            token: token
        },
        success: function (data) {
            if (data > 0) {
                window.location.href = 'index.html';
            }
        }
    })
}

//发送验证码
function storeShortCode() {
    $.ajax({
        url: url + "Customer_storeShortCode",
        type: "post",
        dataType: 'jsonp',
        jsonp: "callback",
        data: {
            phone: phone,
            idCard: idCard
        },
        success: function (data) {
            if (data >= 0) {
                YDUI.dialog.loading.open('发送中');
                setTimeout(function () {
                    YDUI.dialog.loading.close();
                    $getCode.sendCode('start');
                    YDUI.dialog.toast('已发送', 'success', 1000);
                    $("#verify").focus()
                }, 1000);
            } else {
                YDUI.dialog.toast('本次开盘未找到您的客户信息', 'none', 1000);
            }
        }
    })
}

//检查验证码
function CheckShortCode() {
    phone = $("#telephone").val();
    idCard = $("#id_card").val();
    shortCode = $("#verify").val();

    $.ajax({
        url: url + "CheckShortCode",
        type: "post",
        dataType: 'jsonp',
        jsonp: "callback",
        data: {
            phone: phone,
            idCard: idCard,
            shortCode: shortCode
        },
        success: function (data) {
            if (data) {
                localStorage.setItem('token', data);   //将获取到的token保存到localStorage
                $.cookie('token',data,{path: '/'});
                YDUI.dialog.loading.open('登陆中');
                setTimeout(function () {
                    YDUI.dialog.loading.close();       /* 移除loading */
                    window.location.href = "rules.html";
                }, 1000);
            } else {
                YDUI.dialog.toast('验证码错误', 'none', 1000);
            }
        }
    })
}