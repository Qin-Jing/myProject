/*
 * 
 * 基类
 * 
 * 
 */
function BaseClass(){
	
};
BaseClass.prototype = {
	loader: function(){
		//需要从服务器请求数据
		var args = Array.prototype.slice.call(arguments);
		if(Object.prototype.toString.call(args[0]) == "[object Object]" && !$.isEmptyObject(args[0])){
			var that =this;
			$.ajax({
		        type: args[0].hasOwnProperty("type") ? args[0].type : "get",
		        url: args[0].url,
		        data: args[0].hasOwnProperty("data") ? args[0].data : {},
		        dataType: args[0].hasOwnProperty("dataType") ? args[0].dataType : "json",
		        success: function(res){
		        	if(args[2] && typeof args[2].dataFormat == "string"){
		        		that.dataFormat(res, args[2], args[3]);
		        	}
		        	//调用外部dataFormat
		        	if(args[2] && Object.prototype.toString.call(args[2].dataFormat) == "[object Function]"){
		        		args[2].dataFormat.call(that, res, args[2], args[3]);
		        	}
		        	if(args[1]){
		        		for(var item = 0; item < args[1].length; item++){
			        		args[1][item].call(that, res, args[3]);
			        	}
		        	}
		        	
		        },
				error: function(){
					throw new Error("AJAX 异常！");
				}
		
		    });
		}
		else{
		//if($.isEmptyObject(args[0]) || args[0] == "" || !args[0]){
			if(args[1]){
        		for(var item = 0; item < args[1].length; item++){
	        		args[1][item].call(this, args[3]);
	        	}
        	}
		}
	},
	
    dataFormat: function(res, dataField, extend){
       	var textField = dataField.textField;
		var valueField = dataField.valueField;
		for(var i = 0; i < res.length; i++) {
			var jsonTemp = {};
			if(res[i][valueField] && res[i][textField]){
				jsonTemp[valueField] = res[i][valueField];
				jsonTemp[textField] = res[i][textField];
				dataField.data.push(jsonTemp);
			}
			
		}
    },

	destroy: function(){
		
	},
	
	extendMethod: function(){
		
	}
};

/*
 * 
 * 继承方法
 * 
 * 
 */

function extend(){
    if(arguments[2]){
        for(var i = 2; i < arguments.length; i++){
            arguments[0].prototype[arguments[i]] = arguments[1].prototype[arguments[i]];
        }
    }else{
        for(methodName in arguments[1].prototype){
            if(!arguments[0].prototype[methodName]){
                arguments[0].prototype[methodName] = arguments[1].prototype[methodName];
            }
        }
    }
}


/**
 * Created by Administrator on 2016-12-19.
 */
/**
 *      说明：生成自定义的下拉选择框
 对象创建：$("#itemSel").customSelect(options)
 参数说明：options:{
                         width:100,   内容宽度
                         show:true,　 初次创建时是否显示
                         heigth:200   内容的高度
                        lineHeight:30,  元素的行高
                        fontSize:"12px"　字体大小
                         }
 事件说明：
 getValue()                 得到选择框的值
 setValue()                 设置选项框显示的值
 change(function(){.....})  当选择框值发生改变时，触发该事件
 show()  显示控件
 hide()  隐藏控件
 <select id="itemSel">
 <option value="P,Z">全部</option>
 <option value="P">雨量</option>
 <option value="Z" selected="selected">水位</option>
 </select>
 *
 *
 *
 */
;(function($, window, document,undefined) {
    $.fn.customSelect = function(options) {
        var defaults = {
            width: 100,
            height: 250,
            show:true,
            lineHeight:30,
            fontSize:"12px",
            enabled:true
        };
        this.opts = $.extend({}, defaults, options);
        //console.log(this.opts);
        this.wrap = null;
        this.value = "";
        this.mask = null;
        this.disabled = false;
        var _oSelf = this;
        var $this = $(this);

        var _create = function(){  // 创建对象
            $this.hide();
            var tag_select = $('<div></div>');//div相当于select标签
            _oSelf.wrap = tag_select;
            tag_select.addClass('select_box')
                .css({
                    "line-height":_oSelf.opts.lineHeight + 'px',
                    "font-size":_oSelf.opts.fontSize
                });
            var width = _oSelf.opts.width;
            tag_select.width(width);

            tag_select.insertBefore(_oSelf);//插入select_container选中的内容

            //显示框class为select_showbox,插入到创建的tag_select中
            _oSelf.mask = $('<div></div>')
                .css({
                    position:'absolute',
                    left:0,
                    top:0,
                    background:"rgba(155,155,155,0.4)",
                    height:_oSelf.opts.lineHeight+2 + 'px',
                    width:width+'px',
                    zIndex:9
                }).appendTo(tag_select);


            if(_oSelf.opts.enabled) _oSelf.mask.hide();
            else _oSelf.mask.show();
            //this.mask.show();
            var select_showbox = $('<div></div>');//显示框
            select_showbox.css({
                    cursor:'pointer',
                    "background-position-x": (width - 18) + 'px',
                    height:_oSelf.opts.lineHeight + 'px'
                })
                .addClass("select_showbox")
                .appendTo(tag_select);

            //创建option容器，class为select_option，插入到创建的tag_select中
            var ul_option = $('<ul></ul>');//创建option列表
            ul_option.attr('class', 'select_option');
            ul_option.css({
                "max-height":_oSelf.opts.height,
                "top":(_oSelf.opts.lineHeight + 2) + 'px',
                overflow:"auto",

            });
            ul_option.width(width - 2);
            ul_option.appendTo(tag_select);

            //创建option对象*****************************
            //获取被选中的元素并将其值赋值到显示框中
            var options = $this.find("option");
            var selected_option = options.filter(':selected');
            var selected_index = selected_option.index();
            var showbox = ul_option.prev();
            showbox.text(selected_option.text());
            _oSelf.value = selected_option.attr("value");
            //为每个option建立个li并赋值
            for (var n = 0; n < options.length; n++) {
                var tag_option = $('<li></li>'),//li相当于option
                    txt_option = options.eq(n).text();
                tag_option.text(txt_option).css('cursor', 'pointer').attr("value", options.eq(n).attr("value")).appendTo(ul_option);
                //为被选中的元素添加class为selected
                if (n == selected_index) {
                    tag_option.attr('class', 'selected');
                }
            }

            if (!_oSelf.opts.show) _oSelf.wrap.hide();

            //点击显示框切换显示隐藏自定义拉下框
            select_showbox.click(function () {
                $('.select_option').not(ul_option).hide();
                ul_option.toggle();
            });

            // 鼠标点击select之外的区域，自定义下拉框隐藏
            $("body").bind("click", function (event) {
                if ($(event.target).parent('.select_box').length == 0) {
                    li_option.removeClass('hover');
                    ul_option.hide();
                }
            });

            var li_option = ul_option.find('li');

            //点击选择项
            li_option.on('click', function () {
                $(this).addClass('selected').siblings().removeClass('selected');
                var text = $(this).text();
                select_showbox.text(text); // 将选中的内容赋值给select_showbox
                ul_option.attr('display', 'none');  // 隐藏整个下拉框
                li_option.removeClass('hover');
                var value = $(this).attr("value");
                var oldValue = _oSelf.value;
                if (value != _oSelf.value) {
                    _oSelf.value = value;
                    $this.value = value;
                    $this.trigger("change",[oldValue]);
                }
            });

            // 鼠标移到选择项
            li_option.hover(function () {
                $(this).addClass('hover').siblings().removeClass('hover');
            }, function () {
                li_option.removeClass('hover');
            });

        };

        this.getValue = function(){
            return this.value;
        };

        this.getText = function(){
            var resultText = ""
            _oSelf.wrap.find("li").each(function(){
                if($(this).attr("value") == this.value){
                    resultText = $(this).text();
                }
            });
            return resultText;
        };

        this.change = function(fn){
            var _this = this;
            $this.change($.proxy(fn, _this));
            return this;
        };

        this.show = function(){
            this.wrap.show();
        };
        this.hide = function(){
            this.wrap.hide();
        };

        this.disable =  function(){
            _oSelf.mask.show();
            _oSelf.disabled = true;
        };

        this.enable =  function(){
            _oSelf.mask.hide();
            _oSelf.disabled = false;
        };

        this.setValue = function(value){
            _oSelf.wrap.find("li").each(function(){
                if($(this).attr("value")==value){
                    $(this).trigger("click");
                }
            });
        };
        this.setText = function(value,text){
            _oSelf.wrap.find("li").each(function(){
                if($(this).attr("value")==value){
                    $(this).text(text);
                }
            });
        };

        this.refresh = function(){
            _oSelf.wrap.remove();
            _create();
        }
        this.destroy = function(){
            _oSelf.wrap.remove();

        }
        _create();
        return this;
    };


})(jQuery, window, document);






/**
 * Created by king on 2017-4-29.
 */

/**
 * 弹出提示框
 对象创建：$.confirmWin(options)
 参数说明：options:{
                         width:100,   弹框宽度
                         height:true,　 弹框高度
                         title:"html格式的主标题"，   弹框主标题
                        text:"html格式内容",  主体内容，可用html标签
                        btnVal:"删除"　提交按钮
                        inputCss：{ }  input样式
                        submitFn：function(){}  点击提交按钮执行的函数
                         }
 事件说明：

 *
 */
;(function($){
    $.confirmWin = function(options){
        var defaults = {
            width:400,
            height:300,
            title:"html格式的主标题",
            text:"html格式内容",
            btnVal:"删除",
            enterBtn:true,
            submitFn:function(){},
            initEvent:function(){},
            cancelFn:function(){},
            errorCheck:function(){},
            inputCss:{
                width: "398px",
                height: "28px",
                padding: "0 30px 0 10px",
                marginBottom: "10px",
            }
        };
        this.opts = $.extend({},defaults,options);
        
        this.isError = false;
        this.content = null;
        var _this = this;
        var init = function(){
            var maskDiv = $("<div class='confirmWin_mask'></div>");

            var winDiv = $("<div class='confirmWin_winFrame'></div>").css({
                    width: _this.opts.width,
                    height: _this.opts.height,
                }
            );

            var titleDiv = $("<div class='confirmWin_titleDiv'><div class='confirmWin_title'>"
                + _this.opts.title + "</div><div class='confirmWin_closeIcon'></div></div>");

            var contentDiv = $("<div class='confirmWin_content'>"+_this.opts.text+"</div>");
            _this.content = contentDiv;
            if(contentDiv.find("input").length > 0) {
                contentDiv.find("input").css(_this.opts.inputCss);

                contentDiv.find("input").each(function(){
                    $(this).blur(function(){
                        if($(this).attr("required")){
                            this.isError = _this.opts.errorCheck.call($(this).parent());
                        }
                    })
                })

            }

			if(_this.opts.enterBtn){
            	var btnDiv = $("<div class='confirmWin_btnDiv'><div class='confirmWin_enterBtn'>"+_this.opts.btnVal+"</div><div class='confirmWin_cancleBtn'>取消</div>");				
			}else{
            	var btnDiv = $("<div class='confirmWin_btnDiv'><div class='confirmWin_cancleBtn'>取消</div>");								
			}


            maskDiv.appendTo($('body'));
            titleDiv.appendTo(winDiv);
            contentDiv.insertAfter(titleDiv);
            btnDiv.insertAfter(contentDiv);
            winDiv.insertAfter(maskDiv);

            winDiv.css({
                top:($(document).height()/2 - $(winDiv).height()/2)+'px',
                left:($(document).width()/2 - $(winDiv).width()/2)+'px',
            });

            maskDiv.show();
            winDiv.show();

            var closeWin = function(){
                maskDiv.fadeOut(300);
                winDiv.fadeOut(300);
                winDiv.remove();
                maskDiv.remove();

            };
            var cancelInfo = function(){
                if( _this.opts.cancelFn!=null){
                    _this.opts.cancelFn();
                }
                closeWin();
            };

            $(".confirmWin_closeIcon").click(cancelInfo);
            $(".confirmWin_cancleBtn").click(cancelInfo);
            $(".confirmWin_enterBtn").click(function(){
                var returnValue = _this.opts.submitFn.call(_this.content);
                if(returnValue||returnValue==null){
                    closeWin();
                };
            });
            _this.opts.initEvent()
        };
        init();

    }

})(jQuery);

/**
 *
 *表单弹出框
 *
 *
 *
 *
 */
;(function($){
	var obj = {};
    $.formWin = function(options){
        var defaults = {
            width:400,
            height:300,
           	right:20,
           	position:"mid-center",
            title:"html格式的主标题",
            contentTag:"document",
            btnVal:"提交",
            modal:true,
            isNeedBtn:true,  //是否需要底部button按钮
            dataFlag:"",
            submitFn:function(){},
            cancelFn:function(){},
            errorCheck:function(){},
            initEvent:function(){}
        };
        this.opts = $.extend({},defaults,options);
        
        this.content = null;
        var _this = this;
        obj["data"+_this.opts.dataFlag] = this.opts;
        var init = function(){
        	
        	var data = $(document).data("formWin_" + _this.opts.dataFlag);
        	var dataFlag = $(document).data("dataFlag" + _this.opts.dataFlag);
 			if(!data){
				$(document).data("formWin_" + _this.opts.dataFlag, (data = $(_this.opts.contentTag).html()));
//				
				$(_this.opts.contentTag).remove();
			}else{
				_this.opts.contentTag = data;
			}

        	
			

            var maskDiv = $("<div class='confirmWin_mask'></div>").css({
            	 width: $(document).width(),
                 height: $(document).height(),
            });

            var winDiv = $("<div class='confirmWin_winFrame'></div>").css({
                    width: _this.opts.width,
                    height: _this.opts.height,
                }
            );
			
			  // 定义窗口大小
            if(_this.opts.width<1) _this.opts.width *= $(document).width();
            if(_this.opts.height<1) _this.opts.height *= $(document).height();
            winDiv = $("<div class='confirmWin_winFrame'></div>").css({
                    width: _this.opts.width,
                    height: _this.opts.height,
                }
            );
			
            var titleDiv = $("<div class='confirmWin_titleDiv'><div class='confirmWin_title'>"
                + _this.opts.title + "</div><div class='confirmWin_closeIcon'></div></div>");

            var contentDiv = $("<div class='confirmWin_content'></div>");
            _this.content = contentDiv;


            var btnDiv = $("<div class='confirmWin_btnDiv'><div class='confirmWin_enterBtn' dataflag = "+_this.opts.dataFlag+">"+_this.opts.btnVal+"</div><div class='confirmWin_cancleBtn'>取消</div>");
			btnDiv.css({
				left:_this.opts.left+"px"
			})
			
			
            maskDiv.appendTo($('body'));
            titleDiv.appendTo(winDiv);
            contentDiv.insertAfter(titleDiv);
            if(_this.opts.isNeedBtn){
                btnDiv.insertAfter(contentDiv);
            }
            winDiv.insertAfter(maskDiv);
            $(data).appendTo(contentDiv);
            

            // 窗口居中
            var postion = {};
            if($.type(_this.opts.position)=="string"){
                if(_this.opts.position.indexOf("mid")>=0){
                    postion.top = ($(window).height() - $(winDiv).height()) / 2 + $(window).scrollTop() + 'px';
                }else if(_this.opts.position.indexOf("top")>=0){
                    postion.top = 5;
                }else if(_this.opts.position.indexOf("bottom")>=0){
                    postion.bottom = 0;
                }
                if(_this.opts.position.indexOf("center")>=0){
                    postion.left = ($(window).width() - $(winDiv).width()) / 2 + 'px';
                }else if(_this.opts.position.indexOf("left")>=0){
                    postion.left = 0;
                }else if(_this.opts.position.indexOf("right")>=0){
                    postion.right = 0;
                }
             }else{
                postion =  _this.opts.position;
                if(postion.left < 0) postion.left = ($(document).width() - $(winDiv).width()) / 2 + 'px';
                if(postion.top < 0) postion.top = ($(document).height() - $(winDiv).height()) / 2 + 'px';
            }
            winDiv.css(postion);

            maskDiv.show();
            winDiv.show();
			
            var closeWin = function(){
                maskDiv.fadeOut(300);
                winDiv.fadeOut(300);
                //$(data).appendTo(_thisParent);
                $(data).find("input").val("");
                winDiv.remove();
                maskDiv.remove();
                

            };
            var cancelInfo = function(){
                if( _this.opts.cancelFn!=null){
                    _this.opts.cancelFn();
                }
                closeWin();
            };

            $(".confirmWin_closeIcon").click(cancelInfo);
            $(".confirmWin_cancleBtn").click(cancelInfo);
            $(".confirmWin_enterBtn").click(function(){
                var returnValue = obj["data"+$(this).attr("dataflag")].submitFn.call(_this.content);
                if(returnValue||returnValue==null){
                    closeWin();
                };
            });
            
            _this.opts.initEvent();
        };
        init();
		
    }

})(jQuery);

;(function($){
    $.formWin__ = function(options){
        var defaults = {
            width:400,
            height:300,
           	right:20,
           	position:"mid-center",
            title:"html格式的主标题",
            contentTag:"document",
            btnVal:"提交",
            modal:true,
            submitFn:function(){},
            cancelFn:function(){},
            errorCheck:function(){}
        };
        this.opts = $.extend({},defaults,options);
        
        this.content = null;
        var _this = this;
        var init = function(){
        	var _thisParent  = _this.opts.contentTag.parent();
        	var _thisOrai = _this.opts.contentTag;
//          var _thisOraiNow = _thisOrai;
            var maskDiv = $("<div class='confirmWin_mask'></div>").css({
            	 width: $(document).width(),
                 height: $(document).height(),
            });

            var winDiv = $("<div class='confirmWin_winFrame'></div>").css({
                    width: _this.opts.width,
                    height: _this.opts.height,
                }
            );
			
			  // 定义窗口大小
            if(_this.opts.width<1) _this.opts.width *= $(document).width();
            if(_this.opts.height<1) _this.opts.height *= $(document).height();
            winDiv = $("<div class='confirmWin_winFrame'></div>").css({
                    width: _this.opts.width,
                    height: _this.opts.height,
                }
            );
			
            var titleDiv = $("<div class='confirmWin_titleDiv'><div class='confirmWin_title'>"
                + _this.opts.title + "</div><div class='confirmWin_closeIcon'></div></div>");

            var contentDiv = $("<div class='confirmWin_content'></div>");
            _this.content = contentDiv;


            var btnDiv = $("<div class='confirmWin_btnDiv'><div class='confirmWin_enterBtn'>"+_this.opts.btnVal+"</div><div class='confirmWin_cancleBtn'>取消</div>");
			btnDiv.css({
				left:_this.opts.left+"px"
			})
			
			
            maskDiv.appendTo($('body'));
            titleDiv.appendTo(winDiv);
            contentDiv.insertAfter(titleDiv);
            btnDiv.insertAfter(contentDiv);
            winDiv.insertAfter(maskDiv);
//          contentDiv.html($(_this.opts.contentTag));
            $(_this.opts.contentTag).appendTo(contentDiv);
            

            // 窗口居中
            var postion = {};
            if($.type(_this.opts.position)=="string"){
                if(_this.opts.position.indexOf("mid")>=0){
                    postion.top = ($(window).height() - $(winDiv).height()) / 2 + $(window).scrollTop() + 'px';
                }else if(_this.opts.position.indexOf("top")>=0){
                    postion.top = 5;
                }else if(_this.opts.position.indexOf("bottom")>=0){
                    postion.bottom = 0;
                }
                if(_this.opts.position.indexOf("center")>=0){
                    postion.left = ($(window).width() - $(winDiv).width()) / 2 + 'px';
                }else if(_this.opts.position.indexOf("left")>=0){
                    postion.left = 0;
                }else if(_this.opts.position.indexOf("right")>=0){
                    postion.right = 0;
                }
             }else{
                postion =  _this.opts.position;
                if(postion.left < 0) postion.left = ($(document).width() - $(winDiv).width()) / 2 + 'px';
                if(postion.top < 0) postion.top = ($(document).height() - $(winDiv).height()) / 2 + 'px';
            }
            winDiv.css(postion);

            maskDiv.show();
            winDiv.show();

            var closeWin = function(){
                maskDiv.fadeOut(300);
                winDiv.fadeOut(300);
                $(_thisOrai).appendTo(_thisParent);
                $(_thisOrai).find("input").val("");
                winDiv.remove();
                maskDiv.remove();
                

            };
            var cancelInfo = function(){
                if( _this.opts.cancelFn!=null){
                    _this.opts.cancelFn();
                }
                closeWin();
            };

            $(".confirmWin_closeIcon").click(cancelInfo);
            $(".confirmWin_cancleBtn").click(cancelInfo);
            $(".confirmWin_enterBtn").click(function(){
                var returnValue = _this.opts.submitFn.call(_this.content);
                if(returnValue||returnValue==null){
                    closeWin();
                };
            });
        };
        init();
		
    }

})(jQuery);


/**
 * 一般弹出窗
 对象创建：$.dialog(options)
 参数说明：options:{
                         width:100,   弹框宽度
                         height:true,　 弹框高度
                         title:"html格式的主标题"，   弹框主标题
                        text:"html格式内容",  主体内容，可用html标签
                        btnVal:"删除"　提交按钮
                        inputCss：{ }  input样式
                        submitFn：function(){}  点击提交按钮执行的函数
                         }
 事件说明：

 *
 */
;(function($){
    $.window = function(options){
        var defaults = {
            width:400,
            height:300,
            title:"html格式的主标题",
            text:"html格式内容",
            modal:false,
            fullScreen:true,
            position:"mid-center",
            inputCss:{
                width: "398px",
                height: "28px",
                padding: "0 30px 0 10px",
                marginBottom: "10px",
            }
        };
        this.opts = $.extend({},defaults,options);
        this.content = null;
        var _this = this;
        var init = function(){
            // 定义遮罩层
            var maskDiv = $("<div class='window_mask'></div>");

            // 定义窗口大小
            if(_this.opts.width<1) _this.opts.width *= $(document).width();
            if(_this.opts.height<1) _this.opts.height *= $(document).height();
            var winDiv = $("<div class='window_frame'></div>").css({
                    width: _this.opts.width,
                    height: _this.opts.height,
                }
            );
            // 如果显示全屏时，尺寸为全屏
            if(_this.opts.fullScreen){
                winDiv.css({
                    width: $(document).width(),
                    height:$(document).height()
                });  
            }

            // 定义窗口标题
            var titleDiv = $("<div class='window_titleDiv'><div class='window_title'>"
                + _this.opts.title + "</div><div class='window_closeIcon'></div></div>");

            // 定义窗口内容
            var contentDiv = $("<div class='window_content'>"+_this.opts.text+"</div>");
            _this.content = contentDiv;

            // 加入各个div到文档中
            if(_this.opts.modal) maskDiv.appendTo($('body'));
            titleDiv.appendTo(winDiv);
            contentDiv.insertAfter(titleDiv);
            //btnDiv.insertAfter(contentDiv);
            if(_this.opts.modal) winDiv.insertAfter(maskDiv);
            else winDiv.appendTo($('body'));

            // 窗口居中
            var postion = {};
            if(_this.opts.fullScreen){
            	postion.top = 0;
            	postion.left = 0;
            }else{
                if($.type(_this.opts.position)=="string"){
	                if(_this.opts.position.indexOf("mid")>=0){
	                    postion.top = ($(window).height() - $(winDiv).height()) / 2 + $(window).scrollTop() + 'px';
	                }else if(_this.opts.position.indexOf("top")>=0){
	                    postion.top = 5;
	                }else if(_this.opts.position.indexOf("bottom")>=0){
	                    postion.bottom = 0;
	                }
	                if(_this.opts.position.indexOf("center")>=0){
	                    postion.left = ($(window).width() - $(winDiv).width()) / 2 + 'px';
	                }else if(_this.opts.position.indexOf("left")>=0){
	                    postion.left = 0;
	                }else if(_this.opts.position.indexOf("right")>=0){
	                    postion.right = 0;
	                }
	             }else{
	                postion =  _this.opts.position;
	                if(postion.left < 0) postion.left = ($(document).width() - $(winDiv).width()) / 2 + 'px';
	                if(postion.top < 0) postion.top = ($(document).height() - $(winDiv).height()) / 2 + 'px';
	            }        	
            }

            winDiv.css(postion);
            
            // 如果是模式窗口，显示遮罩层
            if(_this.opts.modal) maskDiv.show();
            winDiv.show();

            var closeWin = function(){
                if(_this.opts.modal) maskDiv.fadeOut(300);
                winDiv.fadeOut(300);
                winDiv.remove();
                if(_this.opts.modal) maskDiv.remove();

            };
            var cancelInfo = function(){
                if( _this.opts.cancelFn!=null){
                    _this.opts.cancelFn();
                }
                closeWin();
            };

            $(".window_closeIcon").click(cancelInfo);

            var scrollTop_S = $(window).scrollTop();
            $(document).on('scroll',function(){
                winDiv.css("top",($(window).scrollTop()-scrollTop_S) + parseInt(winDiv.css('top')));
                scrollTop_S = $(window).scrollTop();
            });

        };
        init();


		// 移动框子的效果
	(function(){
		if(!_this.opts.modal){
			var isDown = false; 
	    	var oX = 0,oY = 0;
	    	$(".window_titleDiv").mousedown(function(e){
	    		oX =  parseInt(e.clientX)-$(".window_titleDiv").offset().left;
	    		oY =  parseInt(e.clientY)-$(".window_titleDiv").offset().top;
	    		$(this).css("cursor","move")
	    		isDown = true;
	    	});
	    	$(document).mousemove(function(e){
	    		if(isDown){
	    			$(".window_frame").css({"left":e.clientX- oX,"top":e.clientY -oY});
	    			
	    			// 如果运动到最左边，那么会出现三种情况
	    			/*
	    			 * 第一种，左上
	    			 * 第二种，左中
	    			 * 第三种，左下
	    			 */
	    			if( parseInt($(".window_frame").css("left")) < 0){
	    				
	    				// 左中
	    				$(".window_frame").css({"left":0,"top":e.clientY -oY});
	    				
	    				//左上
	    				if(parseInt($(".window_frame").css("top")) < 0){
		    				$(".window_frame").css({"left":0,"top":0});
		    			}
	    				// 左下
	    				else if(parseInt($(".window_frame").css("top")) > $(window).height()- $(".window_frame").height()){
		    				$(".window_frame").css({"left":0,"top":$(window).height()- $(".window_frame").height()});
		    			}
	    			}
	    			
	    			
	    			// 如果运动到右边也是三种
	    			/*
	    			 * 第一种，右上
	    			 * 第二种，右中
	    			 * 第三种，右下
	    			 */
	    			else if(parseInt($(".window_frame").css("top")) > $(window).height()- $(".window_frame").height()){
	    				$(".window_frame").css({"left":e.clientX- oX,"top":$(window).height()- $(".window_frame").height()});
	    				
	    				if( parseInt($(".window_frame").css("left")) < 0){
	    					$(".window_frame").css({"left":0,"top":$(window).height()- $(".window_frame").height()});
	    				}else if(parseInt($(".window_frame").css("left")) > $(window).width()- $(".window_frame").width()){
	    					$(".window_frame").css({"left":$(window).width()- $(".window_frame").width(),"top":$(window).height()- $(".window_frame").height()});
	    				}
	    			}
	    			
	    			// 运动到上方
	    			else if(parseInt($(".window_frame").css("top")) < 0){
	    				$(".window_frame").css({"left":e.clientX- oX,"top":0});
	    				if(parseInt($(".window_frame").css("left")) > $(window).width()- $(".window_frame").width()){
		    				$(".window_frame").css({"left":$(window).width()- $(".window_frame").width(),"top":0});
		    			}
	    				
	    			}
	    			
	    			// 运动到下方
	    			else if(parseInt($(".window_frame").css("left")) > $(window).width()- $(".window_frame").width()){
	    				$(".window_frame").css({"left":$(window).width()- $(".window_frame").width(),"top":e.clientY -oY});
	    				
	    				if(parseInt($(".window_frame").css("top")) < 0){
		    				$(".window_frame").css({"left":$(window).width()- $(".window_frame").width(),"top":0});
		    			}
	
	    			}
	    			
	    			
	    			
	    		}
	    	});
	    	
		    	$(document).mouseup(function(){
		    		
		    		isDown = false;
		    	});
			}
		}
	)();

    }

})(jQuery);

/**
 *模块下菜单
 *
 *
 */
;(function($, window, document, undefined){
    $.fn.modelMenu =  function(options){
        var defaults = {
            urlContainer: "document",
            menuList:[],
            width:68,
            height:100,
            direction:"vertical"// 方向：水平horizontal，垂直vertical
        };
        this.opts = $.extend({}, defaults, options);

        var _this = this;
        var $this = $(this);

        var _create = function(){

            var MenuHtml = "";
            var menuList = _this.opts.menuList;
            if(_this.opts.direction=="vertical") $this.addClass("modelMenu_ul");
            else $this.addClass("modelMenu_ul_h");
            
            if(_this.opts.direction=="vertical")　$this.width(_this.opts.width);
            for(var key in menuList){
                MenuHtml += "<li url='" + menuList[key].Url + "'>";
                if(menuList[key].iconStyleHtml) MenuHtml += "<p>"+menuList[key].iconStyleHtml+"</p>";
                MenuHtml += "<p>" + menuList[key].Name + "</p>" + "</li>";
            }

            $this.html(MenuHtml);
            $this.find("li").css({
                height:_this.opts.height,
                lineHeight:_this.opts.height+'px'
            });

            $(_this.opts.urlContainer).addClass("modelMenu_Content");
            $(_this.opts.urlContainer).html("<iframe class='modelMenu_urlContent' scrolling='no' frameborder='0' framespacing='0' style='width: 100%; height: 100%; position: relative;'></iframe>" +
                "<div class='dhx_cell_progress_bar'></div>" +
                "<div class='dhx_cell_progress_img'></div>");

            $this.on("click","li",function(){
                $(".dhx_cell_progress_bar").show();
                $(".dhx_cell_progress_img").show();
                $(this).siblings().removeClass("active");
                $(this).addClass("active");
                $(".modelMenu_urlContent").attr("src",$(this).attr("url"));
            });

            $(".modelMenu_urlContent").load(function(){
                $(".dhx_cell_progress_bar").hide();
                $(".dhx_cell_progress_img").hide();
            });

            $this.find("li").eq(0).trigger("click");
        };

        _create();
        return this;
    };


})(jQuery, window, document);





/*
 * directions
 * 生成自定义的tab切换页
 * 
 * params
 * element:调用插件的jquery元素；options：配置参数
 * extendCallback：点击切换时的自定义事件（点击各个选项有不同的处理时可用）
 * 
 * event
 * init：初始化数据
 * dataFormat：整理数据格式
 * addTabTitle：生成tab切换选项
 * addTabContent： 生成选项对应的区域
 * 
 * example
 * 
 * 
 * $(".task_tab_warp").ytTabs({
 *	 	tabTitle:["基本信息", "上报附件"],
 *		extendCallback: []
 * });
 * 
 */
(function($){
	var ytTabs = function(element, options){
		var defaults = {};
		var $elem = $(element);
		this.$elem = $elem;
		this.options = $.extend({}, defaults, options);
		this.tabTitle = this.options.tabTitle || [];
		this.lengths = this.tabTitle.length || 0;
		var extendCallback = this.options.extendCallback;
		this.init();
		$elem.find(".ytTabs_nav li").click(function(){
			if($(this).hasClass("active")){
				return;
			}
			var i = $(this).index();
			if(typeof extendCallback[i] == "function") {
				extendCallback[i](i);
			}
			$(this).siblings().removeClass("active").end().addClass("active");
			$(this).parent().siblings(".ytTabs_content").find(">div").removeClass("active").eq(i).addClass("active");
		});
	};
	ytTabs.prototype.init = function(){
		this.addTabTitle(this.tabTitle);
		this.addTabContent(this.lengths);
	}
	ytTabs.prototype.showTab = function(index) {
		this.$elem.find(".ytTabs_nav li").eq(index).click();
	}
	ytTabs.prototype.addTabTitle = function(tabTitle){
		$("<div></div>").addClass("ytTabs").appendTo(this.$elem);
		if(tabTitle.length == 0){
			return;
		}
		$("<ul></ul>").addClass("ytTabs_nav").appendTo(this.$elem.find(".ytTabs"));
		
		for(var i = 0; i < tabTitle.length; i++){
			$("<li></li>").text(tabTitle[i]).appendTo(this.$elem.find(".ytTabs ul"));
		}
		this.$elem.find("ul.ytTabs_nav li:first-child").addClass("active");
	}
	ytTabs.prototype.addTabContent = function(lengths){
		$("<div></div>").addClass("ytTabs_content").appendTo(this.$elem.find(".ytTabs"));
		if(lengths == 0){
			this.$elem.find(".ytTabs_content").css("margin-top", "0").append($("<div></div>"));
		}
		for(var i = 0; i < lengths; i++){
			$("<div></div>").appendTo(this.$elem.find("div.ytTabs_content"));
		}
		this.$elem.find("div.ytTabs_content>div:first-child").addClass("active");
	}
	
	ytTabs.prototype.fillTabContent = function(params){
		if(typeof params === "function"){
			params.call(this, this.$elem.find("div.ytTabs_content>div"));
		}
		if(Object.prototype.toString.call(params) != "[object Array]"){
			return;
		}
		for(var i = 0, len=params.length; i < len; i++){
			if(typeof params[i].renderDOM === "string"){
				this.$elem.find(".ytTabs_content>div").eq(params[i].index).html(params[i].renderDOM);
			}
			if(typeof params[i].renderDOM === "function") {
				params[i].renderDOM(this.$elem.find("div.ytTabs_content>div").eq(params[i].index), params[i].index);
			}
		}
		
		
		return this;
	}
	function Plugin(option, o){
		this.each(function(){
			
			var $this = $(this);
			var data = $this.data("bs.ytTabs");
			var options = typeof option == "object" && option;
			$this.data("bs.ytTabs", (data = new ytTabs(this, options)));
			result = data;
			if(typeof option === "string"){
				data[option](o);
				result = data[option](o);
			}
		});
		return result;
	}
	$.fn.ytTabs = Plugin;
	$.fn.ytTabs.constructor = ytTabs;
})(jQuery);


/*
 * directions
 * 生成自定义的下拉框
 * 
 * params
 * element:调用插件的jquery元素；options：配置参数
 * 
 * event
 * loader：初始化数据
 * dataFormat：整理数据格式
 * createLabel：生成标题栏
 * createOption： 生成下拉框
 * 
 * 控件初始化
 * $(".sel_position").ytSelect({
 *		data: baseData,
 *		url: baseUrl + "obj/getObjLocationList",
 *		textField: "addvnm",
 *		valueField: "addvcd"
 *	});
 * 
 * 控件显示
 * $(".sel_classify").ytSelect("show");
 * 
 * 
 * // 事件：
 * 1、chanage事件
    $(".sel_classify").ytSelect("change", function(e,oldValue,newValue){}); //当发生change事件时，触发函数
 * 
 */
;(function($, window, document, undefined) {
	var ytSelect = function(element, options){
		var $elem = $(element);
		var _this = this;
		this.elem = $elem;
		var defaults = {
			width: 160,
            height: 250,
            labelWidth: 60,
            show: false,
            lineHeight: 28,
            verticalAlign: "center",
            fontSize: "12px",
            fontWeight: "normal",
            enabled: true,
            dataFormat: "",
            url:{},
            //url: "",
            successFun:function () {},
            data: {
            	label: "",
            	value: []
            },
            textField:"",
            valueField:""
		};
		this.opts = $.extend({}, defaults, options);
		// 创建控件
		this.create = function(){
			//this.loader(this.opts.url);
			this.loader(this.opts.url, [this.createLabel, this.createOption, this.opts.successFun], {textField: this.opts.textField, valueField: this.opts.valueField, data: this.opts.data.value, dataFormat: this.opts.dataFormat});
		};
		this.create();
		
		// 点击显示框时，显示和隐藏下拉框列表
		$elem.on("click", ".ytSelect_showbox", function(e){
			$(this).toggleClass("active"); 
  
			$(this).siblings("ul.ytSelect_option").stop(true).slideToggle();
			
		});
		
		// 点击下拉箭头时，显示和隐藏下拉框列表
		$elem.on("click", ">i", function(){
			$(this).prev(".ytSelect_showbox").trigger("click");
			
		});
		
//		$(window).bind("click", function (event) {
//			var e = event || window.event;
//  		var target = e.target || e.srcElement;
//          if ($(target).parents(".ytSelect_wrap").length == 0) {
//              $("ul.ytSelect_option").slideUp();
//              $(".ytSelect_showbox").removeClass("active");
//          }
//      });
        
        // 鼠标离开控件后，下拉框自动隐藏
        $elem.on("mouseleave",function(){
        	// 改变显示框对象样式
        	$(this).find(".ytSelect_showbox").removeClass("active");
        	// 改变显示框对象样式
        	$(this).find(".ytSelect_option").slideUp();
        	
        });
        
        // 单击某一下拉列表选项时，选中该对象
		$elem.on("click", ".ytSelect_option li", function(){
			// 得到旧值
			var oldValue = $(this).parent().siblings(".ytSelect_showbox").attr("value");
			// 得到新值
			var newValue = $(this).attr("value");
			if(oldValue==newValue) return;
			
			// 选中选项和未选中选项的样式设置
			$(this).addClass("active").siblings().removeClass("active");
			// 选中选项前加入图标
			$(this).prepend("<i class='icon iconfont icon-gou selct_gou_icon'/></i>").siblings().find(".selct_gou_icon").remove();
			// 下拉框缩回
			$(this).parent().slideUp();
			// 设置当前选中选项值到ytSelect_showbox中，值为选中选项的值，文字是选中选项的文字
			$(this).parent().siblings(".ytSelect_showbox").attr("value", $(this).attr("value")).text($(this).text()).toggleClass("active");
			
			
			// 触发自定义change事件
			$(this).trigger("change",[oldValue,newValue]);
		});
		
		// 下拉列表选项的鼠标移动时，
		$elem.on("mouseover", ".ytSelect_option li", function(){
			$(this).siblings().removeClass("active");
		});
		
		$elem.on("mouseout", ".ytSelect_option li", function(){
			$elem.find("ul.ytSelect_option li").each(function(index,element){
				$(this).text() == $(this).parent().siblings(".ytSelect_showbox").text() ? $(this).addClass("active") : $(this).removeClass("active");
			});
		});
		return this;	
	};
	
	// 当选项改变时，触发的函数fn绑定
	ytSelect.prototype.change = function(fn){
		var _this = this;
        this.elem.on("change", ".ytSelect_option li", $.proxy(fn, _this));
        return this;
    }
	
	// 得到当前选项值
	ytSelect.prototype.getValue = function(){
		return this.elem.find(".ytSelect_showbox").attr("value");
	}
	
	// 设置当前选项值
	ytSelect.prototype.setValue = function(value){
		var that = this;
		that.elem.find("ul.ytSelect_option li").each(function(index,element){
			if($(this).hasClass("active")){
				$(this).removeClass("active").find(".selct_gou_icon").remove();
			}
			if($(this).attr("value") == value){
				$(this).addClass("active").prepend("<i class='icon iconfont icon-gou selct_gou_icon'/></i>");
				that.elem.find(".ytSelect_showbox").attr("value", value).text($(this).find("span").text());
			}
		});
		return this;
	}
	
	// 控件显示
	ytSelect.prototype.show = function(){
		this.elem.show();
		return this;
	}
	
	// 控件隐藏
	ytSelect.prototype.hide = function(){
		this.elem.hide();
		return this;
	}
	
    // 控件reset
    ytSelect.prototype.reset = function(){
		//this.elem.hide();
	}
    
    
    /*
	ytSelect.prototype.loader = function(url){
		if(url != ""){
			var that = this;
			$.ajax({
		        type: "get",
		        url: url,
		        data: {},
		        dataType: "json",
		        success: function(res){
		        	that.dataFormat(res);
		        	that.createLabel();
					that.createOption();
	                that.opts.successFun(res);
		        },
				error: function(){
					console.log("ajax异常");
				}
		
		    });
		}else{
        	this.createLabel();
			this.createOption();
            this.opts.successFun();
		}
		
	}
	
	ytSelect.prototype.dataFormat = function(temp){
		var textField = this.opts.textField;
		var valueField = this.opts.valueField;
    	for(var i = 0; i < temp.length; i++) {
			var jsonTemp = {};
			jsonTemp.v = temp[i][valueField];
			jsonTemp.t = temp[i][textField];
			this.opts.data.value.push(jsonTemp);
		}
	}
	*/
	
	ytSelect.prototype.createLabel = function(){
		this.elem.addClass("ytSelect_wrap").css({lineHeight: this.opts.lineHeight + "px",fontSize: this.opts.fontSize,fontWeight: this.opts.fontWeight,position: "relative"});
		$("<span></span>").css({height: this.opts.lineHeight + "px",width: this.opts.labelWidth + "px"}).addClass("ytSelect_label").text(this.opts.data.label).appendTo(this.elem);
		$("<div></div>").css({
			width: this.opts.width - this.opts.labelWidth + "px",
			height: this.opts.lineHeight + "px",
			lineHeight: this.opts.lineHeight - 3 + "px"
		}).addClass("ytSelect_showbox").attr("value", this.opts.data.value[0][this.opts.valueField]).text(this.opts.data.value[0][this.opts.textField]).appendTo(this.elem);
		$("<i></i>").css({
			position: "absolute",
			left: this.opts.width - 20 + "px"
//			top: this.opts.lineHeight / 2-12
		}).addClass("icon iconfont icon-xiala1").appendTo(this.elem);
	}
	
	ytSelect.prototype.createOption = function(){
		$("<ul></ul>").attr("class", "ytSelect_option").css({maxHeight: this.opts.height,width: this.opts.width - this.opts.labelWidth + "px",marginLeft: this.opts.labelWidth + "px"}).hide().appendTo(this.elem);
        var options = this.opts.data;
        //为每个option建立个li并赋值
        for (var i = 0; i < options.value.length; i++) {
			$("<li></li>").html("<span>"+options.value[i][this.opts.textField]+"</span>").attr("value", options.value[i][this.opts.valueField]).appendTo(this.elem.find("ul"));
        }
        this.elem.find("ul li:first-child").addClass("active").prepend("<i class='icon iconfont icon-gou selct_gou_icon'/></i>");
	}
	
	//BaseClass.extend()
	extend(ytSelect, BaseClass, "loader", "dataFormat");
	
	function Plugin(){
		/* 得到输入参数
		 * 说明：当只有一个参数时：
		 *               1、参数类型为对象时，说明为创建对象参数。
		 *               2、参数类型为字符时，说明为函数调用，无参数
		 * 当有二个参数时：参数类型为字符时，说明为函数调用，有参数
		 * 
		 */
		var arguments_info = arguments;
	    this.each(function(){
			var args_num = arguments_info.length; //得到参数长度
			var $this = $(this);
			var data = $this.data("bs.ytSelect");
			if(args_num==1){
				var argument = arguments_info[0];
				if(typeof argument == "object"){
					if(!data) $this.data("bs.ytSelect", (data = new ytSelect(this, argument)));
					result = data;
					//console.log(result)
				}
				else if(typeof argument == "string") {
					if(data) result = data[argument]();
				}
			}
			else if(args_num==2){
				if(data) result = data[arguments_info[0]](arguments_info[1]);
			}
		
		});
		
		return result;
	}
	
	$.fn.ytSelect = Plugin;
	$.fn.ytSelect.constructor = ytSelect;
})(jQuery, window, document);

/*
 * directions
 * 生成加载等待遮罩层
 * 
 * params
 * element:调用插件的jquery元素；options：配置参数
 * 
 * event
 * progress 定义遮罩层的状态
 * progressOn 显示遮罩层
 * progressOff 移除遮罩层
 * 
 * example 
 * $("#tableContainer").ytMaskLayer("progressOff")---关闭
 * $("#tableContainer").ytMaskLayer("progressOn")---开启
 */

;(function($, window, document, undefined) {

	var ytMaskLayer = function(element, options){
		this.elem = $(element);
		this.switchs = options.switchs;
		this.progress(this.switchs);
	};
	ytMaskLayer.prototype.progress = function(switchs){
		if(switchs == "on"){
			this.elem.append("<div class=\"maskLayer_progress_bar\"></div><div class=\"maskLayer_progress_img\"></div>");
		}else{
			$(".maskLayer_progress_bar").remove();
			$(".maskLayer_progress_img").remove();
		}
		
	}
	ytMaskLayer.prototype.progressOn = function(){
		this.elem.append("<div class=\"maskLayer_progress_bar\"></div><div class=\"maskLayer_progress_img\"></div>");		
	}
	ytMaskLayer.prototype.progressOff = function(){
		$(".maskLayer_progress_bar").remove();
		$(".maskLayer_progress_img").remove();
	}
	function Plugin(option){
		return this.each(function(){
			var $this = $(this);
			var data = $this.data("bs.ytMaskLayer");
			var options = typeof option == "object" && option;
			if(!data){
				$this.data("bs.maskLayer", (data = new ytMaskLayer(this, options)));
			}
			if (typeof option == "string"){
				data[option]($this);
			}
		});
	}
	$.fn.ytMaskLayer = Plugin;
	$.fn.ytMaskLayer.constructor = ytMaskLayer;
})(jQuery, window, document);

/*
 * directions
 * 通过请求后台接口获取数据，数据展示，事件绑定
 * 
 * params
 * options：配置参数
 * {
 *		interface: {url: url, type: "post", data: postData}, --ajax相关参数
 *		drawHtml: drawTableHtml, --数据展示
 *		eventParams: [{enable: false, type: "", elements: "", bubbleElem: "", event: detailClick}] --绑定的事件相关参数
 *	}
 *  如果不需要绑定事件 ：eventParams: [{enable: false}]
 * 
 * 
 * event
 * dataInit：初始化数据
 * eventInit： 初始化绑定事件
 *  
 * example
 * $.ytPageInit.init({
 *		interface: {url: url, type: "post", data: postData, extend: {rowsId: rowsId}},
 *		drawHtml: drawTableDetailHtml,
 *		eventParams: [{enable: false, event: null}]
 * });
 * 
 */
;(function($, window, document, undefined) {
	var ytPageInit = function(){
	};
	ytPageInit.prototype.init = function(options){
		this.opts = options;
		this.extendCallback = options.extendCallback;
		//this.dataFormat = "",
		this.dataInit(this.opts.interface);
		this.eventInit(this.opts.eventParams);
		if(this.extendCallback){
			this.extendCallback();
		}
		
	}
	ytPageInit.prototype.dataInit = function(interface){
		//this.requestData(interface);
		this.loader(interface, [this.htmlInit], {}, interface.extend);
	}
	
	ytPageInit.prototype.htmlInit = function(response, extend){
		this.opts.drawHtml(response, extend);
	}
	
	/*
	ytPageInit.prototype.requestData = function(interface){
		var that = this;
		var type = interface.type || "get";
		var extend = interface.extend || {};
	    var dataType = interface.dataType || "json";
	    $.ajax({
	        type: type,
	        dataType: dataType,
	        url: interface.url,
	        data: interface.data,
	
	        success: function(res){
	        	that.htmlInit(res, extend);
	        },
			error: function(){
				console.log("ajax异常");
			}
	
	    });
	}
	*/
	
	ytPageInit.prototype.eventInit = function(eventParams){
		for(var i = 0; i < eventParams.length; i++){
			eventParams[i].event = eventParams[i].event || null;
	
			if(eventParams[i].enable && typeof eventParams[i].event == "function"){
				$(eventParams[i].bubbleElem).on(eventParams[i].type, eventParams[i].elements, function(){
					eventParams[i].event();
				});
			}else if(!eventParams[i].enable && typeof eventParams[i].event == "function"){
				eventParams[i].event();
			}
		}

	}
	
	extend(ytPageInit, BaseClass, "loader");
	$.ytPageInit = new ytPageInit();
})(jQuery, window, document);


/*
 * directions
 * 根据列表数据选择所需的配置项
 * 
 * params
 * options：配置参数
 * {
 *		url: conf.baseUrl + "obj/getObjLocationList", //获取数据列表的地址
 *	    textField: "addvnm", 
 *	    valueField: "addvcd",
 *	    existField: {name: ["紧水滩镇", "云和镇"], value: ["331125102000", "33112510000"]}, //已经配置好的选项（可以不配置）
 *	    labelSize: {width: 80, height: 30, name: "选择检修人"}, //文本框的配置
 *		selectBarSize: {width: 300, height: 30}, //标签的配置
 *		placeholderText: "请输入检修人",
 *	}
 *  
 * 
 * 
 * event
 * 
 * 
 *  
 * example
 * $(".text").ytRangeSelect({
 *	    	url: conf.baseUrl + "obj/getObjLocationList",
 *	    	textField: "addvnm",
 *	    	valueField: "addvcd",
 *	    	existField: [{name: "紧水滩镇", value: "331125102000"}, {name: "云和镇", value: "33112510000"}],
 *	    	labelSize: {width: 80, height: 30, name: "选择检修人"},
 *			selectBarSize: {width: 300, height: 30},
 *			placeholderText: "请输入检修人",
 *	    });
 * 
 */

;(function($, window, document, undefined) {
	var CLASS_POINT = ".";
	var CLASS_YTRANGESELECT_WRAP = "ytRangeSelect_wrap";
	var CLASS_YTRANGESELECT_LABEL = "ytRangeSelect_label";
	var CLASS_YTRANGESELECT_BAR = "ytRangeSelect_bar";
	var CLASS_YTRANGESELECT_INPUT_WRAP = "ytRangeSelect_input_wrap";
	var CLASS_YTRANGESELECT_INPUT_TIP = "ytRangeSelect_input_tip";
	var CLASS_YTRANGESELECT_INPUT_FIELD = "ytRangeSelect_input_field";
	var CLASS_YTRANGESELECT_LIST_WRAP = "ytRangeSelect_list_wrap";
	var CLASS_YTRANGESELECT_SELECT_LIST = "ytRangeSelect_select_list";
	var CLASS_YTRANGESELECT_SELECT_ITEM = "ytRangeSelect_select_item";
	var CLASS_YTRANGESELECT_SELECTED_WRAP = "ytRangeSelect_selected_wrap";
	var CLASS_YTRANGESELECT_SELECTED_LIST = "ytRangeSelect_selected_list";
	var CLASS_YTRANGESELECT_SELECTED_ITEM = "ytRangeSelect_selected_item";
	var CLASS_ITEM_NAME = "item_name";
	var CLASS_REMOVE_NAME = "remove_name";
	var ytRangeSelect = function(element, options){
		this.$elem = $(element);
		this.defaults = {
			url: {},
			//type: "",
			//postData: {},
			labelSize: {width: 0, height: 0, name: ""},//标签配置
			selectBarSize: {width: 0, height: 0},//文本框配置
			placeholderText: "",
			dataFormat: "",
			textField: "",//显示字段
			valueField: "",//发送字段
			existField: [{name: "", value: ""}],
			data: {option: [], value: []}
		};
		this.opts = $.extend({}, this.defaults, options);
		this.positionArray = [];
		var _this = this;
		this.init();
		//点击添加所需配置
		this.$elem.on("click", CLASS_POINT + CLASS_YTRANGESELECT_INPUT_WRAP, function(e){
			var e = e || window.event;
    		var target = e.target || e.srcElement;
    		if($(target).hasClass(CLASS_YTRANGESELECT_INPUT_TIP) || $(target).parent().hasClass(CLASS_YTRANGESELECT_INPUT_TIP) || $(target).hasClass(CLASS_YTRANGESELECT_INPUT_FIELD)){
    			e.stopPropagation();
    			$(this).siblings(CLASS_POINT + CLASS_YTRANGESELECT_LIST_WRAP).show();
				$(this).find(CLASS_POINT + CLASS_YTRANGESELECT_INPUT_TIP).hide().end().find(CLASS_POINT + CLASS_YTRANGESELECT_INPUT_FIELD).show().focus();
    		}
		});
		
		//点击关闭
		$("body").bind("click", function (event) {
			var e = event || window.event;
    		var target = e.target || e.srcElement;
            //if ($(target).parents(CLASS_POINT + CLASS_YTRANGESELECT_BAR).length == 0 && !$(target).hasClass(CLASS_YTRANGESELECT_SELECT_ITEM) && !$(target).hasClass(CLASS_REMOVE_NAME)) {
            //if (!$(target).hasClass(CLASS_YTRANGESELECT_INPUT_FIELD) && !$(target).hasClass(CLASS_YTRANGESELECT_SELECT_ITEM) && !$(target).hasClass(CLASS_YTRANGESELECT_SELECTED_ITEM) && !$(target).hasClass(CLASS_REMOVE_NAME)) {
            	$(CLASS_POINT + CLASS_YTRANGESELECT_LIST_WRAP).hide();
                $(CLASS_POINT + CLASS_YTRANGESELECT_INPUT_TIP).show();
                $(CLASS_POINT + CLASS_YTRANGESELECT_INPUT_FIELD).hide();
            //}
        });
        
        //点击配置列表
        this.$elem.on("click", CLASS_POINT + CLASS_YTRANGESELECT_SELECT_ITEM, function(){
        	//改变已选中列表中的数据
        	_this.createRangeSelectedList($(this));
        	//设置样式
        	_this.changeRangeSelectStyle($(this));
       	
        	$(this).remove();
        	
        });
        
        //点击移除图标
        this.$elem.on("click", CLASS_POINT + CLASS_REMOVE_NAME, function(){
        	//改变配置列表中的数据
        	
        	$(this).parent().remove();
        	_this.changeRangeSelectList($(this));
        	_this.changeRangeSelectStyle($(this));
        	      	
        });
        
        this.$elem.on("input propertychange", CLASS_POINT + CLASS_YTRANGESELECT_INPUT_FIELD, function(){
        	var $target = _this.$elem.find(CLASS_POINT + CLASS_YTRANGESELECT_SELECT_ITEM);
        	var itemArray = [];
        	$target.each(function(index){
				itemArray.push($(this).text().trim());
        	});
        	for(var i = 0; i < itemArray.length; i++){
        		itemArray[i].indexOf($(this).val()) == -1 ? $target.eq(i).hide() : $target.eq(i).show();
        	}
        	
        })
        
        return this;
	};
	
	ytRangeSelect.prototype.init = function(){
		//创建基本DOM结构
		this.createBasicHtml();
		
		//创建配置列表
		this.drawRangeSelectHtml();
		
		//初始化已经存在的列表
		this.createRangeSelectedList(this.opts.existField);
		
		//获取数据
		//this.getRangeSelectData(this.opts.url, this.opts.type, this.opts.postData, this.opts.existField);
		this.getRangeSelectData(this.opts.url, {textField: this.opts.textField, valueField: this.opts.valueField, data: this.opts.data, dataFormat: this.opts.dataFormat}, this.opts.existField);
		//初始化样式
		this.initStyle();
		
	}
	
	ytRangeSelect.prototype.initStyle = function(){
		var offsetLeft = Math.ceil(this.$elem.find(CLASS_POINT + CLASS_YTRANGESELECT_SELECTED_WRAP).attr("data-left"), 10);
		var offsetTop = Math.ceil(this.$elem.find(CLASS_POINT + CLASS_YTRANGESELECT_SELECTED_WRAP).attr("data-top"), 10);
		var multiple = offsetTop / this.$elem.find(CLASS_POINT + CLASS_YTRANGESELECT_SELECTED_ITEM).outerHeight(true);//换行标志
		var $input = this.$elem.find(CLASS_POINT + CLASS_YTRANGESELECT_INPUT_WRAP);
		$input.css({height: this.opts.selectBarSize.height * multiple});//文本框的高度
		this.$elem.find(CLASS_POINT + CLASS_YTRANGESELECT_LIST_WRAP).css({left: offsetLeft + 6 + "px", top: $input.outerHeight() + 9 + "px"});//配置列表的位置
		var offsetBottom_input = parseInt(this.$elem.find(CLASS_POINT + CLASS_YTRANGESELECT_INPUT_FIELD).outerHeight() * (multiple - 1), 10);
		this.$elem.find(CLASS_POINT + CLASS_YTRANGESELECT_INPUT_FIELD).css({marginLeft: offsetLeft + "px", marginTop: offsetBottom_input + "px"}).val("");//设置输入框偏移量
		this.$elem.find(CLASS_POINT + CLASS_YTRANGESELECT_INPUT_TIP).css({marginLeft: offsetLeft + "px", marginTop: offsetBottom_input + "px"});//设置输入框偏移量
		this.$elem.css({height: this.$elem.find(CLASS_POINT + CLASS_YTRANGESELECT_INPUT_WRAP).outerHeight()});
	}
	
	ytRangeSelect.prototype.changeRangeSelectList = function(that){
		this.getRangeSelectedPosition();
		this.$elem.find(CLASS_POINT + CLASS_YTRANGESELECT_SELECTED_WRAP).attr({"data-left": this.positionArray[0], "data-top": this.positionArray[1]});
		$("<li></li>").addClass(CLASS_YTRANGESELECT_SELECT_ITEM).attr("value", that.parent().attr("value")).text(that.siblings(CLASS_POINT + CLASS_ITEM_NAME).text()).appendTo(this.$elem.find(CLASS_POINT + CLASS_YTRANGESELECT_SELECT_LIST));
	}

	ytRangeSelect.prototype.changeRangeSelectStyle = function(that){
		var offsetLeft = Math.ceil(this.$elem.find(CLASS_POINT + CLASS_YTRANGESELECT_SELECTED_WRAP).attr("data-left"), 10);
		var offsetTop = Math.ceil(this.$elem.find(CLASS_POINT + CLASS_YTRANGESELECT_SELECTED_WRAP).attr("data-top"), 10);
		var multiple = offsetTop / this.$elem.find(CLASS_POINT + CLASS_YTRANGESELECT_SELECTED_ITEM).outerHeight(true);//换行标志
		multiple = offsetLeft + 100 > this.opts.selectBarSize.width ? multiple + 1 : multiple;
		offsetLeft = offsetLeft + 100 > this.opts.selectBarSize.width ? 6 : offsetLeft;
		var $input = this.$elem.find(CLASS_POINT + CLASS_YTRANGESELECT_INPUT_WRAP);		
		$input.css({height: this.opts.selectBarSize.height * multiple});//文本框的高度
		this.$elem.find(CLASS_POINT + CLASS_YTRANGESELECT_LIST_WRAP).css({left: offsetLeft + 6 + "px", top: $input.outerHeight() + 9 + "px"});//配置列表的位置
		var offsetBottom_input = parseInt(this.$elem.find(CLASS_POINT + CLASS_YTRANGESELECT_INPUT_FIELD).outerHeight() * (multiple - 1), 10);
		this.$elem.find(CLASS_POINT + CLASS_YTRANGESELECT_INPUT_FIELD).css({marginLeft: offsetLeft + "px", marginTop: offsetBottom_input + "px"}).val("");//设置输入框偏移量
		this.$elem.find(CLASS_POINT + CLASS_YTRANGESELECT_INPUT_TIP).css({marginLeft: offsetLeft + "px", marginTop: offsetBottom_input + "px"});//设置输入框偏移量
		this.$elem.css({height: this.$elem.find(CLASS_POINT + CLASS_YTRANGESELECT_INPUT_WRAP).outerHeight()});
		//消除input键入值改变事件的影响
		this.$elem.find(CLASS_POINT + CLASS_YTRANGESELECT_SELECT_ITEM).show();
		
	}
	
	//获取已选中列表总宽度
	ytRangeSelect.prototype.getRangeSelectedPosition = function(){
		this.positionArray = [];
		var $target = this.$elem.find(CLASS_POINT + CLASS_YTRANGESELECT_SELECTED_ITEM).last();
		if($target.length > 0){
			//最后一个selected_item到边框的宽度
			this.positionArray.push($target.offset().left + $target.outerWidth(true) - 6 - this.$elem.find(CLASS_POINT + CLASS_YTRANGESELECT_LABEL).offset().left - this.$elem.find(CLASS_POINT + CLASS_YTRANGESELECT_LABEL).outerWidth());
			//selected_wrap的高度
			this.positionArray.push($target.offset().top + $target.outerHeight(true) - $target.parent().offset().top);
		}else{
			this.positionArray = [0, 0];
		}
	}
	
	ytRangeSelect.prototype.createRangeSelectedList = function(that){
		//只创建一遍
		if(this.$elem.find(CLASS_POINT + CLASS_YTRANGESELECT_SELECTED_WRAP).length == 0){
			$("<div></div>").addClass(CLASS_YTRANGESELECT_SELECTED_WRAP).prependTo(this.$elem.find(CLASS_POINT + CLASS_YTRANGESELECT_BAR));
			$("<ul></ul>").addClass(CLASS_YTRANGESELECT_SELECTED_LIST).appendTo(this.$elem.find(CLASS_POINT + CLASS_YTRANGESELECT_SELECTED_WRAP))		
		}
		
		if(arguments[0][0].hasOwnProperty("name")){
			if(arguments[0][0].name != ""){
				for(var i = 0; i < arguments[0].length; i++){
					$("<li class=\"" + CLASS_YTRANGESELECT_SELECTED_ITEM + "\"value=\"" + arguments[0][i].value + "\"><span class=\"" + CLASS_ITEM_NAME + "\">" + 
					arguments[0][i].name + "</span><span class=\"" + "fa fa-remove " + CLASS_REMOVE_NAME + "\"></span></li>").css({
						height: this.opts.selectBarSize.height - parseInt($(CLASS_POINT + CLASS_YTRANGESELECT_INPUT_WRAP).css("padding-left"), 10) * 2,
						lineHeight: this.opts.selectBarSize.height - parseInt($(CLASS_POINT + CLASS_YTRANGESELECT_INPUT_WRAP).css("padding-left"), 10) * 2 + "px"
					}).appendTo(this.$elem.find(CLASS_POINT + CLASS_YTRANGESELECT_SELECTED_LIST));
				}
			}
			
		}else{
			$("<li class=\"" + CLASS_YTRANGESELECT_SELECTED_ITEM + "\"value=\"" + that.attr("value") + "\"><span class=\"" + CLASS_ITEM_NAME + "\">" + 
			that.text() + "</span><span class=\"" + "fa fa-remove " + CLASS_REMOVE_NAME + "\"></span></li>").css({
				height: this.opts.selectBarSize.height - parseInt($(CLASS_POINT + CLASS_YTRANGESELECT_INPUT_WRAP).css("padding-left"), 10) * 2,
				lineHeight: this.opts.selectBarSize.height - parseInt($(CLASS_POINT + CLASS_YTRANGESELECT_INPUT_WRAP).css("padding-left"), 10) * 2 + "px"
			}).appendTo(this.$elem.find(CLASS_POINT + CLASS_YTRANGESELECT_SELECTED_LIST));
		}
				
		this.getRangeSelectedPosition();
		this.$elem.find(CLASS_POINT + CLASS_YTRANGESELECT_SELECTED_WRAP).attr({"data-left": this.positionArray[0], "data-top": this.positionArray[1]});
	}
	
	ytRangeSelect.prototype.drawRangeSelectHtml = function(){
		if(this.$elem.find(CLASS_POINT + CLASS_YTRANGESELECT_LIST_WRAP).length == 0){
			$("<div><div class=\"contRet\"></div></div>").addClass(CLASS_YTRANGESELECT_LIST_WRAP).css({top: this.opts.selectBarSize.height}).appendTo(this.$elem.find(CLASS_POINT + CLASS_YTRANGESELECT_BAR));
			$("<ul></ul>").addClass(CLASS_YTRANGESELECT_SELECT_LIST).appendTo(this.$elem.find(CLASS_POINT + CLASS_YTRANGESELECT_LIST_WRAP));
		}
		var options = this.opts.data;
        for (var i = 0; i < options.option.length; i++) {
			$("<li></li>").addClass(CLASS_YTRANGESELECT_SELECT_ITEM).attr("value", options.value[i]).text(options.option[i]).appendTo(this.$elem.find(CLASS_POINT + CLASS_YTRANGESELECT_SELECT_LIST));
        }
		
	}
	
	ytRangeSelect.prototype.createBasicHtml = function(){
		var opt = this.opts;
		this.$elem.addClass(CLASS_YTRANGESELECT_WRAP);
		$("<span></span>").addClass(CLASS_YTRANGESELECT_LABEL).css({width: opt.labelSize.width, height: opt.labelSize.height, lineHeight: opt.labelSize.height + "px"}).text(opt.labelSize.name).appendTo(this.$elem);
		$("<div></div>").addClass(CLASS_YTRANGESELECT_BAR).css({width: opt.selectBarSize.width, height: opt.selectBarSize.height, lineHeight: opt.selectBarSize.height + "px"}).appendTo(this.$elem);
		$("<div></div>").addClass(CLASS_YTRANGESELECT_INPUT_WRAP).css({outerHeight: opt.selectBarSize.height}).appendTo(this.$elem.find(CLASS_POINT + CLASS_YTRANGESELECT_BAR));
		this.$elem.find(CLASS_POINT + CLASS_YTRANGESELECT_INPUT_WRAP).css({lineHeight: opt.selectBarSize.height - parseInt(this.$elem.find(CLASS_POINT + CLASS_YTRANGESELECT_INPUT_WRAP).css("padding-top"), 10) * 2 + "px"});
		$("<span></span>").addClass(CLASS_YTRANGESELECT_INPUT_TIP).css({
			height: opt.selectBarSize.height - parseInt(this.$elem.find(CLASS_POINT + CLASS_YTRANGESELECT_INPUT_WRAP).css("padding-top"), 10) * 2 + "px",
			lineHeight: opt.selectBarSize.height - parseInt(this.$elem.find(CLASS_POINT + CLASS_YTRANGESELECT_INPUT_WRAP).css("padding-top"), 10) * 2 + "px"
			}).text(opt.labelSize.name).appendTo(this.$elem.find(CLASS_POINT + CLASS_YTRANGESELECT_INPUT_WRAP));
		$("<i class=\"fa fa-plus\"></i>").prependTo(this.$elem.find(CLASS_POINT + CLASS_YTRANGESELECT_INPUT_TIP));
		$("<input type=\"text\" />").addClass(CLASS_YTRANGESELECT_INPUT_FIELD).css({
			height: opt.selectBarSize.height - parseInt(this.$elem.find(CLASS_POINT + CLASS_YTRANGESELECT_INPUT_WRAP).css("padding-top"), 10) * 2 + "px"
			}).attr("placeholder", opt.placeholderText).appendTo(this.$elem.find(CLASS_POINT + CLASS_YTRANGESELECT_INPUT_WRAP));
	}
	
	ytRangeSelect.prototype.dataFormat = function(response, {}, existField){
		var textField = this.opts.textField;
		var valueField = this.opts.valueField;
		for(var i = 0; i < response.length; i++) {
			var flag = true;
			for(var j = 0; j < existField.length; j++){
				if(response[i][valueField] == existField[j].value){
					flag = false;
				}
			}
			if(flag){
				this.opts.data.option.push(response[i][textField]);
				this.opts.data.value.push(response[i][valueField]);
			}
			
		}

	}
	
	ytRangeSelect.prototype.getRangeSelectData = function(url, dataField, existField){
		this.loader(url, [this.drawRangeSelectHtml], dataField, existField);
	}
	
	ytRangeSelect.prototype.reset = function(){
		this.$elem.find(CLASS_POINT + CLASS_REMOVE_NAME).trigger("click");
		return this;
	}
//	ytRangeSelect.prototype.getRangeSelectData = function(url, type, postData, existField){
//		var that = this;
//		if (typeof url == "string"){
//			$.ajax({
//		        type: type || "get",
//		        url: url,
//		        data: postData || {},
//		        dataType: "json",
//		        success: function(res){
//		        	that.dataFormat(res, existField);
//		        	that.drawRangeSelectHtml();
//		        },
//				error: function(){
//					console.log("ajax异常");
//				}
//		
//		    });
//		}else{
//			this.dataFormat(url, existField);
//		    this.drawRangeSelectHtml();
//		}
//	}
	
	extend(ytRangeSelect, BaseClass, "loader");
	function Plugin(option){
		this.each(function(){
			var $this = $(this);
			var data = $this.data("bs.ytRangeSelect");
			var options = typeof option == "object" && option;
			if(!data){
				$this.data("bs.ytRangeSelect", (data = new ytRangeSelect(this, options)));
				result = data;
			}
			if (typeof option == "string"){
				result = data[option]();
			}
		});
		return result;
	}
	$.fn.ytRangeSelect = Plugin;
	$.fn.ytRangeSelect.Constructor = ytRangeSelect;
})(jQuery, window, document);






// 关于月份： 在设置时要-1，使用时要+1
/*
$(function () {

  $('#calendar').calendar({
    ifSwitch: true, // 是否切换月份
    hoverDate: true, // hover是否显示当天信息
    backToday: true // 是否返回当天
  });

});
*/



;(function ($, window, document, undefined) {

  var Calendar = function (elem, options) {
    this.$calendar = $(elem);

    this.defaults = {
      ifHourShow: true,
      ifSwitch: true,
      hoverDate: false,
      backToday: false
    };
	this._date = new Date();
    this.opts = $.extend({}, this.defaults, options);
	this.inital();
  };
  Calendar.prototype = {
    showHoverInfo: function (obj) { // hover 时显示当天信息
      var _dateStr = $(obj).attr('data');
      var offset_t = $(obj).position().top + (this.$calendar_today.height() - $(obj).height()) / 2;
      var offset_l = $(obj).position().left + $(obj).width();
      var changeStr = addMark(_dateStr);
      var _week = changingStr(changeStr).getDay();
      var _weekStr = '';

      this.$calendar_today.show();

      this.$calendar_today
            .css({left: offset_l + 30, top: offset_t})
            .stop()
            .animate({left: offset_l + 16, top: offset_t});

      switch(_week) {
        case 0:
          _weekStr = '星期日';
        break;
        case 1:
          _weekStr = '星期一';
        break;
        case 2:
          _weekStr = '星期二';
        break;
        case 3:
          _weekStr = '星期三';
        break;
        case 4:
          _weekStr = '星期四';
        break;
        case 5:
          _weekStr = '星期五';
        break;
        case 6:
          _weekStr = '星期六';
        break;
      }

      this.$calendarToday_date.text(changeStr);
      this.$calendarToday_week.text(_weekStr);
    },

    showCalendar: function () { // 输入数据并显示
      var self = this;
      //var year = this.dateObj.getDate().getFullYear();
      //var month = this.dateObj.getDate().getMonth() + 1;
      //var dateStr = returnDateStr(this.dateObj.getDate());
      var year = this.getDate().getFullYear();
      var month = this.getDate().getMonth() + 1;
      var dateStr = returnDateStr(this.getDate());
      var firstDay = new Date(year, month - 1, 1); // 当前月的第一天

      this.$calendarTitle_text.text(year + '/' + dateStr.substr(4, 2));

      this.$calendarDate_item.each(function (i) {
        // allDay: 得到当前列表显示的所有天数
        var allDay = new Date(year, month - 1, i + 1 - firstDay.getDay());
        var allDay_str = returnDateStr(allDay);

        $(this).text(allDay.getDate()).attr('data', allDay_str);

        if (returnDateStr(new Date()) === allDay_str) {
          $(this).attr('class', 'item item-curDay');
        } else if (returnDateStr(firstDay).substr(0, 6) === allDay_str.substr(0, 6)) {
          $(this).attr('class', 'item item-curMonth');
        } else {
          $(this).attr('class', 'item');
        }
      });
      
      this.$calendarHour_item.each(function () {
      	if ($(this).hasClass('item-selected')) {
          $(this).removeClass('item-selected');
        }
      });

      // 已选择的情况下，切换日期也不会改变
      if (self.selected_data) {
        var selected_elem = self.$calendar_date.find('[data='+self.selected_data+']');

        selected_elem.addClass('item-selected');
      }

    },

	initCalencar: function(){
		var dateString = this.$calendar.val() || "";
		//var year = dateString.substr(0, 4) || this.dateObj.getDate().getFullYear();
		//var month = dateString.substr(5, 2) || returnDateStr(this.dateObj.getDate()).substr(4, 2);
		var year = dateString.substr(0, 4) || this.getDate().getFullYear();
		var month = dateString.substr(5, 2) || returnDateStr(this.getDate()).substr(4, 2);
		var day = dateString.substr(8, 2);
		var hour = dateString.substr(11, 2);
		day = parseInt(day, 10) <= 9 ? day.substr(1) : day;
		this.$calendarTitle_text.text(year + '/' + month);
		this.$calendarDate_item.each(function (i) {
	        ($(this).hasClass("item-curMonth") && $(this).text() == day) ? $(this).addClass("item-selected") : null;
		});
		      
      	this.$calendarHour_item.each(function () {
      		$(this).text() == hour ? $(this).addClass("item-selected") : null;
       });
	},
	initDate: function(){
		var dateString = this.$calendar.val() || "";
		//var year = dateString.substr(0, 4) || this.dateObj.getDate().getFullYear();
		//var month = dateString.substr(5, 2) || returnDateStr(this.dateObj.getDate()).substr(4, 2);
		
		var year = dateString.substr(0, 4) || this.getDate().getFullYear();
		var month = dateString.substr(5, 2) || returnDateStr(this.getDate()).substr(4, 2);
        //this.dateObj.setDate(new Date(year, month - 1, 1));
        this.setDate(new Date(year, month - 1, 1));
        
        this.selected_data = dateString.substr(0, 10).replace(/-/g, "");
	},
	dateObj: (function () {
	    this._date = new Date();
	    return {
	      getDate: function () {
	        return _date;
	      },
	
	      setDate: function (date) {
	        _date = date;
	      }
	    };
    })(),
    
    getDate: function(){
    	return this._date;
    },
    
    setDate: function(date){
    	this._date = date;
    },
    
    
    renderDOM: function () { // 渲染DOM
      this.$ytCalendar = $('<div class="ytCalendar"></div>');
      this.$calendar_parent = $('<div class="calendar"></div>');//add     
      this.$calendar_right = $('<div class="calendar-right"></div>');//add
      this.$calendarHour_title = $('<div class="calendarHour-title">时钟</div>');//时钟
      this.$calendar_hour = $('<ul class="calendar-hour"></ul>');//add
      this.$calendar_left = $('<div class="calendar-left"></div>');//add
      this.$calendar_title = $('<div class="calendar-title"></div>');
      this.$calendar_week = $('<ul class="calendar-week"></ul>');
      this.$calendar_date = $('<ul class="calendar-date"></ul>');
      this.$calendar_today = $('<div class="calendar-today"></div>');
      
      this.$calendar_bottom = $('<div class="calendar-bottom col-xs-12"><a class="btn btn_submit">确定</a><a class="btn btn_cancel">取消</a></div>');

      var _titleStr = '<div class="arrow">'+
                        '<span class="arrow-prev"><</span>'+
                        '<a href="#" class="title"></a>'+
                        '<span class="arrow-next">></span>'+
                      '</div>'+
                      '<a href="javascript:;" id="backToday">今日</a>';
      var _weekStr = '<li class="item">日</li>'+
                      '<li class="item">一</li>'+
                      '<li class="item">二</li>'+
                      '<li class="item">三</li>'+
                      '<li class="item">四</li>'+
                      '<li class="item">五</li>'+
                      '<li class="item">六</li>';
      var _dateStr = '';
      var _dayStr = '<i class="triangle"></i>'+
                    '<p class="date"></p>'+
                    '<p class="week"></p>';

      for (var i = 0; i < 6; i++) {
        _dateStr += '<li class="item">26</li>'+
                    '<li class="item">26</li>'+
                    '<li class="item">26</li>'+
                    '<li class="item">26</li>'+
                    '<li class="item">26</li>'+
                    '<li class="item">26</li>'+
                    '<li class="item">26</li>';
      }
      
      var hourStr = "";
	  for(var j = 0; j < 24; j++){
	  	var k = j.toString();
	  	k = k <= 9 ? 0 + k : k;
	  	hourStr += '<li class="item">' + k + '</li>';
	  }
	  this.$calendar_hour.html(hourStr);
	 
      this.$calendar_title.html(_titleStr);
      this.$calendar_week.html(_weekStr);
      this.$calendar_date.html(_dateStr);
      this.$calendar_today.html(_dayStr);

	  this.$calendar_left.append(this.$calendar_title, this.$calendar_week, this.$calendar_date);
	  if(!this.opts.ifHourShow){
	  	this.$calendar_parent.css("width", "221px");
	  	this.$calendar_left.css("width", "100%");
	  }
	  this.$calendar_right.append(this.$calendarHour_title, this.$calendar_hour);
	  //this.$calendar_parent.append(this.$calendar_left, this.$calendar_right, this.$calendar_bottom, this.$calendar_today);
	  this.$calendar_parent.append(this.$calendar_left, this.opts.ifHourShow ? this.$calendar_right : "", this.$calendar_bottom, this.$calendar_today);
	  this.$ytCalendar.insertAfter(this.$calendar);
	  this.$ytCalendar.append(this.$calendar_parent);
	  var left = this.$calendar.position().left + parseInt(this.$calendar.css("margin-left"), 10);
	  var top = this.$calendar.position().top + this.$calendar.outerHeight(true) + 2;
      this.$ytCalendar.css({top: top + "px", left: left + "px"}).attr("data-mark", Math.random());
	  
	  if(this.opts.ifHourShow){
		  this.$calendar_hour.mCustomScrollbar({
	        scrollButtons: {enable:false},
	        theme: "inset-2-dark",
	        set_height: "210px",
	        axis: "xy",
	        autoHideScrollbar: true,
	        mouseWheel:true,
	        setTop:"100px"
	
	     });
     }
     
//   var self = this;
//    setTimeout(function(){
//    	self.$calendar_hour.mCustomScrollbar("scrollTo","bottom",{scrollInertia:1000});
//    },1000);
      //var scrollTops = 300;
      //$(".mCSB_container_wrapper").css("top",(-1 * scrollTops)+"px");
      //this.$calendar_hour.parent().parent().css("top",(-1 * scrollTops)+"px");
      //console.log(3333)
      
	},
	destroy: function(){
		this.$ytCalendar.remove();
	},
	
    inital: function () { // 初始化
      var self = this;
      this.renderDOM();

      this.$calendarTitle_text = this.$calendar_title.find('.title');
      this.$backToday = this.$calendar_title.find('#backToday');
      this.$arrow_prev = this.$calendar_title.find('.arrow-prev');
      this.$arrow_next = this.$calendar_title.find('.arrow-next');
      this.$calendarDate_item = this.$calendar_date.find('.item');
      this.$calendarToday_date = this.$calendar_today.find('.date');
      this.$calendarToday_week = this.$calendar_today.find('.week');

      this.$calendarHour_item = this.$calendar_hour.find('.item');
      this.$calendarBottom_button = this.$calendar_bottom.find('a');

      this.selected_data = 0;
      

      this.initDate();
      this.showCalendar();

      this.initCalencar();
      

      if (this.opts.ifSwitch) {
        this.$arrow_prev.bind('click', function () {        	
          //var _date = self.dateObj.getDate();
          var _date = self.getDate();
          //self.dateObj.setDate(new Date(_date.getFullYear(), _date.getMonth() - 1, 1));
          self.setDate(new Date(_date.getFullYear(), _date.getMonth() - 1, 1));
          self.showCalendar();
        });

        this.$arrow_next.bind('click', function () {
          //var _date = self.dateObj.getDate();
          var _date = self.getDate();
          //self.dateObj.setDate(new Date(_date.getFullYear(), _date.getMonth() + 1, 1));
          self.setDate(new Date(_date.getFullYear(), _date.getMonth() + 1, 1));

          self.showCalendar();
        });
      }

      if (this.opts.backToday) {
        //var cur_month = self.dateObj.getDate().getMonth() + 1;
        var cur_month = self.getDate().getMonth() + 1;

        this.$backToday.bind('click', function () {
          var item_month = $('.item-curMonth').eq(0).attr('data').substr(4, 2);
          var if_lastDay = (item_month != cur_month) ? true : false;

          if (!self.$calendarDate_item.hasClass('item-curDay') || if_lastDay) {
            //self.dateObj.setDate(new Date());
            self.setDate(new Date());

            self.showCalendar();
          }
        });
      }

	  if (this.opts.hoverDate){
	  	this.$calendarDate_item.hover(function () {
	        self.showHoverInfo($(this));
	    }, function () {
	        self.$calendar_today.css({left: 0, top: 0}).hide();
	    });
	  }
     

      this.$calendarDate_item.click(function () {
        var _dateStr = $(this).attr('data');
        var _date = changingStr(addMark(_dateStr));
        var $curClick = null;

        self.selected_data = $(this).attr('data');

        //self.dateObj.setDate(new Date(_date.getFullYear(), _date.getMonth(), 1));
		self.setDate(new Date(_date.getFullYear(), _date.getMonth(), 1));
        if (!$(this).hasClass('item-curMonth')) {
          self.showCalendar();
        }

        $curClick = self.$calendar_date.find('[data='+_dateStr+']');
        $curDay = self.$calendar_date.find('.item-curDay');
        if (!$curClick.hasClass('item-selected')) {
          self.$calendarDate_item.removeClass('item-selected');

          $curClick.addClass('item-selected');
        }
		
      });
      
      //add
	  this.$calendarHour_item.click(function(){
	  	if (!$(this).hasClass('item-selected')) {
          self.$calendarHour_item.removeClass('item-selected');
          $(this).addClass('item-selected');
        }
	  	
	  });
	  
	  this.$calendarBottom_button.click(function(){
	  	var hour = "00";
	  	if($(this).hasClass("btn_submit")){
	  		//给目标对象赋值
	  		if(self.opts.ifHourShow){
	  			self.$calendarHour_item.each(function(){
		  			if ($(this).hasClass('item-selected')) {
			           hour = $(this).text();
			        }
		  		});
			  	if(self.$calendar_date.find('.item-curDay').length > 0){
			  		self.$calendar.val((addMark(self.selected_data || self.$calendar_date.find('.item-curDay').attr("data")) + " " + hour + ":00"));
			  	}else{
			  		//self.$calendar.val((addMark(self.selected_data || returnDateStr(self.dateObj.getDate())) + " " + hour + ":00"));
			  		self.$calendar.val((addMark(self.selected_data || returnDateStr(self.getDate())) + " " + hour + ":00"));
			  	}

	  		}else{
	  			if(self.$calendar_date.find('.item-curDay').length > 0){
			  		self.$calendar.val((addMark(self.selected_data || self.$calendar_date.find('.item-curDay').attr("data"))));
			  	}else{
			  		self.$calendar.val((addMark(self.selected_data || returnDateStr(self.getDate()))));
			  	}
	  		}
	  		self.$ytCalendar.hide();
	  		
	  	}else{
	  		self.$ytCalendar.hide();
	  	}
	  });
	  
	  this.$calendar.click(function(){
	  	$(".ytCalendar").each(function(){
	  		$(this).attr("data-mark") != self.$ytCalendar.attr("data-mark") ? $(this).hide() : self.$ytCalendar.toggle();
	  	});
	  	
	  	var scrollTop = 0;
	  	if(self.$calendar_hour.find("li.item-selected").length > 0){
	  		scrollTop = self.$calendar_hour.find("li.item-selected").position().top;
	  	}
	  	scrollTop = scrollTop < 90 ? 0 : scrollTop - 90;
      	self.$calendar_hour.mCustomScrollbar("scrollTo", scrollTop, {scrollInertia:10});	  		  	
	  });
    },

	
    constructor: Calendar
  };
  function Plugin(option){
		return this.each(function(){
			var $this = $(this);
			var data = $this.data("bs.ytCalendar");
			var options = typeof option == "object" && option;
			if(!data){
				$this.data("bs.ytCalendar", (data = new Calendar(this, options)));
			}
			if (typeof option == "string"){
				data[option]();
			}
		});
	}
  $.fn.ytCalendar = Plugin;
  //$.fn.ytCalendar.constructor = Calendar;
	
//$.fn.ytCalendar = function (options) {
//  var calendar = new Calendar(this, options);
//  return calendar.inital();
//  
//};


  // ========== 使用到的方法 ==========

  var dateObj = (function () {
    var _date = new Date();

    return {
      getDate: function () {
        return _date;
      },

      setDate: function (date) {
        _date = date;
      }
    }
  })();

  function returnDateStr(date) { // 日期转字符串
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();

    month = month <= 9 ? ('0' + month) : ('' + month);
    day = day <= 9 ? ('0' + day) : ('' + day);

    return year + month + day;
  };

  function changingStr(fDate) { // 字符串转日期
    var fullDate = fDate.split("-");
    
    return new Date(fullDate[0], fullDate[1] - 1, fullDate[2]);
  };

  function addMark(dateStr) { // 给传进来的日期字符串加-
    return dateStr.substr(0, 4) + '-' + dateStr.substr(4, 2) + '-' + dateStr.substring(6);
  };

  // 条件1：年份必须要能被4整除
  // 条件2：年份不能是整百数
  // 条件3：年份是400的倍数
  function isLeapYear(year) { // 判断闰年
    return (year % 4 == 0) && (year % 100 != 0 || year % 400 == 0);
  }

})(jQuery, window, document);




/*
 * 
 * 
 * 
 * $(".text").ytInputLabel({			
 *		isInputShow: true,           //ADD LABEL输入框初始化是否显示
 *		movePath: "horizontal",      //vertical horizontal 移动方向
 *		isInit: true,                //是否要初始化数据
 *		isClosed: true,              //是否要删除操作
 *		isEdit: true,                //是否要编辑操作
 *      closedWin: false,             //是否要删除提示框
 *		theme: ["blue", "red", "yellow", "green"],      //主题颜色（数组项需在css中先定义好样式）
 *      extendCallback: initTabContent, //初始化ajax回调
 *      clickCallback: utilContainer.getInitial().navClickCallback,//单击click回调
 *      addCallback: utilContainer.getInitial().addNavCallback,//添加完成后回调
 *		delCallback: utilContainer.getInitial().delNavCallback,//删除回调
 * 
 *		textField: "className",                       //isInit为true时，接口中需要的字段名称（不初始化数据不需要此项）
 *		valueField: "classId",                              //isInit为true时，接口中需要的字段名称（不初始化数据不需要此项）
 *		config: {btnName: "添加工程", placeholderText: "请再次输入属性"},
 *		initClass: {type: "get", url: "http://120.27.237.97:8077/patrosys/class/getClasses", data: {}, dateType: "json"},//初始化数据ajax配置（不初始化数据不需要此项）
 *		closedClass:{url: baseUrl + "class/delClass", keyField: ["classID"], data: {classID: ""}}, //删除时需要调用的ajax配置（不调ajax不需要此项）
 *		addClass: {url: baseUrl + "class/addClass", type: "post", keyField: ["className"], data: {className: ""}} //添加时需要调用的ajax配置（不调ajax不需要此项）
 *      editClass: {url: baseUrl + "class/updateClass", type: "post", keyField: ["classID", "className"], data: {classID: "", className: ""}}//编辑时需要调用的ajax配置（不调ajax不需要此项）
 *	});
 * 
 * 
 * 
 * 
 */
;(function ($, window, document, undefined) {
	var CLASS_POINT = ".";
	var CLASS_INPUTLABEL = "inputLabel";
	var CLASS_INPUTLABEL_LIST_WRAP = "inputLabel_list_wrap";
	var CLASS_INPUTLABEL_LIST_ITEM = "inputLabel_list_item";
	var CLASS_ITEM_NAME = "item_name";
	var CLASS_ITEM_INPUT = "item_input";
	var CLASS_ITEM_DEL = "item_del";
	var CLASS_INPUTLABEL_ADD_WRAP = "inputLabel_add_wrap";
	var CLASS_ADD_INPUT = "add_input";
	var CLASS_ADD_BUTTON = "add_button";
	var ytInputLabel = function(element, options){
		this.$elem = $(element);
		var $elem = this.$elem;
		var _this = this;
		this.defaults = {
			isInit: false,//是否要初始化数据
			isClosed: false,//是否可关闭
			isEdit: false,//是否可编辑
			movePath: "horizontal",//vertical 移动方向
			theme: [],//主题颜色
			isInputShow: false,//初始时input框是否显示
			config:{btnName: "", placeholderText: ""},
			closedWin: false,
			initClass: {},
			closedClass: {data: {}},
			editClass: {},
			addClass: {}
			
		};
		this.textField = options.textField;
		this.valueField = options.valueField;
		this.requestData = options.requestData || [];
		this.clickCallback = options.clickCallback;
		this.addCallback = options.addCallback  || function(){};
		this.extendCallback = options.extendCallback || function(){};
		this.delCallback = options.delCallback || function(){};
		this.opts = $.extend({}, this.defaults, options);
		this.create();
		//console.log(this.__proto__);
		//add INPUT show
		if(!this.opts.isInputShow){
			$elem.find(CLASS_POINT + CLASS_ADD_BUTTON).click(function(){
				$elem.find(CLASS_POINT + CLASS_ADD_INPUT).show().focus();
			});
		}
		
		//add INPUT enter
		$elem.find(CLASS_POINT + CLASS_ADD_INPUT).keydown(function(e){
			if(e.keyCode == 13){
				if($(this).val() != ""){
					_this.renderListDOM($(this).val());
					if(_this.opts.addClass.keyField && _this.opts.editClass.keyField.length != 0){
						_this.opts.addClass.data[_this.opts.addClass.keyField[0]] = $(this).val();
						_this.loader(_this.opts.addClass, [_this.addCallback]);
					}else{
						_this.addCallback();
					}
					_this.initTheme($(this).val());
				}
				$(this).val("");
			}
		});
		
		//add INPUT blur
		$elem.find(CLASS_POINT + CLASS_ADD_INPUT).blur(function(){
			if($(this).val() != ""){
				_this.renderListDOM($(this).val());
				if(_this.opts.addClass.keyField && _this.opts.editClass.keyField.length != 0){
					_this.opts.addClass.data[_this.opts.addClass.keyField[0]] = $(this).val();
					_this.loader(_this.opts.addClass, [_this.addCallback]);
				}else{
					_this.addCallback();
				}
				_this.initTheme($(this).val());
			}
			$(this).val("");
			
		});

		//dblclick
		if(this.opts.isEdit){
			$elem.on("dblclick", CLASS_POINT + CLASS_INPUTLABEL_LIST_ITEM, function(){
				var widths = $(this).width();
				$(this).find(CLASS_POINT + CLASS_ITEM_NAME).hide().end().find(CLASS_POINT + CLASS_ITEM_INPUT).show().focus().css("width", widths).val($(this).find(CLASS_POINT + CLASS_ITEM_NAME).text()).end().find(CLASS_POINT + CLASS_ITEM_DEL).hide();
			});
		}
		
		$elem.on("click", CLASS_POINT + CLASS_INPUTLABEL_LIST_ITEM, function(){
			if(_this.clickCallback){
				_this.clickCallback($(this));
			}
			
		});
		
		//edit INPUT blur
		$elem.on("blur", CLASS_POINT + CLASS_ITEM_INPUT, function(){
			$(this).hide().prev().show().end().next().hide();
			if($(this).val() != "" && $(this).val() != $(this).prev().text()){
				if(_this.opts.editClass.keyField && _this.opts.editClass.keyField.length != 0){
					_this.opts.editClass.data[_this.opts.editClass.keyField[0]] = $(this).parent().attr("data-value");
					_this.opts.editClass.data[_this.opts.editClass.keyField[1]] = $(this).val();
					_this.loader(_this.opts.editClass);
				}
				$(this).prev().text($(this).val());
			}
		});
		//for(var i = 0, len = _this.opts.closedClass.keyField.length; i < len; i++){}

		$elem.on("keydown", CLASS_POINT + CLASS_ITEM_INPUT, function(e){
			if(e.keyCode == 13){
				$(this).hide().prev().show().end().next().hide();
				if($(this).val() != "" && $(this).val() != $(this).prev().text()){
					if(_this.opts.editClass.keyField && _this.opts.editClass.keyField.length != 0){
						_this.opts.editClass.data[_this.opts.editClass.keyField[0]] = $(this).parent().attr("data-value");
						_this.opts.editClass.data[_this.opts.editClass.keyField[1]] = $(this).val();
						_this.loader(_this.opts.editClass);
					}
					$(this).prev().text($(this).val());
				}
			}
		});
		
		//hover
		if(this.opts.isClosed){		
			$elem.on("mouseover", CLASS_POINT + CLASS_INPUTLABEL_LIST_ITEM, function(){
				if(!$(this).find(CLASS_POINT + CLASS_ITEM_NAME).is(":hidden")){
					$(this).find(CLASS_POINT + CLASS_ITEM_DEL).show();
				}
			});
			$elem.on("mouseout", CLASS_POINT + CLASS_INPUTLABEL_LIST_ITEM, function(){
				if(!$(this).find(CLASS_POINT + CLASS_ITEM_NAME).is(":hidden")){
					$(this).find(CLASS_POINT + CLASS_ITEM_DEL).hide();
				}
			});
		}
		
		//del
		$elem.on("click", CLASS_POINT + CLASS_ITEM_DEL, function(){
			var $that = $(this);
//			if(_this.opts.closedClass.keyField && _this.opts.closedClass.keyField.length != 0){
//				_this.opts.closedClass.data[_this.opts.closedClass.keyField[0]] = $(this).parent().attr("data-value");
//				_this.loader(_this.opts.closedClass);
//			}
//			_this.delCallback($(this));
//			$(this).parent().remove();
			if(_this.opts.closedWin){
				$.confirmWin({
					width: 200,
					height: 150,
					title: "删除",
					left: 35,
					text: "<p style='text-align:center'>确认删除吗？</p>",
					btnVal: "删除",
					submitFn: function() {
						if(_this.opts.closedClass.keyField && _this.opts.closedClass.keyField.length != 0){
							_this.opts.closedClass.data[_this.opts.closedClass.keyField[0]] = $that.parent().attr("data-value");
							_this.loader(_this.opts.closedClass);
						}
						$that.parent().remove();
						_this.delCallback($that);
						
					},
				});
			}else{
				if(_this.opts.closedClass.keyField && _this.opts.closedClass.keyField.length != 0){
					_this.opts.closedClass.data[_this.opts.closedClass.keyField[0]] = $(this).parent().attr("data-value");
					_this.loader(_this.opts.closedClass);
				}				
				_this.delCallback($(this));
				$(this).parent().remove();
			}
			
		});
		
	};
	ytInputLabel.prototype = {
		create: function(){
			this.renderBasicDOM();
			if(this.opts.isInit){
				this.loader(this.opts.initClass, [this.renderListDOM, this.initTheme, this.extendCallback], {textField: this.textField, valueField: this.valueField, data: this.requestData});
			}
			this.initTheme();
		},
		
		initTheme: function(){
			var theme = this.opts.theme[Math.floor(Math.random() * this.opts.theme.length)];
			if(typeof arguments[0] != "object" && arguments[0] != ""){
				var item = this.$elem.find(CLASS_POINT + CLASS_INPUTLABEL_LIST_ITEM).last();
				var className = this.$elem.find(CLASS_POINT + CLASS_ADD_INPUT).attr("class").split(" ")[1];
				isRemoveClass(this.opts.theme, this.$elem.find(CLASS_POINT + CLASS_ADD_INPUT));
				this.$elem.find(CLASS_POINT + CLASS_ADD_INPUT).addClass(theme);
				item.find(CLASS_POINT + CLASS_ITEM_DEL).addClass(className);
				item.find(CLASS_POINT + CLASS_ITEM_INPUT).addClass(className);
				item.addClass(className);
			}else{
				isRemoveClass(this.opts.theme, [this.$elem.find(CLASS_POINT + CLASS_ADD_INPUT), this.$elem.find(CLASS_POINT + CLASS_ITEM_DEL), this.$elem.find(CLASS_POINT + CLASS_ITEM_INPUT), this.$elem.find(CLASS_POINT + CLASS_INPUTLABEL_LIST_ITEM)]);
				this.$elem.find(CLASS_POINT + CLASS_ADD_INPUT).addClass(theme);
				if(this.opts.isInit){
					this.$elem.find(CLASS_POINT + CLASS_ITEM_DEL).addClass(theme);
					this.$elem.find(CLASS_POINT + CLASS_ITEM_INPUT).addClass(theme);
					this.$elem.find(CLASS_POINT + CLASS_INPUTLABEL_LIST_ITEM).addClass(theme);
				}
			}
			
		},
		
		renderBasicDOM: function(){
			//添加标签DOM
			this.$inputLabel = $("<div class='" + CLASS_INPUTLABEL + "'></div>");
			this.$add = $("<div class='" + CLASS_INPUTLABEL_ADD_WRAP + "'></div>");
			this.$add_input = $("<input class='" + CLASS_ADD_INPUT + "' type='text' />").attr("placeholder", this.opts.config.placeholderText);
			this.$add_div = $("<div></div>");
			this.$add_button = $("<button class='" + CLASS_ADD_BUTTON + "' type='button'><i class='fa fa-plus'></i>" + this.opts.config.btnName + "</button>");
			
			if(this.opts.isInputShow){
				this.$add_input.show();
			}
			this.$add_div.append(this.$add_button);
			this.opts.movePath == "horizontal" ? this.$add.append(this.$add_input, this.$add_button.css("margin-left", "10px")) : this.$add.append(this.$add_input, this.$add_div.css({marginTop: "10px"})).css({"display": "block", height: "inherit", lineHeight: "inherit"});
			this.$inputLabel.append(this.$add);
			this.$elem.append(this.$inputLabel);
		},
		renderListDOM: function(){
			//标签DOM
			this.$list = $("<ul class='" + CLASS_INPUTLABEL_LIST_WRAP + "'></ul>");

			if(this.$elem.find(CLASS_POINT + CLASS_INPUTLABEL_LIST_WRAP).length == 0){
				this.$elem.find(CLASS_POINT + CLASS_INPUTLABEL).prepend(this.$list);
			}
			
			if(arguments[0] instanceof Object){
				for(var i = 0, len = arguments[0].length; i < len; i++){
					$("<li class='" + CLASS_INPUTLABEL_LIST_ITEM + "'><span class='" + CLASS_ITEM_NAME + "'>" + arguments[0][i][this.textField] + 
					"</span><input class='" + CLASS_ITEM_INPUT + "' type='text' /><i class='" + CLASS_ITEM_DEL + 
					" fa fa-close'></i></li>").attr("data-value", arguments[0][i][this.valueField]).appendTo(this.$elem.find(CLASS_POINT + CLASS_INPUTLABEL_LIST_WRAP));
				}
			}else{
				$("<li class='" + CLASS_INPUTLABEL_LIST_ITEM + "'><span class='" + CLASS_ITEM_NAME + "'>" + arguments[0] + 
				"</span><input class='" + CLASS_ITEM_INPUT + "' type='text' /><i class='" + CLASS_ITEM_DEL + 
				" fa fa-close'></i></li>").attr("data-value", arguments[0]).appendTo(this.$elem.find(CLASS_POINT + CLASS_INPUTLABEL_LIST_WRAP));
			}
			if(this.opts.movePath == "vertical"){
				this.$elem.find(CLASS_POINT + CLASS_INPUTLABEL_LIST_ITEM).css("display", "block");
			}
		},
		
		destroy: function(){
			this.$elem.find(CLASS_POINT + CLASS_INPUTLABEL).remove();
		}
		
	};
	extend(ytInputLabel, BaseClass, "loader", "dataFormat");
	function Plugin(option, o){
		return this.each(function(){
			var $this = $(this);
			var data = $this.data("bs.ytInputLabel");
			var options = typeof option == "object" && option;
			if(!data){
				$this.data("bs.ytInputLabel", (data = new ytInputLabel(this, options)));
			}
			if (typeof option == "string"){
				data[option](o);
			}
		});
	}
	$.fn.ytInputLabel = Plugin;
	$.fn.ytInputLabel.Constructor = ytInputLabel;
	
	function isRemoveClass(){
		if(arguments[0] instanceof Array && arguments[1] instanceof Array){
			for(var i = 0, len = arguments[0].length; i < len; i++){
				for(var j = 0, len = arguments[1].length; j < len; j++){
					if(arguments[1][j].hasClass(arguments[0][i])){
						arguments[1][j].removeClass(arguments[0][i]);
					}
					
				}
			}
		}else if (arguments[0] instanceof Array){
			for(var i = 0, len = arguments[0].length; i < len; i++){
				if(arguments[1].hasClass(arguments[0][i])){
					arguments[1].removeClass(arguments[0][i]);
				}
			}
		}else if (arguments[1] instanceof Array){
			for(var i = 0, len = arguments[1].length; i < len; i++){
				if(arguments[1][i].hasClass(arguments[0])){
					arguments[1][i].removeClass(arguments[0]);
				}
			}
		}else{
			if(arguments[1].hasClass(arguments[0])){
				arguments[1].removeClass(arguments[0]);
			}
		}
	}
})(jQuery, window, document);


// 有效性检验
;(function($, window, document, undefined) {


    /*************************策略对象*****************************/

    var RULES = {
        isNonEmpty: function(value, errorMsg) {
            //不能为空
            if (!value.length) {
                return errorMsg;
            }
        },
        minLength: function(value, length, errorMsg) {
            //大于
            if (value.length < length) {
                return errorMsg;
            }
        },
        maxLength: function(value, length, errorMsg) {
            //小于
            if (value.length < length) {
                return errorMsg;
            }
        },
        isMobile: function(value, errorMsg) {
            //是否为手机号码
            if (!/(^1[3|5|8][0-9]{9}$)/.test(value)) {
                return errorMsg;
            }
        },
        isEmail: function(value, errorMsg) {
            //是否为邮箱
            if (!/(^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$)/.test(value)) {
                return errorMsg;
            }
        },
        between: function(value, range, errorMsg) {
            //大于小于
            var min = parseInt(range.split('-')[0]);
            var max = parseInt(range.split('-')[1]);
            //console.log(value);
            if(value=="") return errorMsg;
            if (parseInt(value) < min || parseInt(value) > max) {
                return errorMsg;
            }
        },
        onlyEn: function(value, errorMsg) {
            //纯英文
            if (!/^[A-Za-z]+$/.test(value)) {

            }
        },
        onlyZh: function(value, errorMsg) {
            //纯中文
            if (!/^[\u4e00-\u9fa5]+$/.test(value)) {
                return errorMsg;
            }
        },
        onlyNum: function(value, errorMsg) {
            //数字包含小数
            if (!/^[0-9]+([.][0-9]+){0,1}$/.test(value)) {
                return errorMsg;
            }
        },
        onlyInt: function(value, errorMsg) {
            //整数
            if (!/^[0-9]*$/.test(value)) {
                return errorMsg;
            }
        },
        isChecked: function(value, errorMsg, el) {
            var i = 0;
            var $collection = $(el).find('input:checked');
            if(!$collection.length){
                return errorMsg;
            }
        }
    };

    /*************************Validator类*****************************/

    var setting = {
        type: null,
        onBlur: null,
        onFocus: null,
        onChange: null,
        successTip: true
    };

    var Validator = function() {
        this.cache = [];
    };

    Validator.prototype.add = function(dom, rules) {
        var self = this;
        for (var i = 0, rule; rule = rules[i++];) {
            (function(rule) {
                var strategyAry = rule.strategy.split(':');
                var errorMsg = rule.errorMsg
                self.cache.push(function() {
                    var strategy = strategyAry.shift(); // 前删匹配方式并赋值
                    strategyAry.unshift(dom.value); // 前插value值
                    strategyAry.push(errorMsg); // 后插出错提示
                    strategyAry.push(dom); // 后插dom
                    if (!RULES[strategy]) {
                        $.error('没有' + strategy + '规则，请检查命名或自行定义');
                    }
                    return {
                        errorMsg: RULES[strategy].apply(dom, strategyAry),
                        el: dom
                    };
                });
            }(rule));
        }
    };

    Validator.prototype.start = function() {
        var result;
        for (var i = 0, validatorFunc; validatorFunc = this.cache[i++];) {
            var result = validatorFunc();
            if (setting.successTip) {
                new Validator().showMsg($(result.el), '', 1);
            }
            if (result.errorMsg) {
                return result;
            }

        };
        return true;
    };

    Validator.prototype.showMsg = function(target, msg, status, callback) {
        //status
        // 0 : tip
        // 1 : success
        // 2 : error
        var _current = status ? (status > 1 ? 'error' : 'success') : 'tip';
        var errImg = "<img src=\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA3hpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpGMjNFODI5MkQ0NTdFNzExOTFBRUMyN0FCRTZDRjY5MyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpFMDk4QjJDMzgyRjcxMUU3QTVDN0I1MTVGMjdBMERFRSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpFMDk4QjJDMjgyRjcxMUU3QTVDN0I1MTVGMjdBMERFRSIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChXaW5kb3dzKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkMwMzZDRDJERjc4MkU3MTFCNjE3QkYyMEVFNkQyRDE2IiBzdFJlZjpkb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6ZTYxZDMwMWMtNWZiNC0xMWU3LWJjMjEtYTljMzI2ZTc5ZTA4Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+wSAMtQAAAhpJREFUeNq0VslKA0EQrY4LuGEOirghiHd3ES/uP+BJcTko7jui4BcIgoj7EvHggid/QEHjdnA5JDcvCh4UEQXPYmxfTybaZnoyiZqGR4fqnve6qquqwzjnFM4RabWBt7aLPeVALpCum+8BN+Bk6w5PoO+ZmQcgjsA0CrQD2Sbf3wAOYBJCPCgBEIupAtgAMoOMxB3QBJxqpOuOrwWbYnM9cBgCuRhZwAlQ579g8zt9KaadP9zpLpCnFNBjvvcPibNv5sE4kPAPAkk47NAPARiiMI0YMqCzg1hvt3kKYk3sUYxRfw+qALthW2wMUWEBsYE+I3l3p7ZG8XEqgTQcukwWKFXWwvQM0eUVri33hwjr6SIqLiJyuYlPTZs5WCJXcrJpJS+tEGOMqKiQWHMjkcej/dbIZ+cD3UWqLPAWsF0sLhNrQHnUVnsNziPiG1tWlx0th+gxDH3uQfbgMmDDEjEXYTl0ekNUU03MbrcK0bkscAw8ixxWZosv5pvbXhvItTvp7yU+t6Aif/L1JZvenETLnTSQDw9+Z4t0WnEnWnbl5xEbGVIJTIDzw9BNkbuvmBLlQqPICOILS6aFRu8e4iursvkF5EnKdg2BEl/s/jDyIeBSdlMsXOjt+rdDtGuX5YsGTyr1BycjSOJboAUHPAvlyRTejQFtQI4J8TWwBuKpkN9kP6Eq/dFPESa9MN0gPrByjYX7b8unAAMAP0mxT4OnmpUAAAAASUVORK5CYII=\'/>";
        var successImg = "<img src=\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA3hpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpGMjNFODI5MkQ0NTdFNzExOTFBRUMyN0FCRTZDRjY5MyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpDQTVGMDA0MzgyRjcxMUU3QTNDM0ZENkYyQ0EwNjlDMCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpDQTVGMDA0MjgyRjcxMUU3QTNDM0ZENkYyQ0EwNjlDMCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChXaW5kb3dzKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkMwMzZDRDJERjc4MkU3MTFCNjE3QkYyMEVFNkQyRDE2IiBzdFJlZjpkb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6ZTYxZDMwMWMtNWZiNC0xMWU3LWJjMjEtYTljMzI2ZTc5ZTA4Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+0Px0TgAAAeNJREFUeNq0lUsoRFEYx69nWXjmEZKSpbChScojKcqGzSyUIlkp8igbG2WhlCxQSGxkgZQiymtmw2w8EhtKeSXKWun6nTrquObcuXeGr/7zzZzH73/OnXO+G22apvGfijVCRNt+mRhThUpQrmx+QGfoYLEm8Gk3P0q4aMAxpAHUiQo082/QLBrDyHRsALyatITyDGdxh1ox8Vs7ooPAvaR9F3AR+cjH3GZbAwZ4SMtG+LEKozSogXzmO0bksavbwRBKDAN4iS6U3+kstueHAQ1xpL4w4Nv8sUWomO9PSvuAdQe1KMUlfBNwg1xgJilB6cuhrUI18Fgmi8szgkY18A3gTRIuLt9VkAWWi4/vm5xh6XwAMCwB96QppW+NvhYFLp5/apBFZKs7+LB05jK5XXwBNk1ql+1bCjzHBi4iXjV4tnSKIzsPpEuaLJCqyY0O4SIeVYOAZtAMsG5pcmh5LGkhDsGxanCEXjUDJ4H2S7h4rucO4C/I/6PYMVmc3TGbST5ZspMcHOFedjzxq5pi8k5KjrBUvAFP11XT+j+oRXXaaorzCckbAbwZxqnt+4ABK7J03LsA36JK5q67eWUK80HUgQo14Gs0B3jc9TvZYlQrT1AWMuXFPAO8F2prIQ0ijS8BBgD7U+x+AIjJqgAAAABJRU5ErkJggg==\'/>"
        var  pointHtml = _current === "error" ? errImg: successImg;
        if(_current == "tip") pointHtml = "";
        var $context = target.parent();
        var $msg = $context.find('.valid_message');
        var _other = target.attr('data-type') || '';
        $msg.remove();
        $context.removeClass('success tip error').addClass(_current+' '+_other).append('<span class="valid_message">' + pointHtml + '</span>');
        
        var rightMargin = 40;
        if($context.hasClass("md")){
        	rightMargin = 30;
        }else if($context.hasClass("sm")){
        	rightMargin = 20;
        }
        $context.find('.valid_message').css({
        	left: $context.innerWidth() - rightMargin,
        	lineHeight: target.css("height")
        });
        
		$context.find('.valid_message').popover({
			content: msg,
			placement: "bottom",
			trigger: "hover"
		});

    };

    var plugin = {
        init: function(options) {
            var $form = this;
            var $body = $('body');
            var $required = $form.find('.required');
            setting = $.extend(setting, options);

            if (setting.type) {
                $.extend(RULES, setting.type);
            }

            var validator = new Validator();

            $body.on({
                focus: function(event) {
                    var $this = $(this);
                    var _tipMsg = $this.attr('data-tip') || '';
                    var _status = $this.attr('data-status');
                    if (_status === undefined ||!parseInt(_status)) {
                        validator.showMsg($this, _tipMsg);
                    }
                    setting.onFocus ? setting.onFocus.call($this, arguments) : '';
                },
                blur: function(event) {
                    var $this = $(this);
                    var dataValid = $this.attr('data-valid');
                    var validLen = dataValid.split('||');
                    var errCollection = $this.attr('data-error');
                    var errMsgAry = errCollection.split("||");
                    var strategyAry, strategy, errMsg;

                    for (var i = 0; i < validLen.length; i++) {
                        strategyAry = validLen[i].split(':');
                        strategy = strategyAry.shift();
                        strategyAry.unshift(this.value);
                        strategyAry.push(errMsgAry[i]);
                        strategyAry.push(this);
                        errMsg = RULES[strategy].apply(this, strategyAry);
                        if (errMsg) {
                            $this.attr('data-status', 0);
                            validator.showMsg($this, errMsg, 2);
                            break;
                        }
                    };

                    if (!errMsg) {
                        $this.attr('data-status', 1);
                        setting.successTip ? validator.showMsg($this, '', 1) : $this.parent().find('.valid_message').remove();
                    }

                    setting.onBlur ? setting.onBlur.call($this, arguments) : '';
                },
                change: function(event) {
                    setting.onChange ? setting.onChange.call($this, arguments) : '';
                }
                
            }, '.required');


        },
        submitValidate: function(options) {
            var $form = options || this;
            var $body = $('body');
            var $required = $form.find('.required');
            var validator = new Validator();
            var $target;

            $.each($required, function(index, el) {
                var $el = $(el);
                var dataValid = $el.attr('data-valid');
                var validLen = dataValid.split('||');
                var errCollection = $el.attr('data-error');
                var errMsgAry = errCollection.split("||");
                var ruleAry = [];

                for (var i = 0; i < validLen.length; i++) {
                    ruleAry.push({
                        strategy: validLen[i],
                        errorMsg: errMsgAry[i]
                    });
                };

                validator.add(el, ruleAry);

            });

            var result = validator.start();

            if (result.errorMsg) {
                $target = $(result.el);
                //$target.attr('data-status', 0)[0].focus();
                validator.showMsg($target, result.errorMsg, 2);
                return false;
            }


            return true;
        }
    };

    $.fn.validate = function() {
        var method = arguments[0];
        if (plugin[method]) {
            method = plugin[method];
            arguments = Array.prototype.slice.call(arguments, 1);
        } else if (typeof(method) == 'object' || !method) {
            method = plugin.init;
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.validate Plugin');
            return this;
        }
        return method.apply(this, arguments);
    }

})(jQuery, window, document);
