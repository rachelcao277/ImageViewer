class ImageViewer {
    constructor(options) {
        // 照片查看容器
        this.canvas = options.canvas;
        // 容器宽度
        this.cWidth = options.width;
        // 容器高度
        this.cHeight = options.height;
        // 图片容器
        this.image = null;
        // 缩略图容器
        this.scaleCanvas = options.scaleCanvas;
        // 缩放比例面板
        this.scalePanel = options.scalePanel;
        // 画布上下文
        this.ctx = this.canvas.getContext("2d");
        // 缩略图画布
        this.sCanvas = null;
        // 缩略图画布上下文
        this.sCtx = null;
        // 缩略图方框
        this.scaleRect = null;
        // 存储画布数据容器
        this.bCanvas = null;
        // 存储画布数据容器上下文
        this.bCtx = null;
        // 缩略图宽度
        this.sWidth =  0;
        // 缩略图高度
        this.sHeight = 0;
        // 图片宽度
        this.iWidth = 0;
        // 图片高度
        this.iHeight = 0;
        // 图片拖拽至边缘的最小限制
        this.appearSize = options.appearSize ? options.appearSize : 180;
        // 缩放步进
        this.scaleStep = options.scaleStep ? options.scaleStep : 0.1;
        // 最小缩放比例
        this.minScale = options.minScale ? options.minScale : 0.2;
        // 最大缩放比例
        this.maxScale = options.maxScale ? options.maxScale : 8;
        // 图片在画布中的横坐标
        this.x = 0;
        // 图片在画布中的纵坐标
        this.y = 0;
        // 拖动过程中，鼠标前一次移动的横坐标
        this.prevX = 0;
        // 拖动过程中，鼠标前一次移动的横坐标
        this.prevY = 0;
        // 缩放比例
        this.scale = 0;
        // 鼠标在图片中的横坐标
        this.ix = 0;
        // 鼠标在图片中的纵坐标
        this.iy = 0;

        this.Initial();
    }

    // 初始化参数信息
    Initial() {
        this.canvas.width = this.cWidth;
        this.canvas.height = this.cHeight;
        this.scaleRect = document.createElement("div");
        this.scaleRect.className = "scaleWindow";
        Object.assign(this.scaleRect.style, {position: "absolute", border: "1px solid red", boxSizing: "border-box"});
        this.scaleCanvas.appendChild(this.scaleRect);
        this.handleMouseDown = this.HandleMouseDown.bind(this);
        this.handleScaleCanvasClick = this.HandleScaleCanvasClick.bind(this);
        this.handleMouseWheel = this.HandleMouseWheel.bind(this);
        this.canvas.addEventListener('mousedown', this.handleMouseDown);
        this.scaleCanvas.addEventListener('click', this.handleScaleCanvasClick);
        this.canvas.addEventListener('mousewheel', this.handleMouseWheel);
    }

    // 设置加载图片
    SetImage(src) {
        this.image = new Image();
        this.image.crossOrigin = "anonymous";
        this.image.src = src;
        // 监听图片加载
        this.image.addEventListener('load', () => {
            this.iWidth = this.image.width;
            this.iHeight = this.image.height;
            // 创建缩略图面板
            this.sCanvas = document.createElement("canvas");
            this.sCtx = this.sCanvas.getContext("2d");
            this.sCanvas.style.display = "block";
            this.sWidth = this.sCanvas.width = parseInt(this.scaleCanvas.getBoundingClientRect().width);
            this.sHeight = parseInt(this.sWidth * this.iHeight / this.iWidth);
            this.sCanvas.height = this.sHeight;
            this.scaleCanvas.appendChild(this.sCanvas);

            // 创建数据存储面板
            this.bCanvas = document.createElement("canvas");
            this.bCanvas.width = this.iWidth;
            this.bCanvas.height = this.iHeight;
            this.bCanvas.style.display = "none";
            this.bCtx = this.bCanvas.getContext("2d");
            this.bCtx.drawImage(this.image, 0, 0, this.iWidth, this.iHeight);
            document.body.appendChild(this.bCanvas);

            // 设置缩放比例
            this.scale = 1;

            // 初始化自适应缩放图片并居中
            if (this.iWidth > this.cWidth || this.iHeight > this.cHeight) {
                this.scale = this.iWidth - this.cWidth > this.iHeight - this.cHeight ? this.cWidth / this.iWidth : this.cHeight / this.iHeight;
            }
            let initImgX = (this.cWidth - this.iWidth * this.scale) / 2;
            let initImgY = (this.cHeight - this.iHeight * this.scale) / 2;
            this.SetXY(initImgX, initImgY);

            this.UpdateCanvas();
        })
    }

    /**
     * 更新画布操作数据函数
     */
    UpdateCanvas() {
        this.ctx.clearRect(0, 0, this.cWidth, this.cHeight);
        this.sCtx.clearRect(0, 0, this.sWidth, this.sHeight);

        this.ctx.drawImage(this.bCanvas, -this.x/this.scale, -this.y/this.scale, this.cWidth/this.scale, this.cHeight/this.scale, 0, 0, this.cWidth, this.cHeight);
        this.sCtx.drawImage(this.bCanvas, 0, 0, this.iWidth, this.iHeight, 0, 0, this.sWidth, this.sHeight);

        // 将缩略图方框区域绘制到画布
        let width = this.sWidth * this.cWidth / this.iWidth / this.scale;
        let height = width * this.cHeight / this.cWidth;
        let left = -this.x * this.sWidth / (this.iWidth * this.scale);
        let top = -this.y * this.sWidth / (this.iWidth * this.scale);
        // 将方框宽度固定在缩略图面板中
        if (width >= this.sWidth) {
            width = this.sWidth;
            left = 0;
        }
        else if (width + left >= this.sWidth) {
            width = this.sWidth - left;
            left = this.sWidth - width;
        }
        else if (left <= 0) {
            width += left;
            left = 0;
        }

        // 将方框高度固定在缩略图面板中
        if (height >= this.sHeight) {
            height = this.sHeight;
            top = 0;
        }
        else if (height + top >= this.sHeight) {
            height = this.sHeight - top;
            top = this.sHeight - height;
        }
        else if (top <= 0){
            height += top;
            top = 0;
        }

        this.scaleRect.style.left = left + "px";
        this.scaleRect.style.top = top + "px";
        if (width !== Number(this.scaleRect.style.width)) {
            this.scaleRect.style.width = width + "px";
            this.scaleRect.style.height = height + "px";
        }

        // 输出当前缩放比例
        this.scalePanel.innerText = (this.scale * 100).toFixed(2) + "%";
    }


    /**
     * 鼠标点击函数
     */
    HandleMouseDown(e) {
        this.GetMouseInImageLocation(e);
        let prevP = this.CalculateChange(e, this.canvas);
        this.prevX = prevP.x;
        this.prevY = prevP.y;
        this.handleDrag = this.HandleDrag.bind(this);
        this.handleMouseUp = this.HandleMouseUp.bind(this);
        this.canvas.addEventListener('mousemove', this.handleDrag);
        this.canvas.addEventListener('mouseup', this.handleMouseUp);
        this.UpdateCanvas();
    }

    /**
     * 画布图片拖拽事件函数
     */
    HandleDrag(e) {
        let p = this.CalculateChange(e, this.canvas);
        let offsetX = (p.x - this.prevX);
        let offsetY = (p.y - this.prevY);
        this.SetXY(this.x + offsetX, this.y + offsetY);
        this.prevX = p.x;
        this.prevY = p.y;
        this.UpdateCanvas();
    }

    /**
     * 移除鼠标拖拽移动监听函数
     * @constructor
     */
    HandleMouseUp() {
        this.canvas.removeEventListener('mousemove', this.handleDrag);
        this.canvas.removeEventListener('mouseup', this.handleMouseUp);
    };

    /**
     * 滚动条缩放事件
     * @param e
     * @constructor
     */
    HandleMouseWheel(e) {
        let wd = e.wheelDelta;
        let newScale = this.scale * (1 + (wd > 0 ? this.scaleStep : -this.scaleStep));
        newScale = newScale < this.minScale ? this.minScale : newScale;
        newScale = newScale > this.maxScale ? this.maxScale : newScale;

        if (newScale !== this.scale) {
            let p = this.CalculateChange(e, this.canvas);
            let newX = (this.x - p.x) * newScale / this.scale + p.x;
            let newY = (this.y - p.y) * newScale / this.scale + p.y;
            this.scale = newScale;
            this.SetXY(newX, newY);
        }
    }

    /*
		获取鼠标当前所在图片中的位置
	 */
    GetMouseInImageLocation(location){
        let prevP = this.CalculateChange(location, this.canvas);
        // 鼠标点击在当前图像的位置
        this.ix = Math.floor((prevP.x -this.x) / this.scale);
        if (this.ix < 0) {
            this.ix = 0;
        }
        else if (this.ix > this.iWidth) {
            this.ix = this.iWidth;
        }
        this.iy = Math.floor((prevP.y -this.y) / this.scale);
        if (this.iy < 0) {
            this.iy = 0;
        }
        else if (this.iy > this.iHeight) {
            this.iy = this.iHeight;
        }
    }

    /**
     * 缩略图画布点击函数
     * @param e
     * @constructor
     */
    HandleScaleCanvasClick(e){
        let p = this.CalculateChange(e, this.scaleCanvas);
        let tmpX = this.cWidth / 2 - this.iWidth * this.scale * p.x / this.sWidth;
        let tmpY = this.cHeight / 2 - this.iWidth * this.scale * p.x / this.sWidth * p.y / p.x;
        this.SetXY(tmpX, tmpY);
    }

    /**
     * 显示图片位置，防止图片被拖出画布
     * @param vx
     * @param vy
     * @constructor
     */
    SetXY(vx, vy){
        if (vx < this.appearSize - this.iWidth * this.scale) {
            this.x = this.appearSize - this.iWidth * this.scale;
        }
        else if (vx > this.cWidth - this.appearSize) {
            this.x = this.cWidth - this.appearSize;
        }
        else{
            this.x = vx;
        }

        if (vy < this.appearSize - this.iHeight * this.scale) {
            this.y = this.appearSize - this.iHeight * this.scale;
        }
        else if (vy > this.cHeight - this.appearSize) {
            this.y = this.cHeight - this.appearSize;
        }
        else {
            this.y = vy;
        }

        this.UpdateCanvas();
    }

    CalculateChange(e, container, skip) {
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        const x = typeof e.pageX === "number" ? e.pageX : e.touches[0].pageX;
        const y = typeof e.pageY === "number" ? e.pageY : e.touches[0].pageY;
        let left = x - (container.getBoundingClientRect().left + window.pageXOffset);
        let top = y - (container.getBoundingClientRect().top + window.pageYOffset);
        if (left < 0) {
            left = 0;
        }
        else if (left > containerWidth) {
            left = containerWidth;
        }

        if (top < 0) {
            top = 0;
        }
        else if (top > containerHeight) {
            top = containerHeight;
        }

        return {
            x: left,
            y: top
        }
    }
}