# ImageViewer

# 使用说明
Tip：采用原生ES6写法，在项目用运行可能需要[babel](https://www.babeljs.cn/)进行转换

Demo地址：https://rachelcao277.github.io/ImageViewer

HTML示例如下(~~位置和风格可以按自己需求来~~)

```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>ImageViewer</title>
    <link rel="stylesheet" href="css/ImageViewer.css">
</head>
<body>
    <div class="imageViewerContainer">
        <canvas id="imageViewer"></canvas>
        <div class="scaleBox">
            <div class="scaleCanvas"></div>
            <div class="scalePanel"></div>
        </div>
    </div>

    <script src="js/ImageViewer.js"></script>

    <script>
        window.onload = function() {
            const containerWidth = document.querySelector('.imageViewerContainer').clientWidth;
            const containerHeight = document.querySelector('.imageViewerContainer').clientHeight;
            const MyImageViewer = new ImageViewer({
                canvas: document.querySelector('#imageViewer'),
                width: containerWidth,
                height: containerHeight,
                scaleCanvas: document.querySelector('.scaleCanvas'),
                scalePanel: document.querySelector('.scalePanel')
            });

            MyImageViewer.SetImage('./images/view1.jpg');
        };
    </script>
</body>
</html>
```

**API属性说明**

属性 | 说明 | 类型 | 默认值
---|---|---|---
canvas | 图片查看器容器节点 | Element | 必须
width | 图片查看器容器宽度 | Number | 必须
height | 图片查看器容器高度 | Number | 必须
scaleCanvas | 缩略图容器节点 | Element | 必须
scalePanel | 缩放比例数值面板 | Element | 必须
appearSize | 图片拖拽至边缘的最小限制 | Number | 180
scaleStep | 缩放步进 | Number | 0.1
minScale | 最小缩放比例 | Number | 0.2
maxScale | 最大缩放比例 | Number | 8

