var token;
var projectId = $.cookie("projectId");
var userId = -1;
var productId = $.cookie("productId");
var productStatus;
var customerId;
var pickTime;
var confirmTime;
var customerName;
var customerIdCard;
var customerPhone;

$(function () {
    //检查token
    CheckToken();

    //点击订单进入详情页
    $(".order-container").on('click', '.order-item', function () {
        productId = $(this).children("input[name='productId']").attr("value");
        productStatus = $(this).children("input[name='productStatus']").attr("value");
        pickTime = $(this).children("input[name='pickTime']").attr("value");
        confirmTime = $(this).children("input[name='confirmTime']").attr("value");
        customerName = $(this).children("input[name='customerName']").attr("value");
        customerIdCard = $(this).children("input[name='customerIdCard']").attr("value");
        customerPhone = $(this).children("input[name='customerPhone']").attr("value");
        $.cookie("productId", productId, {expires: 1, path: '/'});
        $.cookie("productStatus", productStatus, {expires: 1, path: '/'});
        $.cookie("pickTime", pickTime, {expires: 1, path: '/'});
        $.cookie("confirmTime", confirmTime, {expires: 1, path: '/'});
        $.cookie("customerName", customerName, {expires: 1, path: '/'});
        $.cookie("customerIdCard", customerIdCard, {expires: 1, path: '/'});
        $.cookie("customerPhone", customerPhone, {expires: 1, path: '/'});
        window.location.href = "orderDetails.html";
    });
    // 撤单弹框
    $(".revoke").on('touchstart',function () {
        $(".mask").show();
        $(".revoke-dialog").show();
    });
    // 确认撤单
    $(".revoke-sure").on('touchstart',function () {
        Withdraw();
        $(".mask").hide();
        $(".revoke-dialog").hide();
    });
    //取消按钮
    $(".cancel").click(function () {
        $(".mask").hide();
        $(".revoke-dialog").hide();
    });
    //关闭按钮
    $(".close").click(function () {
        $(".mask").hide();
        $(".revoke-dialog").hide();
    });
});

function CheckToken() {
    token = localStorage.getItem('token');;

    $.ajax({
        url: url+"CheckToken",
        type: "post",
        dataType: 'jsonp',
        jsonp: "callback",
        data: {
            token: token
        },
        success: function (data) {
            customerId = data;
            if (data > 0) {
                customerId = data;
                Deal_query();
            } else {
                window.location.href = 'login.html'
            }
        }
    })
}

// 订单列表
function Deal_query() {
    $.ajax({
        url: url+"Deal_query",
        type: "get",
        dataType: 'jsonp',
        jsonp: "callback",
        data: {
            projectId: projectId,
            customerId: customerId
        },
        success: function (data) {
            data = JSON.parse(data);
            if (data.length >= 1) {
                var list = "";
                $.each(data, function (i, o) {
                    list += '<div class="banner pt15 order-item">';
                    list += '<p class="shopName">' + o.projectName + o.buildingNo + "栋" + o.unit + "单元" + o.productName + "室" + '</p>';
                    list += '<p class="shopInfo"><span class="shopNum">' + o.modelName + '</span>';
                    list += '<span class="shopType">' + o.modelType + '</span>';
                    list += '<span class="shopArea">' + (o.area/1).toFixed(2) + '</span>m²</p>';
                    list += '<p class="price"><span class="price-icon">￥</span><span class="house-price">' + (o.totalMoney/1).toFixed(2) + '</span>万</p>';
                    list += '<input type="hidden" name="productId" value="' + o.productId + '">';
                    list += '<input type="hidden" name="productStatus" value="' + o.productStatus + '">';
                    list += '<input type="hidden" name="pickTime" value="' + o.pickTime + '">';
                    list += '<input type="hidden" name="confirmTime" value="' + o.confirmTime + '">';
                    list += '<input type="hidden" name="customerName" value="' + o.customerName + '">';
                    list += '<input type="hidden" name="customerIdCard" value="' + o.customerIdCard + '">';
                    list += '<input type="hidden" name="customerPhone" value="' + o.customerPhone + '">';
                    if (o.productStatus == 0) {
                        list += '<span class="shopStatus audit">待审核</span></div>';
                    } else if (o.productStatus == 1) {
                        list += '<span class="shopStatus subscribed">已同意</span></div>';
                    } else if (o.productStatus == 2) {
                        list += '<span class="shopStatus refused">已拒绝</span></div>';
                    }else if (o.productStatus == 3) {
                        list += '<span class="shopStatus revoke">已撤单</span></div>';
                    }
                });
                $(".order-container").html(list);

            } else {
                $(".order-container").html("<p class='noCartTip'>当前没有订单信息，请下单</p>");
            }
        }
    })
}

//订单详情信息
function orderDetails() {
    productStatus =$.cookie('productStatus');
    pickTime = $.cookie('pickTime');
    confirmTime = $.cookie('confirmTime');
    customerName = $.cookie('customerName');
    customerIdCard = $.cookie('customerIdCard');
    customerPhone = $.cookie('customerPhone');
    $.ajax({
        url: url+"Product_queryArray",
        type: "get",
        dataType: 'jsonp',
        jsonp: "callback",
        data: {
            productId: productId,
            projectId: projectId,
            buildingNo: -1,
            unit: -1,
            floorIndex: -1,
            modelId: -1
        },
        success: function (data) {
            data = JSON.parse(data);
            Model_query(data.modelName);
            $.each(data, function (i, o) {
                $(".houseName").html(o.projectName + o.buildingNo + '栋' + o.unit + '单元' + o.productName + '室');
                $(".orderDetails-tag").html(o.modelName + '户型');
                $(".orderDetails-type").html(o.modelType);
                $(".house-price").html((o.totalMoney / 1).toFixed(2));
                $(".floorIndex").html(o.floorIndex + '层');
                $(".builtArea").html((o.area / 1).toFixed(2) + 'm²');
                $(".builtUnitPrice").html('￥' + (o.totalMoney/o.area).toFixed(2) + '万/m²');
                $(".floorCount").html(o.floorCount+'层');
                $(".orientation").html(o.orientation);
                if (o.decorateMode == 0) {
                    $(".decorateMode").html("普通");
                } else if (o.decorateMode == 1) {
                    $(".decorateMode").html("精装");
                }

                //订单状态展示
                if (productStatus == 0) {
                   $(".deal-icon").addClass("deal-audit");
                   $(".deal-tip").html('稍等，订单正在审核中');
                   $(".passTime").html("");
                } else if (productStatus == 1) {
                    $(".deal-icon").addClass("deal-success");
                    $(".deal-tip").html('恭喜您，认购成功');
                    $(".passTime").html(confirmTime);
                } else if (productStatus == 2 || 3) {
                    $(".deal-icon").addClass("deal-fail");
                    $(".deal-tip").html('抱歉，认购失败');
                    $(".passTime").html(confirmTime);
                }

                //订单详情信息
                $(".dealTime").html(pickTime);
                $(".dealPeople").html(customerName);
                $(".id-card").html(customerIdCard);
                $(".telephone").html(customerPhone);
            });
        }
    });
}

//撤单按钮
function Withdraw() {
    $.ajax({
        url: url+'Withdraw',
        type:'get',
        dataType:'jsonp',
        jsonp:'callback',
        data:{
            projectId:projectId,
            customerId:customerId,
            productId:productId,
            userId:userId
        },
        success:function (data) {
            console.log(data);
            if(data === 1){
                YDUI.dialog.toast('撤单成功', 'success', 1000);
            }else if(data === -101){
                YDUI.dialog.toast('撤单失败，订单不存在', 'error', 1000);
            }else if(data === -102){
                YDUI.dialog.toast('撤单失败，超过撤单上限', 'error', 1000);
            }
            setTimeout(function () {
                window.location.href = 'order.html'
            },1200);
        }
    })
}

//获取modelName
function Model_query(modelName) {
    $.ajax({
        url: url + "Model_query",
        type: "get",
        dataType: 'jsonp',
        jsonp: "callback",
        data: {
            projectId: projectId,
            modelId: -1,
            modelName: modelName
        },
        success: function (data) {
            data = JSON.parse(data);
            $.each(data, function (i, o) {
                //户型图片
                getOrderPhotos(o.pictures);
            });
        }
    });
}

//查询订单详情页图片
function getOrderPhotos(photoId) {
    $.ajax({
        url: photoUrl + 'getPhotos',
        type: 'post',
        crossDomain: true,
        data: {
            photoId: photoId,
            photoType: 2,
            userName: 1,
            userKey: 1
        },
        success: function (data) {
            if (data.data.data == "") {
                var noPic = '<img src="../staic/images/noPic.png" alt="">';
                $(".od-content").append(noPic);
            } else {
                var pic = "";
                $.each(data.data.data, function (i, o) {
                    pic += '<div class="swiper-slide">';
                    pic += '<img class="od-img" src=' + o.photoUrl + ' alt="">';
                    pic += '</div>';
                });
                $(".od-content").html(pic);
            }
        }
    })
}
