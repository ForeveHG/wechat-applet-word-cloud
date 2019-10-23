function Bounds(min, max) {
  this.min = min;
  this.max = max;
}

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    width: {
      type: Number | String,
      value: "100%"
    },
    height: {
      type: Number,
      value: 200
    },
    minFont: {
      type: Number,
      value: 12
    },
    maxFont: {
      type: Number,
      value: 35
    },
    fontColor: {
      type: String,
      value: "#f4347a"
    },
    wordsCloud: {
      type: Array,
      value: [],
      observer(words) {
        this.texts = [];
        this.count = 0;
        if (words.length > 0) {
          //排序
          words.sort((a, b) => {
            return parseFloat(b.count) - parseFloat(a.count)
          })
          const percent = this.data.maxFont / words[0].count
          words.forEach(item => {
            let count = isNaN(parseFloat(item.count)) ? this.data.minFont : parseFloat(item.count);
            let size = count * percent;
            item.fontSize = size < 10 ? size + 10 : size;
            return item
          })
          this.words = words;
          this.ctx.clearRect(0, 0, this.width, this.height)
          this.draw(this.words)
        } else {
          wx.createCanvasContext('canvas', this).draw()
        }
      }
    }
  },

  attached() {
    this.ctx = wx.createCanvasContext('canvas', this);
    this.height = this.data.height;
    this.width = wx.getSystemInfoSync().screenWidth - 48;
    this.texts = [];
    this.count = 0;
    this.canvasBound = new Bounds({
      x: 0,
      y: 0
    }, {
      x: this.width,
      y: this.height
    })
  },

  /**
   * 组件的方法列表
   */
  methods: {
    draw(words) {
      words.forEach((item, index) => {
        if (index == 0) this.isDraw(item, true)
        else this.isDraw(item)
      })
      this.ctx.draw();
    },

    isDraw(item, center) {
      let bound = this.createText(item, center)
      for (let i = 0; i < this.texts.length; i++) {
        let hasDraw = this.texts[i];
        if (this.intersects(hasDraw)) {
          this.count++;
          if (this.count < 100) this.isDraw(item)
          return;
        }
      }
      this.drawText(item.word, item.count)
      this.texts.push(new Bounds(this.min, this.max))
    },

    drawText(word, count) {
      this.ctx.textAlign = "left";
      this.ctx.textBaseline = "top";
      this.ctx.setFillStyle(this.data.fontColor);
      this.ctx.fillText(word, this.min.x, this.min.y);
    },

    //生成文本坐标
    createText(item, center, random) {
      let textRect = this.getTextRect(item)
      if (center) {
        this.min = {
          x: this.width / 2 - textRect.width / 2,
          y: this.height / 2 - textRect.height / 2
        }
      } else {
        this.min = this.getRandom()
      }
      this.max = {
        x: this.min.x + textRect.width,
        y: this.min.y + textRect.height
      }
      const bound = new Bounds(this.min, this.max);
      if (this.inAll(bound)) return;
      else this.createText(item)
    },

    //获取随机值
    getRandom() {
      return {
        x: Math.floor(Math.random() * this.width),
        y: Math.floor(Math.random() * this.height)
      }
    },

    //获取文字宽高
    getTextRect(item) {
      this.ctx.setFontSize(item.fontSize)
      let textWidth = this.ctx.measureText(item.word).width //文字所占宽度
      return {
        width: textWidth + 2,
        height: item.fontSize
      }
    },

    //检测是否有碰撞， 返回true是有碰撞
    intersects(bound) {
      var min = this.min,
        max = this.max,
        min2 = bound.min,
        max2 = bound.max,
        xIntersects = max2.x >= min.x && min2.x <= max.x,
        yIntersects = max2.y >= min.y && min2.y <= max.y;
      return xIntersects && yIntersects;
    },

    inAll(bound) {
      var min = bound.min,
        max = bound.max,
        start = this.canvasBound.min,
        end = this.canvasBound.max;
      return min.x >= start.x && min.y >= start.y && max.x <= end.x && max.y <= end.y
    }
  }
})