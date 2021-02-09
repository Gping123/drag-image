/**
 * 图片拖拽效果
 */

class DragImg {
    /**
     * 选择器
     */
    selector = '';

    /**
     * 背景图片
     */
    bgImgSrc = '';

    /**
     * z-index系数
     * 默认为0
     */
    zIndex = 0;

    /**
     * 对象信息
     * 用于获取对象信息[提交数据前]
     */
    obj = {};

    /**
     * 背景图片宽度 | 默认自动
     */
    bgWidth = -1;

    /**
     * 背景图片高度 | 默认自动
     */
    bgHeight = -1;

    /**
     * 最小缩放宽度
     */
    topImgMinWidth = 30;

    /**
     * 最小缩放高度
     */
    topImgMinHeight = 30;

    /**
     * 默认高度
     */
    topImgWidth = 180;

    //++++++++++++++++++++++++基本方法+++++++++++++++++++++++++++
    /**
     * 构造方法
     * @param {string} selector 指定选择器
     * @param {string} bgImgSrc 背景图片
     * @param {number} bgWidth  背景高宽
     * @param {number} bgHeight 背景高度
     */
    constructor(selector,bgImgSrc,bgWidth,bgHeight,topImgMinWidth,topImgMinHeight) {
        this.selector = selector;
        this.bgImgSrc = bgImgSrc;
        if(bgWidth){
            this.bgWidth = bgWidth;
        }
        if(bgHeight) {
            this.bgHeight = bgHeight;
        }
        if(topImgMinWidth) {
            this.topImgMinWidth = topImgMinWidth;
        }
        if(topImgMinHeight) {
            this.topImgMinHeight = topImgMinHeight;
        }

        // 渲染
        this.initDom();
    }

    /**
     * 初始化dom
     */
    initDom() {
        this.initBaseDom();
        this.initBgDom();
        this.initPanel();
    }

    /**
     * 初始化基础Dom信息
     */
    initBaseDom() {
        $(this.selector).empty();
        this.initSeletorWH();
        // 设置统一选择器
        $(this.selector).addClass('drag-img');
    }

    /**
     * 背景节点初始化
     */
    initBgDom() {
        // 保存背景信息
        this.obj['bg'] = {
            src: this.bgImgSrc,
            width: this.bgWidth,
            height: this.bgHeight,
        };
        $(this.selector).append(`<div class="bg" style="z-index:${this.zIndex++}"><img src="${this.bgImgSrc}" /></div>`);
        this.setBgAttr();
    }

    /**
     * 可操作面板初始化
     */
    initPanel() {
        $(this.selector).append(`<div class="panel"></div>`);
    }

    /**
     * 添加项图节点
     * @param {string} src
     */
    appendTopImgDom(src){
        // 初始化图片信息
        this.obj[this.zIndex] = {
            src: src,
            width: 180,
            top: 0,
            left: 0
        };
        let panelDom = $(this.selector+' .panel');
        let ImgHtml = `<div style="top:0px;left:0px;width:${this.topImgWidth}px;z-index:${this.zIndex}" index="${this.zIndex}" class="top-img top-img-${this.zIndex}"><img src="${src}" style="width:100%;" /><div class="scale"></div></div>`;
        panelDom.append(ImgHtml);

        this.listenResizeEvent(this.zIndex);
        this.listenMoveEvent(this.zIndex);
        return this.zIndex++;
    }

    /**
     * 修改项图节点
     * @param {number} index
     * @param {string} src
     */
    changeTopImgDom(index,src,width,height) {
        let indexTopBox  = $(this.selector + ' .top-img-' + index);
        let indexTopImg  = $(this.selector + ' .top-img-' + index + ' img');
        let w = this.topImgWidth;
        let h = w;
        let coefficient = 1;
        if(width){
            coefficient = w/width;
        }
        if(height){
            h = coefficient * height;
        }
        // 设置盒子及图片默认宽高[按比例]
        indexTopBox.attr('src',src).css({
            width: w + 'px',
            height: h + 'px',
        });
        indexTopImg.attr('src',src).css({
            width: w + 'px',
            height: h + 'px',
        });
        return index;
    }

    /**
     * 监听大小改变事件
     * @param {number} index
     */
    listenResizeEvent(index) {
        let oldthis = this;
        let scale = $(this.selector+' .top-img-'+index+' .scale')[0];
        let box = $(this.selector+' .top-img-'+index)[0];
        let fa = $(this.selector)[0];
        // 图片缩放效果
        scale.onmousedown = function (e) {
            // 阻止冒泡,避免缩放时触发移动事件
            e.stopPropagation();
            e.preventDefault();
            var pos = {
                'w': box.offsetWidth,
                'h': box.offsetHeight,
                'x': e.clientX,
                'y': e.clientY
            };
            fa.onmousemove = function (ev) {
                ev.preventDefault();
                // 设置图片的最小缩放为30*30
                var w = Math.max(oldthis.topImgMinWidth, ev.clientX - pos.x + pos.w)
                var h = Math.max(oldthis.topImgMinHeight,ev.clientY - pos.y + pos.h)

                // 设置图片的最大宽高
                w = w >= fa.offsetWidth-box.offsetLeft ? fa.offsetWidth-box.offsetLeft : w
                h = h >= fa.offsetHeight-box.offsetTop ? fa.offsetHeight-box.offsetTop : h

                // 设置图片父节点大小
                box.style.width = w + 'px';
                box.style.height = h + 'px';

                // 设置图片大小
                $(box).find('img').css({
                    width:  w + 'px',
                    height:  h + 'px'
                });
            }
            // 超出事件
            fa.onmouseleave = function () {
                oldthis.setTopImgAttr(index);
                fa.onmousemove=null;
                fa.onmouseup=null;
            }
            // 鼠标弹起事件
            fa.onmouseup=function() {
                oldthis.setTopImgAttr(index);
                fa.onmousemove=null;
                fa.onmouseup=null;
            }
        }
    }

    /**
     * 监听移动位置事件
     * @param {number} index
     */
    listenMoveEvent(index) {
        let oldthis = this;
        let fa = $(this.selector)[0];
        let box = $(this.selector+' .top-img-'+index)[0];

        // 图片移动效果
        box.onmousedown=function(ev) {
            var oEvent = ev;
            // 浏览器有一些图片的默认事件,这里要阻止
            oEvent.preventDefault();
            var disX = oEvent.clientX - box.offsetLeft;
            var disY = oEvent.clientY - box.offsetTop;
            fa.onmousemove=function (ev) {
                oEvent = ev;
                oEvent.preventDefault();
                var x = oEvent.clientX -disX;
                var y = oEvent.clientY -disY;

                // 图形移动的边界判断
                x = x <= 0 ? 0 : x;
                x = x >= fa.offsetWidth-box.offsetWidth ? fa.offsetWidth-box.offsetWidth : x;
                y = y <= 0 ? 0 : y;
                y = y >= fa.offsetHeight-box.offsetHeight ? fa.offsetHeight-box.offsetHeight : y;
                box.style.left = x + 'px';
                box.style.top = y + 'px';
            }
            // 图形移出父盒子取消移动事件,防止移动过快触发鼠标移出事件,导致鼠标弹起事件失效
            fa.onmouseleave = function () {
                oldthis.setTopImgAttr(index);
                fa.onmousemove=null;
                fa.onmouseup=null;
            }
            // 鼠标弹起后停止移动
            fa.onmouseup=function() {
                oldthis.setTopImgAttr(index);
                fa.onmousemove=null;
                fa.onmouseup=null;
            }
        }
    }

    /**
     * 设置图片属性
     * @param {number} index
     */
    setTopImgAttr(index) {
        let box = this.getIndexDom(index)[0] || null;
        let src = this.obj[index].src;
        let obj = {
            src: src,
            width: box.offsetWidth,
            height: box.offsetHeight,
            left: box.offsetLeft,
            top: box.offsetTop,
        };
        this.obj[index] = obj;
    }

    /**
     * 设置容器宽高
     */
    initSeletorWH() {
        this.checkImg(this.bgImgSrc)
        .then((img)=>{
            this.bgWidth = this.bgWidth <= -1 ? img.width : this.bgWidth;
            this.bgHeight = this.bgHeight <= -1 ? img.height : this.bgHeight;
            $(this.selector).css({
                'width': this.bgWidth + 'px',
                'height': this.bgHeight + 'px',
            });
            this.getBgDom().css({
                'width': this.bgWidth + 'px',
                'height': this.bgHeight + 'px',
            });
        })
    }

    /**
     * 验证图片
     * @param {string} src 图片地址
     * @param {callback} success 验证通过回调
     * @param {callback} error 验证失败回调
     */
    checkImg(src) {
        return new Promise((resolve, reject) => {
            var ImgObj = new Image();
            ImgObj.src = src;
            ImgObj.onload = ( res) => {
                resolve(res);
            };
            ImgObj.onerror = (err) => {
                reject(err)
            };
        });
    }

    /**
     * 获取背景节点
     */
    getBgDom(){
        return $(this.selector+' .bg');
    }

    /**
     * 设置背景属性
     */
    setBgAttr() {
        let bgDom = this.getBgDom();
        if(this.bgWidth == -1) {
            this.bgWidth = bgDom.find('img').width();
        }
        if(this.bgHeight == -1) {
            this.bgHeight = bgDom.find('img').width();
        }
    }

    //========================常调方法===========================
    
    /**
     * 添加项图方法
     * @param {string} src
     */
    appendTopImg(src) {
        // 添加到列表中
        this.checkImg(src).then(()=>{
            this.appendTopImgDom(src);
        }).catch(()=>{});
        return this.zIndex;
    }

    /**
     * 改变图片路径
     * @param {number} index
     * @param {string} src
     */
    changeTopImg(index,src) {
        // 更新图片
        this.checkImg(src).then((img)=>{
            this.obj[index].src = src;
            this.changeTopImgDom(index,src,img.width,img.height);
        });
        return index;
    }

    /**
     * 修改背景
     * @param src
     */
    changeBgImg(src) {
        this.checkImg(src).then(()=>{
            this.obj['bg'].src = src;
            $(this.selector+' .bg img').prop('src',src);
        });
    }

    /**
     * 删除图片
     * @param index
     */
    deleteTopImg(index) {
        delete this.obj[index];
        $(this.selector+' .top-img-'+index).remove();
    }

    /**
     * 获取指定索引节点
     * @param {number} index 
     */
    getIndexDom(index) {
        return $(this.selector+' .top-img-'+index);
    }

    /**
     * 移动指定图片
     * @param {number} index 
     * @param {number} x 
     * @param {number} y 
     */
    moveTopImg(index,x,y) {
        let indexDom = this.getIndexDom(index);

        // 获取图片大小 禁止移动出背景
        let imgW = indexDom.width();
        let imgH = indexDom.height();

        x = (imgW + x) > this.bgWidth ? (this.bgWidth - imgW) : (x < 0 ? 0 : x);
        y = (imgH + y) > this.bgHeight ? (this.bgHeight - imgH) : (y < 0 ? 0 : y);

        indexDom.css({
            top: y+'px',
            left:  x + 'px'
        });
        this.setTopImgAttr(index);
    }

    /**
     * 设置指定图片宽高
     * @param {number} index 
     * @param {number} w 
     * @param {number} h 
     */
    setTopImgSize(index,w,h) {
        let indexDom = this.getIndexDom(index);
        // 禁止超过最小大小
        w = (w < this.topImgMinWidth || w < 0) ? this.topImgMinWidth : (w > this.bgWidth ? this.bgWidth : w);
        h = (h < this.topImgMinHeight || h < 0) ? this.topImgMinHeight : (h > this.bgHeight ? this.bgHeight : h);
        indexDom.css({
            width: w+'px',
            height: h + 'px'
        });
        indexDom.find('img').css({
            width: w+'px',
            height: h + 'px'
        });
        this.setTopImgAttr(index);
    }

}
