var token;
var projectId;
var customerId;
var sortIndex;


$(function () {
    CheckToken();

    //点击到项目详情
    $("#toLoupanDetail").click(function () {
        window.location.href = "rockNum.html";
    });

});

//获取customerId，判断登陆
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
                customerId = data;
                Customer_query(customerId);
            } else {
                window.location.href = "login.html";
            }
        }
    })
}

//获取projectId
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
            sortIndex = JSON.parse(data)[0].sortIndex;
            projectId = JSON.parse(data)[0].projectId;
            $.cookie("projectId", projectId, {expires: 1, path: '/'});
            Properties_query();
            ProjectInfo_query();
            Model_query();
        }
    })
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
            data = JSON.parse(data)[0];
            // 开盘时间
            var skipMode = data.skipMode;
            var timer = data.startTime.split(" ");
            var year = timer[0].split("/");
            var hour = timer[1].split(":");
            $(".year").html(year[0]);
            $(".month").html(year[1]);
            $(".day").html(year[2]);
            $(".hour").html(hour[0]);
            $(".minute").html(hour[1]);
            $(".second").html(hour[2]);
            if (skipMode == 0) {
                $(".skipMode").html("秒开");
            } else {
                $(".lineIndex").html(sortIndex);
            }
        }
    })
}

//楼盘信息展示
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
            //项目图片
            getProjectPhotos(data.pictures);
            //项目信息
            $(".rockNum-title").html(data.projectName);
            $(".loupanName").html(data.projectName);
            $(".loupan-adress").html(data.projectAddress);
            // 开盘规则
            $(".kaipan-rules").html(data.openRule);
            // 楼盘信息
            $(".build-address").html(data.projectAddress);
            $(".developer").html(data.developer);
            $(".manager").html(data.manager);
            $(".households").html(data.totalCount + '户');
            $(".land-area").html(data.totalArea + '㎡');
            // 联系方式
            $(".dynatown").html(data.phone);
            $(".telbut").attr("href", "tel:" + data.phone);
        }
    });
}

// 户型信息
function Model_query() {
    $.ajax({
        url: url + "Model_query",
        async: true,
        type: "post",
        dataType: 'jsonp',
        jsonp: "callback",
        data: {
            projectId: projectId,
            modelId: -1,
            modelName: ""
        },
        success: function (data) {
            data = JSON.parse(data);
            var list = "";
            var tag = "";
            if(data.length >0){
                //户型信息
                $.each(data, function (i, o) {
                    //户型图片
                    getModelphoto(o.pictures);
                    //户型信息
                    list += '<div class="ht-item swiper-slide">';
                    list += '<div class="floor-plans">';
                    list += '<span class="typeCode">' + o.modelName + '</span>';
                    list += '<img class="ht-img" src="" alt="户型图">';
                    list += '</div>';
                    list += '<p class="huxing-info"><span class="houseType">' + o.modelType + '</span>';
                    list += '<p><span class="houseAmount">共' + o.count + '套</span></p>';
                    list += '</div>';
                });
                $(".ht-content").html(list);

                // 楼盘户型标签
                var modelTypeArr = [];
                $.each(data, function (i, o) {
                    modelTypeArr.push(o.modelType);
                });

                //户型标签去重
                var resultArr = [];
                modelTypeArr.forEach(function (v,i,arr) {
                    if(arr.indexOf(v,i+1) === -1){
                        resultArr.push(v)
                    }
                });

                $.each(resultArr,function (i,o) {
                    tag += '<span class="tag">' + o+ '</span>';
                });
                $(".type-tag").html(tag);

            }else{
                $(".swiper-pagination").hide();
                $(".ht-content").html('暂时没有房源信息')
            }
        }
    });
}

// 楼盘图片
function getProjectPhotos(photoId) {
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
                $(".projectImg").attr("src", '../staic/images/noPic.png');
            } else {
                var projectUrl = data.data.data[0].photoUrl;
                $(".projectImg").attr("src", projectUrl);
            }
        }
    })
}

// 户型图片
function getModelphoto(photoId) {
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
                $(".ht-img").attr("src", '../staic/images/noPic.png');
            } else {
                var mnodelUrl = data.data.data[0].photoUrl;
                $(".ht-img").attr("src", mnodelUrl);
            }
        }
    })
}
