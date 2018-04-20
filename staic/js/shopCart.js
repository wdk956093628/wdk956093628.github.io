var token;
var projectId = $.cookie("projectId");
var customerId;
var sortIndex;
var userId = -1;
var productId;
var productIds = '';

$(function () {
    CheckToken();

    //删除购物车
    $(".del").on('touchstart', function () {
        var sv = [];
        var tip = "";
        $("input[name='cartItem']:checked").each(function () {
            var tv = $(this).val();
            tip = $(this).parents(".banner").children(".shopName").html();
            sv.push(tv);
        });
        if (sv.length === 0) {
            YDUI.dialog.toast('请选择房源', 'error', '1000')
        } else if (sv.length === 1) {
            $(".mask").show();
            $(".del-dialog").show();
            $(".dealAgreement").hide();
            $(".del-shopName").html(tip);
            $(".del-confirm").html("您真的确定删除吗？");
            productIds = sv.join(",");
        } else if (sv.length > 1) {
            $(".mask").show();
            $(".del-dialog").show();
            $(".dealAgreement").hide();
            $(".del-shopName").show();
            $(".del-confirm").html("您确定删除选中的" + sv.length + "套房源？");
            productIds = sv.join(",");
        }
        $(".del-sure").on('touchstart', function () {
            Cart_removeBatch();
        })
    });

    // 提交订单
    $(".submit").on('touchstart', function () {
        var sv = [];
        $("input[name='cartItem']:checked").each(function () {
            var tv = $(this).val();
            sv.push(tv);
        });
        productIds = sv.join(",");
        if(!productIds){
            YDUI.dialog.toast('请选择房源', 'none', 1000);
        }else if(productIds.split(",").length == 1){
            $(".mask").show();
            $(".dealAgreement").show();
            $(".del-dialog").hide();
            Product_queryCartCount();
        } else{
            YDUI.dialog.toast('每次只能提交一个房源', 'none', 1000);
        }
    });

    // 确认提交
    $(".confirm-agreement").on('touchstart',function () {
        var isagree = $("#agreement").prop("checked");
        if(isagree == true){
            YDUI.dialog.loading.open('提交订单中');
            setTimeout(function () {
                YDUI.dialog.loading.close();
                Deal();
            }, 1000);
            $(".mask").hide();
            $(".dealAgreement").addClass('hide');
            $(".agreement").prop('checked',false);
        }else{
            YDUI.dialog.toast('请同意选房须知', 'none', 1000);
        }
    });

    //编辑按钮
    $(".edit").click(function () {
        $(".bottom").hide();
        $(".editbar").show();
        $(".shopTip").hide();
        $(".editTip").show();

        // 排序
        $(".saleStatus").hide();
        $(".icon-sort").show();
        $(".g-scrollview").attr("id", "sortable");
        sortable()
    });
    //完成按钮
    $(".complete").click(function () {
        $(".bottom").show();
        $(".editbar").hide();
        $(".shopTip").show();
        $(".editTip").hide();

        // 关闭排序
        $(".saleStatus").show();
        $(".icon-sort").hide();
        $(".g-scrollview").removeAttr("id");
    });
    //确认删除
    $(".del-sure").click(function () {
        $(".mask").hide();
    });
    //取消删除
    $(".cancel").click(function () {
        $(".mask").hide();
        $(".agreement").prop('checked',false);
    });
    // 关闭弹框
    $(".close").click(function () {
        $(".mask").hide();
        $(".agreement").prop('checked',false);
    });

});

// 获取customerId
function CheckToken() {
    token = localStorage.getItem('token');
    $.ajax({
        url: url+"CheckToken",
        type: "post",
        dataType: 'jsonp',
        jsonp: "callback",
        data: {
            token: token
        },
        success: function (data) {
            if (data > 0) {
                customerId = data;
                Cart_query()
            } else {
                window.location.href = 'login.html'
            }
        }
    })
}

// 购物车查询
function Cart_query() {
    $.ajax({
        url: url+"Cart_query",
        type: "get",
        async: false,
        dataType: 'jsonp',
        jsonp: "callback",
        data: {
            projectId: projectId,
            customerId: customerId,
            startIndex: -1,
            pageCount: -1
        },
        success: function (data) {
            data = JSON.parse(data);
            var list = '<p class="shopTip">您当前最多可提交<span class="cartCount"></span>套房源订单</p>' +
                '<p class="editTip hide">您可以长按房源拖动进行排序</p>';
            if (data.length > 0) {
                $.each(data, function (i, s) {
                    list += '<div class="banner pl48">';
                    list += '<i class="icon-sort my-handle"></i>';
                    if (s.productStatus == 0) {
                        list += '<span class="saleStatus sellwait">待售</span>';
                    } else if (s.productStatus == 1) {
                        list += '<span class="saleStatus sellOut">已售</span>';
                    } else if (s.productStatus == 2) {
                        list += '<span class="saleStatus sellIn">可售</span>';
                    }
                    list += '<input type="checkbox" name="cartItem" id="shopChoose' + i + '" value="' + s.productId + '">';
                    list += '<label for="shopChoose' + i + '"></label>';
                    list += '<p class="shopName">' + s.projectName + s.buildingNo + '栋' + s.unit + '单元' + s.productName + '室' + '</p>';
                    list += '<p class="shopInfo"><span class="shopNum">' + s.modelName + '</span>';
                    list += '<span class="shopType">' + s.modelType + '</span>';
                    list += '<span class="shopArea">' + (s.area/1).toFixed(2) + '</span>m²</p>';
                    list += '<p class="price"><span class="price-icon">￥</span><span class="house-price">' + (s.totalMoney/1).toFixed(2) + '</span>万</p>';
                    list += '<input type="hidden" name="productId" value="' + s.productId + '">';
                    list += '<input type="hidden" name="sortIndex" value="' + s.sortIndex + '"></div>';
                });
                $(".shopCart-container").append(list);
                Customer_query();
            } else {
                $(".bottom").hide();
                $(".shopCart-container").html("<p class='noCartTip'>当前购物车没有房源</p>");
            }
        }
    })
}

// 购物车最大数量
function Customer_query() {
    $.ajax({
        url: url + "Customer_query",
        type: "get",
        dataType: 'jsonp',
        jsonp: "callback",
        data: {
            projectId: projectId,
            customerId:customerId,
            startIndex:-1,
            pageCount:-1
        },
        success: function (data) {
            var rightCount = JSON.parse(data)[0].rightCount;
            Deal_query(rightCount);
        }
    })
}

//已提交订单数量
function Deal_query(rightCount) {
    $.ajax({
        url: url + "Deal_query",
        type: "get",
        dataType: 'jsonp',
        jsonp: "callback",
        data: {
            projectId: projectId,
            customerId: customerId
        },
        success: function (data) {
            var orderCount = JSON.parse(data).length;
            var cartCount = rightCount - orderCount;
            $(".cartCount").html(cartCount)
        }
    })
}

// 拖动排序
function sortable() {
    var el = document.getElementById("sortable");
    var sortable = Sortable.create(el, {
        filter: ".cartTip",
        animation: 300,
        draggable: ".banner",
        chosenClass: "sortable-drag",
        scroll: true,
        onEnd: function (evt) {
            productId = $(evt.item).find('input[name="productId"]').val();
            sortIndex = $(evt.item).find('input[name="sortIndex"]').val();
            Cart_insert();
        }
    });
}

// 购物车拖动
function Cart_insert() {
    $.ajax({
        url: url+"Cart_insert",
        type: "post",
        dataType: 'jsonp',
        jsonp: "callback",
        data: {
            projectId: projectId,
            customerId: customerId,
            productId: productId,
            sortIndex: sortIndex
        },
        success: function (data) {
            console.log(data)
        }
    })
}

//删除购物车
function Cart_removeBatch() {
    $.ajax({
        url: url+"Cart_removeBatch",
        type: "post",
        async: false,
        dataType: 'jsonp',
        jsonp: "callback",
        data: {
            projectId: projectId,
            customerId: customerId,
            productIds: productIds,
        },
        success: function (data) {
            if (data > 0) {
                YDUI.dialog.toast('删除成功', 'success', 1000);
                setTimeout(function () {
                    window.location.reload();
                }, 1000)
            } else {
                YDUI.dialog.toast('删除失败', 'error', 1000);
            }
        }
    })
}

// 获取房源详情
function Product_queryCartCount() {
    $.ajax({
        url: url + "Product_queryCartCount",
        type: "get",
        dataType: 'jsonp',
        jsonp: "callback",
        data: {
            productId: productIds
        },
        success: function (data) {
            data = JSON.parse(data)[0];
            $(".dealHouseName").html(data.projectName + data.buildingNo + '栋' + data.unit + '单元' + data.productName + '室');
            $(".dealHouse-price").html((data.totalMoney/1).toFixed(2));
            $(".typeNum").html(data.modelName);
            $(".houseType").html( data.modelType );
            $(".houseArea").html((data.area/1).toFixed(2)+'m²');
            $(".unitPrice").html('￥'+(data.totalMoney/data.area).toFixed(2)+'万/m²');
        }
    })
}

//提交订单
function Deal() {
    $.ajax({
        url: url+"Deal",
        type: "get",
        dataType: 'jsonp',
        jsonp: "callback",
        data: {
            projectId: projectId,
            customerId: customerId,
            productId: productIds,
            userId: userId
        },
        success: function (data) {
            if (data > 0) {
                YDUI.dialog.toast('提交成功', 'success', 1000);
                setTimeout(function () {
                    window.location.reload();
                }, 1000)
            } else if (data == 0) {
                YDUI.dialog.toast('认购数量达到上限', 'error', 1000);
            } else if(data == -101){
                YDUI.dialog.toast('开盘时间未到不能购买', 'error', 1000);
            }else if(data == -102){
                YDUI.dialog.toast('该房源已售或者待售', 'error', 1000);
            }else{
                YDUI.dialog.toast('提交失败', 'error', 1000);
            }
        }
    })
}