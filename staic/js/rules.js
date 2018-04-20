var projectId;
var customerId;
var sortIndex;
var token = "";

$(function () {

    CheckToken();

    //关闭弹出框
    $(".close").click(function () {
        $(".mask").hide();
        $(".rockNumTip").hide();
    });

    $(".toIndex").on('touchstart',function () {
        window.location.href = 'index.html';
    });


});

//检查token
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
                Customer_query(customerId);
            } else {
                window.location.href = "login.html";
            }
        }
    })
}

//客户查询
function Customer_query(customerId) {
    $.ajax({
        url: url + "Customer_query",
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
            projectId = JSON.parse(data)[0].projectId;
            sortIndex = JSON.parse(data)[0].sortIndex;
            if(sortIndex == -1){
                countDown();
                ProjectInfo_query();
            }else{
                window.location.href = 'index.html';
            }
        }
    })
}

//项目信息
function ProjectInfo_query() {
    $.ajax({
        url: url + "ProjectInfo_query",
        type: "get",
        dataType: 'jsonp',
        jsonp: "callback",
        data: {
            projectId: projectId
        },
        success: function (data) {
            data = JSON.parse(data)[0];
            $(".kp-name").html(data.projectName);
            // 开盘规则
            $(".rules-content").html(data.openRule);
        }
    });
}

//倒计时
function countDown() {
    var rockTime = 5;
    var timer = setInterval(function () {
        rockTime--;
        if (rockTime === 0) {
            clearInterval(timer);
            $(".rockNum").addClass("but");
            $(".rockNum").addClass("rockNum-active");
            $(".rockNum").html("开始摇号");
            $(".rockNum").removeAttr("disabled");
            Properties_query();
        } else {
            $(".rockTime").html(rockTime);
        }
    }, 1000);
}

//查询摇号/秒开
function Properties_query() {
    $.ajax({
        url: url + "Properties_query",
        type: "get",
        dataType: 'jsonp',
        jsonp: "callback",
        data: {
            projectId: projectId
        },
        success: function (data) {
            var skipMode = JSON.parse(data)[0].skipMode;  //开盘方式; 0代表秒开; 1代表分批;
            var queueMode = JSON.parse(data)[0].queueMode; //是否摇号; 0代表摇号  1代表不摇号;
            if (skipMode == 1) {
                if(queueMode == 0){
                    $(".rockNum").on("click",function(){
                        YDUI.dialog.loading.open('摇号中');
                        setTimeout(function () {
                            YDUI.dialog.loading.close();
                            autoSort();
                        }, 2000);
                    })
                }else {
                    $(".rockNum").html("开始抢房");
                    $(".rockNum").on("click",function(){
                        window.location.href = "index.html"
                    })
                }
            }else{
                $(".rockNum").html("开始抢房");
                $(".rockNum").on("click",function(){
                    window.location.href = "index.html"
                })
            }
        }
    })
}

// 摇号
function autoSort() {
    $.ajax({
        url: url+"AutoSort",
        type: "get",
        dataType: 'jsonp',
        jsonp: "callback",
        data: {
            projectId: projectId,
            customerId: customerId
        },
        success: function (data) {
            if (data > 0) {
               $(".mask").show();
               $(".rockNumTip").show();
               $(".rockNum-result").html(data);
            }else{
                YDUI.dialog.toast('摇号失败', 'error', 1000);
            }
        }
    });
}
